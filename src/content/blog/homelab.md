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

## Endpoint corporativo: WIN11-01

WIN11-01 representa una estación de trabajo perteneciente a la infraestructura corporativa simulada. Ejecuta Windows 11 Pro de 64 bits y se encuentra unido al dominio `corp.lab`, administrado por el controlador de dominio DC01.

El equipo cumple dos funciones dentro del laboratorio: actuar como endpoint de usuario y proporcionar recursos compartidos de archivos mediante Server Message Block (SMB).

### Recursos de hardware virtual

La máquina virtual dispone de dos procesadores virtuales, 6 GiB de memoria RAM y un disco virtual de aproximadamente 64 GB.

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

### Integración con el SIEM

Wazuh Agent 4.14.9 está instalado en el endpoint y envía eventos al servidor central SOC-SERVER. Esto permite monitorear actividades como intentos fallidos de autenticación, accesos a recursos y otras operaciones relevantes para la seguridad del sistema.

## Estructura organizativa de Active Directory

El dominio `corp.lab` utiliza Active Directory Domain Services (AD DS) para centralizar la administración de identidades y recursos de la organización.

La estructura se organiza mediante Unidades Organizativas (Organizational Units u OU), que permiten agrupar objetos del directorio según su función dentro de la empresa.

La organización está dividida en las siguientes unidades:

### CORP

Contiene las unidades organizativas correspondientes a los departamentos de la empresa:

- IT: usuarios y recursos del departamento de Tecnología.
- HR: usuarios y recursos de Recursos Humanos.
- Finance: usuarios y recursos de Finanzas.
- Sales: usuarios y recursos de Ventas.

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

## Membresía de grupos y organización de identidades

El dominio `corp.lab` utiliza grupos de seguridad globales para organizar las identidades de acuerdo con sus responsabilidades dentro de la organización.

Cada empleado pertenece al grupo correspondiente a su departamento. Por ejemplo, John Smith pertenece a GG_IT, mientras que Robert Williams pertenece a GG_Finance.

La cuenta `svc.backup` tiene una función diferente a la de los usuarios convencionales. Por este motivo, se encuentra separada de los grupos departamentales y pertenece exclusivamente a GG_ServiceAccounts, además de su pertenencia predeterminada a Domain Users.

Esta organización permite aplicar permisos sobre recursos compartidos mediante grupos, simplificando la administración de accesos y reduciendo la necesidad de asignar permisos directamente a usuarios individuales.

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