---
type: post
title: Go
description: ""
lang: es
draft: false
---

[The Go Playground](https://go.dev/play/)

## Tipos de datos

**Struct**: Agrupa varios valores (llamados campos) de diferentes tipos bajo un mismo nombre.

```go
type RequestData struct {
	Action string `json:"action"`
}
```

- **RequestData**: Nombre del `struct`
- **Action**: Nombre de un campo del `struct`
- **string**: Tipo de dato del campo `Action`
- **json:"action"**: Etiqueta de `struct`, indica que cuando este `struct` se convierta a **JSON**, el campo `Action` se traducirá con el nombre "action" (en minúsculas).