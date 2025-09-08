# Taller 2 - Cloud Computing

## Estructura del repositorio

```
apihomework/
│── app.js
│── db.js
│── inventario.sqlite (se crea automáticamente al levantar la base de datos)
└── README.md
```

---

## Instalacion y uso

### 1. Clonar el repositorio
```bash
git clone https://github.com/LeonardoMontesinos/apihomework
cd apihomework
```

### 2. Instalar dependencias
```bash
npm install sqlite3 express
```

### 3. Ejecutar la base de datos

```bash
node db.js
```
### 4. Ejecuta la API (app.js)
```bash
node app.js
```

Por defecto, el servidor corre en el puerto 3000:  
`http://localhost:3000`

---

## Ejemplos de uso de la API
Una guia de como realizar las llamadas a los endpoints(Los bodys estan incluidos en la coleccion de Postman)

### Crear un producto
**POST /productos**
```json
{
  "nombre": "Laptop ASUS",
  "categoria": "Electrónica",
  "cantidad": 20,
  "precio": 2800
}
```

### Actualizar stock (venta)
**PATCH /productos/1/cantidad**
```json
{
  "accion": "v",
  "cantidad": 3
}
```
### Actualizar stock (reposicion)
**PATCH /productos/1/cantidad**
```json
{
  "accion": "r",
  "cantidad": 10
}
```

### Actualizar información
**PATCH /productos/1/info**
```json
{
  "nombre": "Laptop Asus TUF",
  "categoria": "Electrónica",
  "precio": 2700
}
```

---

## Postman

En el repositorio se incluye un archivo JSON con una colección en Postman para verificar el funcionamiento de los endpoints.
También es accesible en el siguiente enlace:

🔗 [Colección de Postman - API Inventario](https://www.postman.com/cryosat-cosmologist-31400775/talleres-cloud/collection/3jl372q/api-inventario?action=share&source=copy-link&creator=48242319)

---

## O

- Si el archivo `inventario.sqlite` no existe, se crea automáticamente.
- Categorías válidas: `Electrónica`, `Ropa`, `Alimentos`, `Muebles`, `Libros`.

---
