---
type: post
title: Home Lab
description: Laboratorio para practicar
lang: es
draft: false
featured: true
---

![Home Lab](@images/blog/homelab/homelab.png)

## Arquitectura de red

El laboratorio SOC Home Lab está implementado sobre Oracle VirtualBox y utiliza dos tipos de conectividad de red:
- **Host-Only Network**: red interna utilizada para la comunicación entre las máquinas virtuales y el host físico.
- **NAT**: interfaz utilizada para proporcionar acceso a Internet a las máquinas virtuales.
La red Host-Only utiliza el segmento `192.168.56.0/24`, mientras que las interfaces NAT utilizan el segmento `10.0.3.0/24`.

El entorno cuenta actualmente con tres máquinas virtuales:

1. **SOC-SERVER**: servidor Ubuntu Server 24.04 que ejecuta Wazuh en una instalación All-in-One.
2. **DC01**: servidor Windows Server 2025 que proporciona Active Directory Domain Services y DNS para el dominio `corp.lab`.
3. **WIN11-01**: endpoint Windows 11 Pro unido al dominio, monitorizado por Wazuh y utilizado para simular recursos compartidos corporativos mediante SMB.

La red Host-Only permite que Wazuh supervise los endpoints y que las máquinas Windows se comuniquen con el controlador de dominio. NAT proporciona conectividad externa sin utilizar la red Host-Only como ruta de salida.

## Configuración del servicio DNS

El laboratorio utiliza un controlador de dominio basado en Windows Server 2025, denominado DC01, que también cumple la función de servidor DNS para la red corporativa.

El servidor DNS permite resolver los nombres de los equipos y servicios pertenecientes al dominio `corp.lab`. Esta función es fundamental para Active Directory, ya que los equipos necesitan localizar al controlador de dominio y acceder a los servicios de autenticación y administración centralizada.

El endpoint WIN11-01 dispone de dos interfaces de red:

| Interfaz | Dirección IPv4 | Servidor DNS |
| - | - | - |
| Host-Only | 192.168.56.101 | 192.168.56.10 (DC01) |
| NAT | 10.0.3.15 | 186.130.128.250 |
| NAT | 10.0.3.15 | 186.130.129.250 |

La interfaz Host-Only utiliza el servidor DNS interno para resolver los recursos del dominio corporativo. La interfaz NAT utiliza servidores DNS externos para la resolución de nombres en Internet.

Esta separación permite mantener los servicios de Active Directory dentro de la red del laboratorio y proporcionar conectividad externa a las máquinas virtuales.

## Servidor central de monitoreo: SOC-SERVER

El servidor SOC-SERVER constituye el componente central de la infraestructura de monitoreo del laboratorio SOC Home Lab. Su función principal es recopilar, procesar, almacenar y visualizar los eventos de seguridad generados por los diferentes equipos de la red.

El servidor utiliza Ubuntu Server 26.04.1 LTS y ejecuta Wazuh 4.14.9 en una arquitectura All-in-One. Esta implementación concentra los principales componentes de Wazuh en una única máquina virtual, simplificando la administración y permitiendo centralizar las tareas de monitoreo.

### Recursos de hardware virtual

La máquina virtual dispone de cuatro procesadores virtuales, 12 GB de memoria RAM y un disco virtual de 80 GB. El almacenamiento utiliza Logical Volume Manager (LVM), con un volumen lógico de 70 GB asignado al sistema de archivos raíz.

También dispone de una partición Swap de 4 GB, utilizada como memoria de intercambio cuando el sistema necesita gestionar presión sobre la memoria RAM.

```bash
free -h
```

```plaintext
               total        used        free      shared  buff/cache   available
Mem:            11Gi       3.0Gi       633Mi       1.7Mi       7.8Gi       8.1Gi
Swap:          4.0Gi       1.5Mi       4.0Gi
```

```bash
nproc
```

```plaintext
4
```

```bash
lsblk
```

```plaintext
NAME                      MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
loop0                       7:0    0 66.8M  1 loop /snap/core24/1643
loop1                       7:1    0  1.5M  1 loop /snap/hwctl/123
loop2                       7:2    0  1.5M  1 loop /snap/hwctl/131
loop3                       7:3    0 50.1M  1 loop /snap/snapd/27710
loop4                       7:4    0 44.7M  1 loop /snap/snapd/28254
sda                         8:0    0   80G  0 disk
├─sda1                      8:1    0    1M  0 part
├─sda2                      8:2    0    2G  0 part /boot
└─sda3                      8:3    0   78G  0 part
  └─ubuntu--vg-ubuntu--lv 252:0    0   70G  0 lvm  /
sr0                        11:0    1 1024M  1 rom
```

```bash
lsb_release -a
```

```plaintext
No LSB modules are available.
Distributor ID: Ubuntu
Description:    Ubuntu 26.04.1 LTS
Release:        26.04
Codename:       resolute
```

### Conectividad de red

El servidor utiliza dos interfaces de red:

- **Host-Only (192.168.56.20)**: permite la comunicación con los endpoints y el controlador de dominio.
- **NAT (10.0.3.15)**: proporciona conectividad a Internet para las actualizaciones y otros servicios externos.

Esta configuración permite mantener la comunicación interna del laboratorio separada de la conectividad externa.

### Configuración

```bash
sudo nano /etc/netplan/00-installer-config.yaml
```

```yaml
network:
  version: 2
  ethernets:
    enp0s3:
      dhcp4: false
      addresses:
        - 192.168.56.20/24
      match:
        macaddress: 08:00:27:b5:8b:50
      set-name: enp0s3

    enp0s8:
      accept-ra: true
      dhcp4: true
      dhcp6: true
```

```bash
sudo netplan generate
```

Aplicar temporalmente la configuración y revertirla automáticamente si no se confirman los cambios

```bash
sudo netplan try
```

Iniciar el servicio ssh

```bash
sudo systemctl start ssh
```

Verificar que escuche en el puerto 22

```bash
sudo ss -tlnp | grep ':22'
```

Instalar Wazuh

```bash
curl -fSLO https://packages.wazuh.com/4.14/wazuh-install.sh
```

```bash
sudo bash wazuh-install.sh -a
```

Comprobar el estado de los servicios de Wazuh

```bash
sudo systemctl status wazuh-indexer wazuh-manager wazuh-dashboard filebeat --no-pager
```

## Controlador de dominio: DC01

DC01 es el controlador de dominio principal de la infraestructura corporativa simulada. Ejecuta Windows Server 2025 Standard Evaluation y proporciona los servicios centrales de autenticación, administración de identidades y resolución de nombres.

El servidor administra el dominio corp.lab, implementado mediante Active Directory Domain Services (AD DS). Esta estructura permite centralizar la administración de usuarios, grupos y equipos, reproduciendo un entorno habitual en redes empresariales.

El servicio DNS también se ejecuta en este servidor y permite que los equipos del dominio localicen los recursos y servicios de Active Directory.

### Recursos de hardware virtual

La máquina virtual dispone de dos procesadores virtuales, 8 GiB de memoria RAM y un disco virtual de aproximadamente 80 GB. Utiliza arquitectura de 64 bits.

```powershell
Get-CimInstance Win32_ComputerSystem | Select-Object TotalPhysicalMemory
```

```powershell
TotalPhysicalMemory
-------------------
         8589463552
```

```powershell
Get-CimInstance Win32_Processor | Select-Object Name, NumberOfCores, NumberOfLogicalProcessors
```

```powershell
Name                                     NumberOfCores NumberOfLogicalProcessors
----                                     ------------- -------------------------
Intel(R) Core(TM) i5-10400 CPU @ 2.90GHz             2                         2
```

```powershell
Get-CimInstance Win32_DiskDrive | Select-Object Model, Size
```

```powershell
Model                Size
-----                ----
VBOX HARDDISK 85896599040
```

```powershell
Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, BuildNumber, OSArchitecture
```

```powershell
Caption                                           Version    BuildNumber OSArchitecture
-------                                           -------    ----------- --------------
Microsoft Windows Server 2025 Standard Evaluation 10.0.26100 26100       64-bit
```

### Conectividad de red

DC01 cuenta con dos interfaces de red:

- **Host-Only (192.168.56.10)**: utilizada para la comunicación con los equipos de la red corporativa simulada.
- **NAT (10.0.3.15)**: utilizada para acceder a servicios externos e Internet.
Integración con el SIEM

El servidor tiene instalado Wazuh Agent 4.14.9, que permite enviar eventos y registros al servidor central SOC-SERVER. Esto proporciona visibilidad sobre la actividad del controlador de dominio, incluyendo eventos de autenticación y operaciones relacionadas con Active Directory.

### Instalación y configuración

En la instalación seleccionar `Windows Server Standard (Desktop Experience)`.

IP estática del adaptador `Host-Only`

```powershell
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.56.10 -PrefixLength 24
```

Verificar

```powershell
Get-NetIPConfiguration
```

Configurar el nombre del equipo

```powershell
Rename-Computer -NewName "DC01" -Restart
```

Instalar Active Directory Domain Services

```powershell
Install-WindowsFeature AD-Domain-Services -IncludeManagementTools
```

Promover DC01 como controlador de dominio

```powershell
Install-ADDSForest -DomainName "corp.lab" -DomainNetbiosName "CORP" -InstallDNS
```

Integrar DC01 con Wazuh

```powershell
Invoke-WebRequest -Uri https://packages.wazuh.com/4.x/windows/wazuh-agent-4.14.9-1.msi -OutFile "$env:USERPROFILE\Downloads\wazuh-agent.msi"
```

Instalar Wazuh Agent en DC01

```powershell
Start-Process msiexec.exe -Wait -ArgumentList '/i "$env:USERPROFILE\Downloads\wazuh-agent.msi"'
```

Iniciar servicio

```powershell
Start-Service WazuhSvc
```

Verificar

```powershell
Get-Service WazuhSvc
```

Verificar en SOC-SERVER

```bash
sudo /var/ossec/bin/agent_control -l
```

Agregar `svc.backup` al grupo general

```powershell
$Groups = @("Domain Users")

foreach ($Group in $Groups) {
    Add-ADGroupMember -Identity $Group -Members "svc.backup"
}
```

Verificar

```powershell
Get-ADPrincipalGroupMembership svc.backup | Select-Object Name
```

Concederle permisos Read & Execute sobre las cuatro carpetas, sin modificar los permisos de los usuarios departamentales

```powershell
$Paths = @("C:\Shares\Finance", "C:\Shares\HR", "C:\Shares\IT", "C:\Shares\Public")

foreach ($Path in $Paths) {
    $Acl = Get-Acl $Path

    $Rule = [System.Security.AccessControl.FileSystemAccessRule]::new("CORP\svc.backup", "ReadAndExecute", "ContainerInherit,ObjectInherit", "None", "Allow")

    $Acl.AddAccessRule($Rule)
    Set-Acl -Path $Path -AclObject $Acl
}
```

Verificar

```powershell
foreach ($Path in $Paths) {
    Write-Host "`n--- $Path ---"
    (Get-Acl $Path).Access | Format-Table IdentityReference, FileSystemRights, IsInherited
}
```

Ajustar permisos SMB

```powershell
Grant-SmbShareAccess -Name Finance -AccountName "CORP\svc.backup" -AccessRight Read -Force
Grant-SmbShareAccess -Name HR -AccountName "CORP\svc.backup" -AccessRight Read -Force
Grant-SmbShareAccess -Name IT -AccountName "CORP\svc.backup" -AccessRight Read -Force
Grant-SmbShareAccess -Name Public -AccountName "CORP\svc.backup" -AccessRight Read -Force
```

Verificar

```powershell
foreach ($Share in "Finance","HR","IT","Public") {
    Write-Host "`n--- $Share ---"
    Get-SmbShareAccess -Name $Share | Format-Table AccountName, AccessRight
}
```

Habilitar auditoría de creación de procesos

```powershell
auditpol /set /subcategory:"Process Creation" /success:enable
```

Verificar

```powershell
auditpol /get /subcategory:"Process Creation"
```

Habilitar el registro de líneas de comandos

```powershell
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Audit" /v ProcessCreationIncludeCmdLine_Enabled /t REG_DWORD /d 1 /f
```

Verificar

```powershell
reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Audit" /v ProcessCreationIncludeCmdLine_Enabled
```

Habilitar auditoría de cambios en Active Directory

```powershell
auditpol /set /subcategory:"Directory Service Changes" /success:enable
```

Verificar

```powershell
auditpol /get /subcategory:"Directory Service Changes"
```

## Endpoint corporativo: WIN11-01

WIN11-01 representa una estación de trabajo perteneciente a la infraestructura corporativa simulada. Ejecuta Windows 11 Pro de 64 bits y se encuentra unido al dominio `corp.lab`, administrado por el controlador de dominio DC01.

El equipo cumple dos funciones dentro del laboratorio: actuar como endpoint de usuario y proporcionar recursos compartidos de archivos mediante Server Message Block (SMB).

### Recursos de hardware virtual

La máquina virtual dispone de dos procesadores virtuales, 6 GiB de memoria RAM y un disco virtual de aproximadamente 64 GB.

```powershell
Get-CimInstance Win32_ComputerSystem | Select-Object TotalPhysicalMemory
```

```powershell
TotalPhysicalMemory
-------------------
         6290984960
```

```powershell
Get-CimInstance Win32_Processor | Select-Object Name, NumberOfCores, NumberOfLogicalProcessors
```

```powershell
Name                                     NumberOfCores NumberOfLogicalProcessors
----                                     ------------- -------------------------
Intel(R) Core(TM) i5-10400 CPU @ 2.90GHz             2                         2
```

```powershell
Get-CimInstance Win32_DiskDrive | Select-Object Model, Size
```

```powershell
Model                Size
-----                ----
VBOX HARDDISK 68713989120
```

```powershell
Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, BuildNumber, OSArchitecture
```

```powershell
Caption                  Version    BuildNumber OSArchitecture
-------                  -------    ----------- --------------
Microsoft Windows 11 Pro 10.0.26300 26300       64-bit
```

### Conectividad de red

El endpoint cuenta con dos interfaces de red:

- **Host-Only (192.168.56.101)**: permite la comunicación con el controlador de dominio y el servidor central de monitoreo.
- **NAT (10.0.3.15)**: proporciona conectividad a Internet.
Recursos compartidos y control de acceso

### Configuración

IP estática

```powershell
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.56.101 -PrefixLength 24
```

Habilitar ICMP

```powershell
New-NetFirewallRule -DisplayName "Allow ICMPv4 from Lab" -Protocol ICMPv4 -IcmpType 8 -Direction Inbound -Action Allow -RemoteAddress 192.168.56.0/24
```

Unirse al dominio, debe utilizar DC01 como servidor DNS

```powershell
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 192.168.56.10
```

Comprobar resolución DNS

```powershell
nslookup corp.lab
```

```powershell
Add-Computer -DomainName "corp.lab" -Credential (Get-Credential) -Restart
```

### El equipo aloja cuatro recursos compartidos organizados por departamento:

- Finance: archivos del departamento de Finanzas.
- HR: archivos del departamento de Recursos Humanos.
- IT: archivos del departamento de Tecnología.
- Public: archivos accesibles para los usuarios del dominio.
El acceso está administrado mediante grupos de seguridad de Active Directory y permisos NTFS y SMB. Esta configuración permite simular políticas corporativas de acceso a información según las responsabilidades de cada usuario.

Crear un servidor de archivos simulado

```powershell
New-Item -Path "C:\Shares\Finance" -ItemType Directory -Force
New-Item -Path "C:\Shares\HR" -ItemType Directory -Force
New-Item -Path "C:\Shares\IT" -ItemType Directory -Force
New-Item -Path "C:\Shares\Public" -ItemType Directory -Force
```

Configurar permisos NTFS

```powershell
$Folders = @(
    @{Path="C:\Shares\Finance"; Group="GG_Finance"}
    @{Path="C:\Shares\HR"; Group="GG_HR"}
    @{Path="C:\Shares\IT"; Group="GG_IT"}
)

foreach ($Folder in $Folders) {
    $Acl = Get-Acl $Folder.Path

    $Acl.SetAccessRuleProtection($true, $false)

    $Rule = New-Object System.Security.AccessControl.FileSystemAccessRule("CORP\$($Folder.Group)", "Modify", "ContainerInherit,ObjectInherit", "None", "Allow")

    $Acl.AddAccessRule($Rule)
    Set-Acl -Path $Folder.Path -AclObject $Acl
}
```

```powershell
$Path = "C:\Shares\Finance"
$Acl = Get-Acl $Path

$Rules = @(
    [System.Security.AccessControl.FileSystemAccessRule]::new("NT AUTHORITY\SYSTEM", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow"),
    [System.Security.AccessControl.FileSystemAccessRule]::new("BUILTIN\Administrators", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
)

foreach ($Rule in $Rules) {
    $Acl.AddAccessRule($Rule)
}

Set-Acl -Path $Path -AclObject $Acl
```

Verificar

```powershell
(Get-Acl C:\Shares\Finance).Access | Format-Table IdentityReference, FileSystemRights, IsInherited
```

```powershell
$Folders = @(
    @{Path="C:\Shares\HR"; Group="GG_HR"}
    @{Path="C:\Shares\IT"; Group="GG_IT"}
)

foreach ($Folder in $Folders) {
    $Acl = Get-Acl $Folder.Path
    $Acl.SetAccessRuleProtection($true, $false)

    $Rules = @(
        [System.Security.AccessControl.FileSystemAccessRule]::new("NT AUTHORITY\SYSTEM", "FullControl",
            "ContainerInherit,ObjectInherit", "None", "Allow"),
        [System.Security.AccessControl.FileSystemAccessRule]::new("BUILTIN\Administrators", "FullControl",
            "ContainerInherit,ObjectInherit", "None", "Allow"),
        [System.Security.AccessControl.FileSystemAccessRule]::new("CORP\$($Folder.Group)", "Modify",
            "ContainerInherit,ObjectInherit", "None", "Allow")
    )

    foreach ($Rule in $Rules) {
        $Acl.AddAccessRule($Rule)
    }

    Set-Acl -Path $Folder.Path -AclObject $Acl
}
```

Verificar

```powershell
foreach ($Path in "C:\Shares\Finance","C:\Shares\HR","C:\Shares\IT") {
    Write-Host "`n--- $Path ---"
    (Get-Acl $Path).Access |
        Format-Table IdentityReference, FileSystemRights, IsInherited
}
```

Crear una carpeta de acceso general

```powershell
$Path = "C:\Shares\Public"

$Acl = Get-Acl $Path
$Acl.SetAccessRuleProtection($true, $false)

$Rules = @(
    [System.Security.AccessControl.FileSystemAccessRule]::new("NT AUTHORITY\SYSTEM", "FullControl",
        "ContainerInherit,ObjectInherit", "None", "Allow"),
    [System.Security.AccessControl.FileSystemAccessRule]::new("BUILTIN\Administrators", "FullControl",
        "ContainerInherit,ObjectInherit", "None", "Allow"),
    [System.Security.AccessControl.FileSystemAccessRule]::new("CORP\Domain Users", "Modify",
        "ContainerInherit,ObjectInherit", "None", "Allow")
)

foreach ($Rule in $Rules) {
    $Acl.AddAccessRule($Rule)
}

Set-Acl -Path $Path -AclObject $Acl
```

Compartir las carpetas por SMB

```powershell
New-SmbShare -Name "Finance" -Path "C:\Shares\Finance" -FullAccess "CORP\GG_Finance" -ChangeAccess "BUILTIN\Administrators"
New-SmbShare -Name "HR" -Path "C:\Shares\HR" -FullAccess "CORP\GG_HR" -ChangeAccess "BUILTIN\Administrators"
New-SmbShare -Name "IT" -Path "C:\Shares\IT" -FullAccess "CORP\GG_IT" -ChangeAccess "BUILTIN\Administrators"
New-SmbShare -Name "Public" -Path "C:\Shares\Public" -ChangeAccess "CORP\Domain Users" -FullAccess "BUILTIN\Administrators"
```

Verificar

```powershell
Get-SmbShare | Where-Object {$_.Name -in "Finance","HR","IT","Public"} | Format-Table Name, Path
```

Comprobar los permisos del recurso compartido

```powershell
Get-SmbShareAccess -Name Finance
Get-SmbShareAccess -Name HR
Get-SmbShareAccess -Name IT
Get-SmbShareAccess -Name Public
```

### Integración con el SIEM

Wazuh Agent 4.14.9 está instalado en el endpoint y envía eventos al servidor central SOC-SERVER. Esto permite monitorear actividades como intentos fallidos de autenticación, accesos a recursos y otras operaciones relevantes para la seguridad del sistema.

Descargar Wazuh Agent

```powershell
Invoke-WebRequest -Uri https://packages.wazuh.com/4.x/windows/wazuh-agent-4.14.9-1.msi -OutFile "$env:USERPROFILE\Downloads\wazuh-agent.msi"
```

```powershell
msiexec.exe /i "$env:USERPROFILE\Downloads\wazuh-agent.msi"
```

```plaintext
Manager IP: 192.168.56.20
Authentication key: dejarlo vacío.
```

Iniciar el agente

```powershell
Start-Service WazuhSvc
```

Comprobar estado del servicio

```powershell
Get-Service WazuhSvc
```

En `SOC-SERVER` comprobamos que aparezca `WIN11-01`, puede demorar un poco en aparecer como `Active`

```bash
sudo /var/ossec/bin/agent_control -l
```

Habilitar auditoría de creación de procesos

```powershell
auditpol /set /subcategory:"Process Creation" /success:enable
```

Verificar

```powershell
auditpol /get /subcategory:"Process Creation"
```

Registrar líneas de comandos

```powershell
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Audit" /v ProcessCreationIncludeCmdLine_Enabled /t REG_DWORD /d 1 /f
```

Verificar

```powershell
reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Audit" /v ProcessCreationIncludeCmdLine_Enabled
```

## Estructura organizativa de Active Directory

El dominio `corp.lab` utiliza Active Directory Domain Services (AD DS) para centralizar la administración de identidades y recursos de la organización.

La estructura se organiza mediante Unidades Organizativas (Organizational Units u OU), que permiten agrupar objetos del directorio según su función dentro de la empresa.

La organización está dividida en las siguientes unidades:

### CORP

Contiene las unidades organizativas correspondientes a los departamentos de la empresa:

- **IT**: usuarios y recursos del departamento de Tecnología.
- **HR**: usuarios y recursos de Recursos Humanos.
- **Finance**: usuarios y recursos de Finanzas.
- **Sales**: usuarios y recursos de Ventas.

```powershell
Get-ADOrganizationalUnit -Filter * | Select-Object Name, DistinguishedName | Format-Table -AutoSize
```

```powershell
Name               DistinguishedName
----               -----------------
Domain Controllers OU=Domain Controllers,DC=corp,DC=lab
CORP               OU=CORP,DC=corp,DC=lab
Service Accounts   OU=Service Accounts,DC=corp,DC=lab
Workstations       OU=Workstations,DC=corp,DC=lab
IT                 OU=IT,OU=CORP,DC=corp,DC=lab
HR                 OU=HR,OU=CORP,DC=corp,DC=lab
Finance            OU=Finance,OU=CORP,DC=corp,DC=lab
Sales              OU=Sales,OU=CORP,DC=corp,DC=lab
```

### Service Accounts

Contiene las cuentas utilizadas por servicios y procesos automatizados. Estas identidades permiten ejecutar tareas específicas sin depender de cuentas personales de los empleados.

### Workstations

Está destinada a organizar las estaciones de trabajo pertenecientes al dominio. Permite administrar los equipos corporativos de forma centralizada.

### Domain Controllers

Es la unidad organizativa predeterminada de Active Directory para los controladores de dominio. En este laboratorio contiene el objeto correspondiente a DC01.

Esta estructura facilita la administración de los objetos del directorio y proporciona una base para aplicar políticas de grupo (Group Policy Objects o GPO) según las necesidades de cada área.

## Administración de usuarios y grupos

La administración de identidades del dominio corp.lab se realiza mediante Active Directory Domain Services. Los usuarios se organizan de acuerdo con su departamento y las responsabilidades que desempeñan dentro de la organización.

La estructura contempla cuatro departamentos: IT, HR, Finance y Sales. Cada departamento cuenta con un usuario representativo y un grupo de seguridad global asociado.

La asignación de permisos se realiza mediante grupos de seguridad, evitando administrar los accesos individualmente para cada usuario. Este enfoque facilita la administración de recursos y permite modificar los permisos de un departamento sin tener que configurar cada cuenta por separado.

Además de las cuentas personales, existe una cuenta de servicio denominada svc.backup, destinada a representar las operaciones de respaldo de información. Esta cuenta pertenece al grupo GG_ServiceAccounts y no posee privilegios administrativos.

Las cuentas predeterminadas Administrator, Guest y krbtgt forman parte de la estructura inicial de Active Directory y cumplen funciones propias del dominio.

```powershell
Get-ADUser -Filter * -Properties Department, Enabled | Select-Object Name, SamAccountName, Department, Enabled | Format-Table -AutoSize
```

```powershell
Name                   SamAccountName Department Enabled
----                   -------------- ---------- -------
Administrator          Administrator                True
Guest                  Guest                       False
krbtgt                 krbtgt                      False
John Smith             j.smith        IT            True
Mary Johnson           m.johnson      HR            True
Robert Williams        r.williams     Finance       True
Alice Brown            a.brown        Sales         True
Backup Service Account svc.backup                   True
```

```powershell
Get-ADGroup -Filter * | Where-Object { $_.Name -like "GG_*" } | Select-Object Name, GroupScope, GroupCategory | Format-Table -AutoSize
```

```powershell
Name               GroupScope GroupCategory
----               ---------- -------------
GG_IT                  Global      Security
GG_HR                  Global      Security
GG_Finance             Global      Security
GG_Sales               Global      Security
GG_ServiceAccounts     Global      Security
```

## Membresía de grupos y organización de identidades

El dominio `corp.lab` utiliza grupos de seguridad globales para organizar las identidades de acuerdo con sus responsabilidades dentro de la organización.

Cada empleado pertenece al grupo correspondiente a su departamento. Por ejemplo, John Smith pertenece a GG_IT, mientras que Robert Williams pertenece a GG_Finance.

La cuenta `svc.backup` tiene una función diferente a la de los usuarios convencionales. Por este motivo, se encuentra separada de los grupos departamentales y pertenece exclusivamente a GG_ServiceAccounts, además de su pertenencia predeterminada a Domain Users.

Esta organización permite aplicar permisos sobre recursos compartidos mediante grupos, simplificando la administración de accesos y reduciendo la necesidad de asignar permisos directamente a usuarios individuales.

```powershell
Get-ADGroup -Filter 'Name -like "GG_*"' |
ForEach-Object {
    $group = $_
    Get-ADGroupMember -Identity $group |
        Select-Object @{Name="Grupo";Expression={$group.Name}},
                      Name,
                      SamAccountName,
                      objectClass
} |
Format-Table -AutoSize
```

```powershell
Grupo              Name                   SamAccountName objectClass
-----              ----                   -------------- -----------
GG_Finance         Robert Williams        r.williams     user
GG_HR              Mary Johnson           m.johnson      user
GG_IT              John Smith             j.smith        user
GG_Sales           Alice Brown            a.brown        user
GG_ServiceAccounts Backup Service Account svc.backup     user
```

## Administración de recursos compartidos mediante SMB

El equipo `WIN11-01` funciona como servidor de archivos de la organización simulada. Los recursos se encuentran organizados por departamento y se publican mediante el protocolo Server Message Block (SMB), utilizado habitualmente para compartir archivos y carpetas en redes Windows.

La estructura contempla cuatro recursos compartidos: Finance, HR, IT y Public.

Los recursos departamentales utilizan grupos de seguridad de Active Directory para controlar el acceso. De esta manera, los integrantes de cada departamento pueden acceder a la información correspondiente a sus responsabilidades, mientras que los demás usuarios no reciben permisos de acceso por estas asignaciones.

El recurso Public tiene una política más amplia y permite que los usuarios pertenecientes a Domain Users puedan consultar, crear, modificar y eliminar archivos.

La cuenta de servicio svc.backup dispone de permisos de lectura sobre los cuatro recursos. Esta configuración representa una cuenta destinada a operaciones de respaldo que necesita consultar información sin modificar los archivos originales.

La administración de permisos mediante grupos permite centralizar las políticas de acceso y facilita su mantenimiento cuando se incorporan nuevos empleados o cambian sus responsabilidades.

## Control de acceso mediante permisos NTFS

Además de los permisos SMB, el servidor de archivos utiliza listas de control de acceso (Access Control Lists o ACL) del sistema de archivos NTFS para administrar las operaciones permitidas sobre cada directorio.

Cada carpeta departamental cuenta con permisos explícitos asignados al grupo de seguridad correspondiente. Por ejemplo, los integrantes de GG_Finance pueden modificar el contenido de C:\Shares\Finance, pero no reciben permisos departamentales sobre las carpetas de Recursos Humanos o Tecnología.

La carpeta Public utiliza el grupo Domain Users, permitiendo que cualquier usuario autenticado del dominio pueda trabajar con su contenido.

La cuenta svc.backup tiene permisos de lectura y ejecución sobre los cuatro directorios. Esta configuración permite representar una cuenta de servicio dedicada a consultar información para tareas de respaldo, sin concederle permisos de modificación.

Las entradas de las ACL se propagan a los archivos y subdirectorios, manteniendo el mismo modelo de acceso dentro de cada recurso.

## Combinación de permisos SMB y NTFS

El acceso a los archivos mediante la red depende de dos mecanismos independientes: los permisos configurados en el recurso compartido SMB y los permisos NTFS aplicados sobre el directorio físico.

Cuando un usuario accede mediante SMB, se aplican ambas restricciones y prevalece la más restrictiva.

Por ejemplo, un integrante del departamento de Finanzas tiene permiso Full en el recurso SMB Finance, pero solamente Modify en NTFS. Por lo tanto, su acceso efectivo queda limitado a las operaciones permitidas por Modify.

Este modelo permite mantener un control de acceso en dos niveles: uno para el recurso compartido y otro para los archivos almacenados en el servidor.

### Configuración del dominio

Crear las Organizational Units (OU)

```powershell
New-ADOrganizationalUnit -Name "CORP" -Path "DC=corp,DC=lab"
New-ADOrganizationalUnit -Name "Service Accounts" -Path "DC=corp,DC=lab"
New-ADOrganizationalUnit -Name "Workstations" -Path "DC=corp,DC=lab"
New-ADOrganizationalUnit -Name "IT" -Path "OU=CORP,DC=corp,DC=lab"
New-ADOrganizationalUnit -Name "HR" -Path "OU=CORP,DC=corp,DC=lab"
New-ADOrganizationalUnit -Name "Finance" -Path "OU=CORP,DC=corp,DC=lab"
New-ADOrganizationalUnit -Name "Sales" -Path "OU=CORP,DC=corp,DC=lab"
```

Verificar

```powershell
Get-ADOrganizationalUnit -Filter * | Select-Object Name, DistinguishedName
```

Crear grupos por departamento para administrar permisos de forma centralizada

```powershell
New-ADGroup -Name "GG_IT" -GroupScope Global -GroupCategory Security -Path "OU=IT,OU=CORP,DC=corp,DC=lab"
New-ADGroup -Name "GG_HR" -GroupScope Global -GroupCategory Security -Path "OU=HR,OU=CORP,DC=corp,DC=lab"
New-ADGroup -Name "GG_Finance" -GroupScope Global -GroupCategory Security -Path "OU=Finance,OU=CORP,DC=corp,DC=lab"
New-ADGroup -Name "GG_Sales" -GroupScope Global -GroupCategory Security -Path "OU=Sales,OU=CORP,DC=corp,DC=lab"
```

Verificar

```powershell
Get-ADGroup -Filter 'Name -like "GG_*"' | Select-Object Name, GroupScope, GroupCategory
```

Crear cuatro usuarios ficticios, uno por departamento

```powershell
$Password = Read-Host "Password inicial para los usuarios" -AsSecureString

$Users = @(
    @{Name="John Smith"; Sam="j.smith"; OU="IT"; Group="GG_IT"}
    @{Name="Mary Johnson"; Sam="m.johnson"; OU="HR"; Group="GG_HR"}
    @{Name="Robert Williams"; Sam="r.williams"; OU="Finance"; Group="GG_Finance"}
    @{Name="Alice Brown"; Sam="a.brown"; OU="Sales"; Group="GG_Sales"}
)

foreach ($User in $Users) {
    $OUPath = "OU=$($User.OU),OU=CORP,DC=corp,DC=lab"

    New-ADUser -Name $User.Name -SamAccountName $User.Sam -UserPrincipalName "$($User.Sam)@corp.lab" -Department $User.OU -Path $OUPath -AccountPassword $Password -Enabled $true

    Add-ADGroupMember -Identity $User.Group -Members $User.Sam
}
```

Verificar

```powershell
Get-ADUser -Filter * -SearchBase "OU=CORP,DC=corp,DC=lab" -Properties Department | Select-Object Name, SamAccountName, Department
```

Verificar pertenencia a grupos

```powershell
Get-ADGroupMember -Identity GG_IT
Get-ADGroupMember -Identity GG_HR
Get-ADGroupMember -Identity GG_Finance
Get-ADGroupMember -Identity GG_Sales
```

Crear una cuenta de servicio

```powershell
$Password = Read-Host "Password para svc.backup" -AsSecureString

New-ADUser -Name "Backup Service Account" -SamAccountName "svc.backup" -UserPrincipalName "svc.backup@corp.lab" -Description "Service account for backup operations" -Path "OU=Service Accounts,DC=corp,DC=lab" -AccountPassword $Password -Enabled $true -PasswordNeverExpires $true
```

Verificar

```powershell
Get-ADUser svc.backup -Properties Description, Enabled, PasswordNeverExpires
```

Crear grupo para las cuentas de servicio

```powershell
New-ADGroup -Name "GG_ServiceAccounts" -GroupScope Global -GroupCategory Security -Path "OU=Service Accounts,DC=corp,DC=lab"
```

Agregar la cuenta

```powershell
Add-ADGroupMember -Identity "GG_ServiceAccounts" -Members "svc.backup"
```

Verificar

```powershell
Get-ADGroupMember -Identity "GG_ServiceAccounts"
```

## Pruebas

### Creación de procesos

```powershell
Start-Process -FilePath "whoami.exe" -Wait
```

Comprobar que se creó el evento

```powershell
Get-WinEvent -FilterHashtable @{
    LogName = 'Security'
    Id = 4688
} -MaxEvents 5 | Format-List TimeCreated, Id, Message
```

Buscar en Wazuh la creación del evento de creación del proceso

```plaintext
agent.name: "DC01" AND data.win.system.eventID: "4688"
```

### Modificación de objetos de Active Directory

Modificar la descripción de un usuario

```powershell
Set-ADUser j.smith -Description "SOC Lab - Audit Test"
```

Comprobar que el cambio en la descripción se realizó

```powershell
Get-ADUser j.smith -Properties Description | Select-Object SamAccountName,Description
```

Comprobar que se registró el evento

```powershell
Get-WinEvent -FilterHashtable @{
    LogName = 'Security'
    Id = 5136
} -MaxEvents 5 | Format-List TimeCreated, Id, Message
```

Buscar en Wazuh el evento de modificación de objetos de Active Directory

```plaintext
agent.name: "DC01" AND data.win.system.eventID: "5136"
```

### Modificación de grupos

Agregar un usuario a un grupo

```powershell
Add-ADGroupMember -Identity "GG_IT" -Members "a.brown"
```

Comprobar que se agregó el usuario al grupo

```powershell
Get-ADGroupMember GG_IT | Select-Object Name,SamAccountName,ObjectClass
```

Eliminar el usuario del grupo al que se añadió

```powershell
Remove-ADGroupMember -Identity "GG_IT" -Members "a.brown" -Confirm:$false
```

Comprobar que se eliminó el usuario del grupo

```powershell
Get-ADGroupMember GG_IT | Select-Object Name,SamAccountName,ObjectClass
```

Comprobar que se crearon los eventos de agregar y eliminar miembros de un grupo global

```powershell
Get-WinEvent -FilterHashtable @{
    LogName = 'Security'
    Id = 4728,4729
} -MaxEvents 10 | Format-List TimeCreated, Id, Message
```

Comprobar que se registraron en Wazuh los eventos de agregar y eliminar miembros de un grupo global

```plaintext
agent.name: "DC01" AND (data.win.system.eventID: "4728" OR data.win.system.eventID: "4729")
```

### Creación de cuenta

```powershell
New-ADUser -Name "SOC Audit Test" -SamAccountName "soc.audit.test" -UserPrincipalName "soc.audit.test@corp.lab" -Path "OU=IT,OU=CORP,DC=corp,DC=lab" -Enabled $false -Description "Temporary account for SOC audit validation"
```

```powershell
Get-ADUser soc.audit.test | Select-Object Name,SamAccountName,Enabled,DistinguishedName
```

En Wazuh buscar el evento de creación de cuenta

```plaintext
agent.name: "DC01" AND data.win.system.eventID: "4720"
```

### Habilitación de cuenta

Asignarle una contraseña antes de habilitar la cuenta

```powershell
$Password = Read-Host "Ingresá una contraseña temporal" -AsSecureString
Set-ADAccountPassword -Identity "soc.audit.test" -NewPassword $Password
```

Verificar

```powershell
Get-ADUser soc.audit.test -Properties PasswordLastSet | Select-Object SamAccountName,Enabled,PasswordLastSet
```

Habilitar la cuenta temporal

```powershell
Enable-ADAccount -Identity "soc.audit.test"
```

Comprobar el estado

```powershell
Get-ADUser soc.audit.test | Select-Object Name,SamAccountName,Enabled
```

Comprobar el evento

```powershell
Get-WinEvent -FilterHashtable @{
    LogName = 'Security'
    Id = 4722
} -MaxEvents 5 | Format-List TimeCreated, Id, Message
```

En Wazuh buscar el evento de cuenta habilitada

```plaintext
agent.name: "DC01" AND data.win.system.eventID: "4722"
```

### Deshabilitación de cuenta

```powershell
Disable-ADAccount -Identity "soc.audit.test"
```

Verificar

```powershell
Get-ADUser soc.audit.test | Select-Object Name,SamAccountName,Enabled
```

Comprobar el evento

```powershell
Get-WinEvent -FilterHashtable @{
    LogName = 'Security'
    Id = 4725
} -MaxEvents 5 | Format-List TimeCreated, Id, Message
```

En Wazuh buscar el evento de cuenta deshabilitada

```plaintext
agent.name: "DC01" AND data.win.system.eventID: "4725"
```

### Eliminación de cuenta

Eliminar cuenta

```powershell
Remove-ADUser -Identity "soc.audit.test" -Confirm:$false
```

Verificar la eliminación de la cuenta

```powershell
Get-ADUser soc.audit.test
```

Verificar que se creó el evento

```powershell
Get-WinEvent -FilterHashtable @{
    LogName = 'Security'
    Id = 4726
} -MaxEvents 5 | Format-List TimeCreated, Id, Message
```

Buscar en Wazuh el evento de eliminación de cuenta

```plaintext
agent.name: "DC01" AND data.win.system.eventID: "4726"
```

### Modificaciones de cuentas

Modificar la descripción de un usuario

```powershell
Set-ADUser j.smith -Description "SOC Lab - Account Modification Test"
```

Comprobar el cambio

```powershell
Get-ADUser j.smith -Properties Description | Select-Object SamAccountName,Description
```

Buscar en Wazuh el evento de modificación de cuenta

```plaintext
agent.name: "DC01" AND data.win.system.eventID: "4738"
```

```plaintext
agent.name: "DC01" AND data.win.system.eventID: "5136"
```

### Auditoría de acceso a archivos

File System, acceso a archivos y carpetas

```powershell
auditpol /set /subcategory:"File System" /success:enable /failure:enable
```

File Share, acceso a recursos compartidos SMB

```powershell
auditpol /set /subcategory:"File Share" /success:enable /failure:enable
```

Detailed File Share, conexiones y accesos detallados SMB

```powershell
auditpol /set /subcategory:"Detailed File Share" /success:enable /failure:enable
```

Comprobar que se habilitaron las auditorías de acceso a objetos

```powershell
auditpol /get /subcategory:"File System"
auditpol /get /subcategory:"File Share"
auditpol /get /subcategory:"Detailed File Share"
```

Configurar auditoría sobre las carpetas compartidas

```powershell
$Path = "C:\Shares\Finance"

$Acl = Get-Acl -Path $Path -Audit

$Rule = New-Object System.Security.AccessControl.FileSystemAuditRule(
    "Everyone",
    "ReadData,WriteData,AppendData,Delete,ChangePermissions,TakeOwnership",
    "ContainerInherit,ObjectInherit",
    "None",
    "Success,Failure"
)

$Acl.AddAuditRule($Rule)

Set-Acl -Path $Path -AclObject $Acl
```