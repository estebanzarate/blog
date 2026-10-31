---
type: post
title: Setup de Windows 11
description: Instalación de Windows 11 en Virtual Box
lang: es
featured: true
image: ../../images/blog/windows11/windows11.png
---

## Bypasses

- En la primera pantalla de instalación (o cuando aparezca el error "Este equipo no puede ejecutar Windows 11"), presionar las teclas `Shift` + `F10` para abrir el Símbolo del sistema (CMD).
- Acceder al Editor del Registro escribiendo `regedit` y presionando `Enter` para abrir el Editor del Registro (regedit.exe).
- Crear la clave `LabConfig`, navegar hasta la siguiente ruta en el panel izquierdo `HKEY_LOCAL_MACHINE\SYSTEM\Setup`
- Clic derecho sobre la carpeta `Setup`, seleccionar `Nuevo` > `Clave` y asignarle el nombre `LabConfig` (respetar mayúsculas).
- Añadir los valores para omitir las restricciones, seleccionar la nueva clave `LabConfig`, hacer clic derecho en el espacio vacío del panel derecho y crear tres valores de tipo VALOR DWORD (32 bits): `BypassTPMCheck` y asignarle el valor 1 (en hexadecimal), `BypassSecureBootCheck` y asignarle el valor 1 (en hexadecimal), `BypassRAMCheck` y asignarle el valor 1 (en hexadecimal) (opcional, si pide memoria).
- Cerrar el Editor del Registro y la ventana de Símbolo del sistema, hacer clic en Siguiente y continuar con la instalación de Windows 11 de forma normal.

- Cuando pida iniciar sesión con una cuenta presionar `Shift` + `F10` para abrir CMD.
- Escribir `start ms-cxh:localonly` y presionar `Enter`.
- Seguir las instrucciones de la pantalla para crear una cuenta local.

- Visual Studio
    - Desktop development with C++