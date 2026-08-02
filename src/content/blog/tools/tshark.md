---
type: post
title: tshark
description: TShark es un analizador de protocolos de red. Permite capturar datos de paquetes desde una red en vivo o leer paquetes desde un archivo de captura previamente guardado, ya sea mostrando una versión decodificada de esos paquetes en la salida estándar o escribiéndolos en un archivo.
lang: es
draft: false
---

[TShark web site](https://tshark.dev/)

## Flags

- `-D`: Listar interfaces disponibles en el sistema.
- `-i <interface>`: Especificar de qué interfaz queremos recolectar paquetes.
- `-f "<filter>"`: Definir filtro de captura.
- `-w <filename>`: Guardar paquetes recolectados en el archivo especificado.
- `-r <filename>`: Trabajar en un archivo de captura de paquetes guardado previamente.
- `-Y "<filter>"`: Aplicar filtro de visualización.
- `-T`: Proporcionar la salida a otra aplicación o mostrar solo campos específicos.
    - `October` - Crea una salida en formato **JSON** adecuada para **ElasticSearch**.
    - `fields` - Crea la salida de paquetes con campos de protocolo específicos. También debes usar la opción `-e <field>` para crear esta salida.
    - `json` - Crea una salida en formato **JSON**.
    - `pdml` - Crea una salida en formato **Packet Detail Markup Language** (**PDML**) basado en **XML**.
    - `ps` - Crea una salida en formato **PostScript**.
    - `tabs` - Muestra los campos en un formato separado por un carácter de tabulación.
    - `text` - Crea una salida en formato de texto plano.
- `-q` y `-z`: Extraer estadísticas de los paquetes capturados.
    - `conversations`: Muestra estadísticas de conversación para todos los protocolos.
    - `conv,protocol`: Muestra estadísticas de conversación para un protocolo específico.
    - `endpoints`: Muestra estadísticas de puntos finales (endpoints) para todos los protocolos.
    - `endpoints,protocol`: Muestra estadísticas de puntos finales para un protocolo específico.
    - `http,tree`: Muestra estadísticas HTTP: