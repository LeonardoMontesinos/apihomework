const express = require("express");
const db = require("./db"); // Importamos la conexión a la base de datos

const app = express();

app.use(express.json());

// Categorías válidas
const categoriasValidas = ["Electrónica", "Muebles", "Ropa", "Alimentos", "Juguetes"];

// Endpoints

// Obtener todos los productos
app.get("/productos", (req, res) => {
  db.all("SELECT * FROM productos", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Crear un nuevo producto
app.post("/productos", (req, res) => {
  const { nombre, categoria, stock, precio } = req.body;

  if (!categoriasValidas.includes(categoria)) {
    return res.status(400).json({ error: "Categoría inválida" });
  }

  const sql = "INSERT INTO productos (nombre, categoria, stock, precio) VALUES (?, ?, ?, ?)";
  db.run(sql, [nombre, categoria, stock, precio], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      mensaje: "Producto creado correctamente",
      id: this.lastID,
    });
  });
});

// PATCH - Actualizar stock (venta o reposición)
app.patch("/productos/:id/stock", (req, res) => {
  const { accion, cantidad } = req.body;
  const id = req.params.id;

  db.get("SELECT * FROM productos WHERE id = ?", [id], (err, producto) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    let nuevoStock = producto.stock;
    if (accion === "v") {
      if (cantidad > producto.stock) {
        return res.status(400).json({ error: "Stock insuficiente" });
      }
      nuevoStock -= cantidad;
    } else if (accion === "r") {
      nuevoStock += cantidad;
    } else {
      return res.status(400).json({ error: "Acción inválida" });
    }

    db.run("UPDATE productos SET stock = ? WHERE id = ?", [nuevoStock, id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ mensaje: "Stock actualizado correctamente", id, stock: nuevoStock });
    });
  });
});

// PATCH - Actualizar información (nombre, categoría, precio)
app.patch("/productos/:id/info", (req, res) => {
  const { nombre, categoria, precio } = req.body;
  const id = req.params.id;

  db.get("SELECT * FROM productos WHERE id = ?", [id], (err, producto) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const nuevoNombre = nombre || producto.nombre;
    const nuevaCategoria = categoria || producto.categoria;
    const nuevoPrecio = precio !== undefined ? precio : producto.precio;

    if (!categoriasValidas.includes(nuevaCategoria)) {
      return res.status(400).json({ error: "Categoría inválida" });
    }

    db.run(
      "UPDATE productos SET nombre = ?, categoria = ?, precio = ? WHERE id = ?",
      [nuevoNombre, nuevaCategoria, nuevoPrecio, id],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({
          mensaje: "Información del producto actualizada correctamente",
          id,
          nombre: nuevoNombre,
          categoria: nuevaCategoria,
          precio: nuevoPrecio,
        });
      }
    );
  });
});

// Eliminar un producto
app.delete("/productos/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM productos WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json({ mensaje: `Producto con id ${id} eliminado correctamente` });
  });
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});