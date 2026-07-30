---
type: post
title: Windows Privilege Escalation
description: Enumeración de un sistema Windows después de obtener acceso no autorizado, diversas técnicas de escalada de privilegios 
lang: es
draft: false
---

## Herramientas

| Herramienta | Descripción |
| - | - |
| [Seatbelt](https://github.com/GhostPack/Seatbelt) | Proyecto en `C#` que realiza una serie de "comprobaciones de seguridad" orientadas a la seguridad del host, relevantes tanto desde una perspectiva de seguridad ofensiva como defensiva. | 
| [WinPEAS](https://github.com/peass-ng/PEASS-ng/tree/master/winPEAS) | Busca posibles rutas locales de escalada de privilegios. |
| [PowerUp.ps1](https://raw.githubusercontent.com/PowerShellMafia/PowerSploit/refs/heads/master/Privesc/PowerUp.ps1) # [DOCS](https://github.com/PowerShellMafia/PowerSploit/tree/master/Privesc) | Centro de información sobre los vectores comunes de escalada de privilegios en Windows que se basan en configuraciones incorrectas. |
| [SharpUp](https://github.com/GhostPack/SharpUp) | Adaptación a `C#` de varias funcionalidades de `PowerUp`. |
| [JAWS](https://github.com/411Hall/JAWS) | Script de PowerShell diseñado para identificar posibles vectores de escalada de privilegios en sistemas Windows. |
| [SessionGopher](https://github.com/Arvanaghi/SessionGopher) | PowerShell tool that finds and decrypts saved session information for remote access tools. |
| [Watson](https://github.com/rasta-mouse/Watson) | NET tool designed to enumerate missing KBs and suggest exploits for Privilege Escalation vulnerabilities. |
| [LaZagne](https://github.com/AlessandroZ/LaZagne) | Used to retrieve lots of passwords stored on a local computer. |
| [Windows Exploit Suggester - Next Generation](https://github.com/bitsadmin/wesng) | Basado en la información que proporciona la utilidad `systeminfo` de Windows, que ofrece una lista de las vulnerabilidades a las que es vulnerable el sistema operativo, incluyendo cualquier exploit para dichas vulnerabilidades. |
| [Sysinternals Suite](https://learn.microsoft.com/en-us/sysinternals/downloads/sysinternals-suite) | conjunto de herramientas de administración, diagnóstico y resolución de problemas para sistemas operativos Windows. |