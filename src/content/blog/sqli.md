---
type: post
title: SQL Injection
description: Todo sobre inyección SQL
lang: es
---

> Permite a un atacante interferir en las consultas que una aplicación hace a su base de datos, permitiendole ver información que normalmente no podría, como información de otros usuarios o cualquier otra información a la que la aplicación puede acceder. También podría modificar o eliminar esta información.

Para detectarla se pueden enviar a cada punto de entrada, cualquier información que el backend podría utilizar para consultas SQL, de una aplicación:

- Una comilla simple (`'`) y buscar errores u otras anomalías.
- Una expresión que no cambie el valor, si se espera un número como un `5` enviar `6-1` y otra que sí lo cambie (`5*2`). Si la respuesta cambia en consecuencia, probablemente la entrada esté siendo evaluada como código SQL.
- Condiciones booleanas como `OR 1=1` y `OR 1=2` y buscar diferencias en las respuestas de la aplicación.
- Payloads diseñados para provocar retrasos en los tiempos de respuesta a la consulta SQL.

## SQL

### JOINS

### INNER JOIN

Proceso que coincide con las filas de la primera tabla y la segunda tabla que tienen la misma clave (definida por la restricción ON) para crear una fila de resultados con las columnas combinadas de ambas tablas.

## Recursos para aprender y practicar SQL y SQLi

- [SQLBolt](https://sqlbolt.com/)
- [HackerRank](https://www.hackerrank.com/domains/sql)
- [LeetCode](https://leetcode.com/problemset/database/)
- [PortSwigger](https://portswigger.net/web-security/learning-paths/sql-injection)