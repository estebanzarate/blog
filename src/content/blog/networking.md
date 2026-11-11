---
type: post
title: Networking
description: Redes, subnetting
lang: es
featured: false
---

## Subnetting

1. **Estructura de IPv4:** Toda dirección IP consta de **32 bits** divididos en 4 octetos (8 bits por octeto).

2. **Bits de Red vs. Bits de Host:**

   * **CIDR (`/N`):** Indica la cantidad de bits asignados a la **Red**.

   * **Bits de Host (H):** La cantidad de bits restantes para asignar a dispositivos:

     `H = 32 - CIDR`

3. **Fórmulas Principales:**

   * **Direcciones Totales:** `2^H`

   * **Hosts Útiles (Asignables):** `2^H - 2` *(Se restan 2: la dirección de Red y la de Broadcast)*.

### PASO 1: Identificar el Octeto de Trabajo y los Bits Afectados

Usa el prefijo **CIDR (`/N`)** para identificar en qué octeto ocurrirá la división o salto de red:

| Prefijo CIDR | Octeto Afectado | Octetos Anteriores | Octetos Posteriores | 
| ----- | ----- | ----- | ----- | 
| **/1 a /8** | **1er Octeto** | *(Ninguno)* | Pasan a ser `0` | 
| **/9 a /16** | **2do Octeto** | 1er octeto es `255` | 3er y 4to octeto son `0` | 
| **/17 a /24** | **3er Octeto** | 1er y 2do octeto son `255` | 4to octeto es `0` | 
| **/25 a /32** | **4to Octeto** | 1er, 2do y 3er octeto son `255` | *(Ninguno)* | 

* **Bits encendidos en el octeto afectado:**

  `Bits en 1 = CIDR - Fin del octeto anterior`

  *(Los octetos anteriores finalizan en los bits 8, 16 y 24 respectivamente).*

### PASO 2: Calcular la Máscara de Subred (Subnet Mask)

Para obtener la máscara en el octeto afectado, suma los valores de los bits activados de **izquierda a derecha**:

| Bit en el Octeto | 1º | 2º | 3º | 4º | 5º | 6º | 7º | 8º | 
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | 
| **Valor del Bit** | **128** | **64** | **32** | **16** | **8** | **4** | **2** | **1** | 

* **1 bit (`10000000`)** → `128`

* **2 bits (`11000000`)** → `128 + 64 = 192`

* **3 bits (`11100000`)** → `128 + 64 + 32 = 224`

* **4 bits (`11110000`)** → `128 + 64 + 32 + 16 = 240`

* **5 bits (`11111000`)** → `248`

* **6 bits (`11111100`)** → `252`

* **7 bits (`11111110`)** → `254`

* **8 bits (`11111111`)** → `255`

### PASO 3: Calcular el Tamaño del Salto ("Magic Number")

El tamaño del salto determina el incremento entre redes consecutivas en el octeto afectado:

`Tamaño del Salto = 256 - Valor de la Máscara en el Octeto Afectado`

### PASO 4: Encontrar la Dirección de Red (Network ID)

Dada una IP de origen y una máscara:

1. Tomar el valor que posee la IP de origen en el **octeto afectado**.

2. Buscar el **múltiplo del salto** (Paso 3) que sea **menor o igual** a dicho número.

3. Reemplazar el octeto afectado por ese múltiplo.

4. Establecer todos los octetos a su derecha en `0`.

### PASO 5: Calcular la Dirección de Broadcast

1. Sumar el **Tamaño del Salto** a la dirección de red en el octeto afectado (para obtener el inicio de la siguiente red).

2. Restar 1 IP al resultado:

   * Restar 1 en el octeto afectado.

   * Cambiar todos los octetos a la derecha por **`255`**.

### PASO 6: Determinar el Rango Útil para Hosts

* **Primera IP Útil (First Host):** `ID de Red + 1` *(suma 1 en el 4to octeto)*.

* **Última IP Útil (Last Host):** `Broadcast - 1` *(resta 1 en el 4to octeto)*.

### Ejemplo 1: Escenario de Subnetting (4to octeto)

> **Problema:** Dada la IP `10.0.0.85/27`, encontrar la red, la máscara y el rango útil.

1. **Paso 1 (Bits):** El CIDR `/27` afecta al **4to octeto**. Bits de host: `32 - 27 = 5`.

2. **Paso 2 (Máscara):** Bits en el 4to octeto: `27 - 24 = 3 bits`. Suma: `128 + 64 + 32 = 224`. Máscara: `255.255.255.224`.

3. **Paso 3 (Salto):** `256 - 224 = 32`. *(Incrementos de 32 en el 4to octeto: `0, 32, 64, 96...`)*.

4. **Paso 4 (Red):** El 4to octeto de la IP es `85`. El múltiplo de 32 menor o igual a 85 es **64**.

   * **Network ID:** `10.0.0.64`.

5. **Paso 5 (Broadcast):** Siguiente red: `64 + 32 = 96`. La IP anterior a `10.0.0.96` es **`10.0.0.95`**.

6. **Paso 6 (Rango Útil):**

   * **Primer Host:** `10.0.0.65`

   * **Último Host:** `10.0.0.94`

### Ejemplo 2: Escenario de Supernetting (3er octeto)

> **Problema:** Agrupar direcciones a partir de `172.16.14.0` para alojar **1000 hosts**.

1. **Paso 1 (Bits de Host):** `Potencia de 2 >= 1000 + 2 → 2^10 = 1024`. Se requieren **10 bits de host**.

   * `CIDR = 32 - 10 = /22`. Afecta al **3er octeto**.

2. **Paso 2 (Máscara):** Bits en el 3er octeto: `22 - 16 = 6 bits`. Valor: `252`. Máscara: `255.255.252.0`.

3. **Paso 3 (Salto):** `256 - 252 = 4`. *(Incrementos de 4 en el 3er octeto: `0, 4, 8, 12, 16...`)*.

4. **Paso 4 (Red):** El 3er octeto es `14`. El múltiplo de 4 menor o igual a 14 es **12**.

   * **Network ID:** `172.16.12.0`.

5. **Paso 5 (Broadcast):** Siguiente red: `12 + 4 = 16` (`172.16.16.0`). Restamos 1 IP: **`172.16.15.255`**.

6. **Paso 6 (Rango Útil):**

   * **Primer Host:** `172.16.12.1`

   * **Último Host:** `172.16.15.254`

## Tabla de Referencia

| CIDR | Bits Host | Máscara Octeto | Tamaño de Salto | Total Direcciones | Hosts Útiles | 
| ----- | ----- | ----- | ----- | ----- | ----- | 
| **/30** | 2 | 252 | 4 | 4 | 2 | 
| **/29** | 3 | 248 | 8 | 8 | 6 | 
| **/28** | 4 | 240 | 16 | 16 | 14 | 
| **/27** | 5 | 224 | 32 | 32 | 30 | 
| **/26** | 6 | 192 | 64 | 64 | 62 | 
| **/25** | 7 | 128 | 128 | 128 | 126 | 
| **/24** | 8 | 0 (4to octeto) | 256 | 256 | 254 | 
| **/23** | 9 | 254 (3er octeto) | 2 (en 3er octeto) | 512 | 510 | 
| **/22** | 10 | 252 (3er octeto) | 4 (en 3er octeto) | 1024 | 1022 | 
| **/21** | 11 | 248 (3er octeto) | 8 (en 3er octeto) | 2048 | 2046 | 
