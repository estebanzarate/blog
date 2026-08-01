---
type: post
title: tcpdump
description: Como utilizar tcpdump
lang: es
draft: false
---

En Linux se ejecuta con `sudo`. Si no le indicamos la interfaz escucha en todas las tarjetas activasa.

## Flags

- `-i <interface>`: Ejecuta la interfaz especificada en modo monitor.
- `-c <number>`: Se detiene después de capturar el número de paquetes especificados.
- `-D`: Lista las interfaces en el sistema que pueden capturar paquetes.
- `-w <filename>`: Guarda los paquetes capturados a un archivo en vez de mostrarlos por consola.
- `-r <filename>`: Abre el archivo y muestra los datos guardados previamente.
- `tcp`: Muestra paquetes `TCP`.
- `udp`: Muestra paquetes `UDP`.
- `icmp`: Muestra paquetes `ICMP`.
- `port`: Muestra paquetes con el puerto de origen o destino especificado.
- `host`: Muestra paquetes con la dirección ip de origen o destino especificada.
- `net`: Muestra paquetes cuya dirección ip de origen o destino está en el `CIDR` especificado.
- `src`: Muestra paquetes con la dirección ip de origen especificada.
- `dst`: Muestra paquetes con la dirección ip de destino especificada.
- `service`: Muestra paquetes relacionados al número de puerto en el que el servicio mencionado corre.
- `portrange`: Muestra paquetes relacionados entre los puertos especificados.
- `-n`: Muestra la dirección ip en vez del nombre del dominio.
- `-W <number>`: Determina el número de archivos guardados.
- `-C <number>`: Determina el tamaño máximo de los archivos guardados.
- `greater <size>`: Filtra paquetes más grandes del tamaño especificado.

## Operadores

| Operador | Sintaxis | Ejemplo |
| - | - | - |
| AND | and, && | tcpdump -i ens33 host 192.168.1.1 and port 443 |
| OR | or, \|\| | tcpdump -i ens33 host 192.168.1.1 or port 443 |
| EXCEPT | not, ! | tcpdump -i ens33 host 192.168.1.1 and not port 443 |