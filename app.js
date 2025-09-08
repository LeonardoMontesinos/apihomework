const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Crear producto
app.post("/productos", (req, res) => {
  const { nombre, categoria, cantidad, precio } = req.body;

  if (!nombre || !categoria || cantidad == null || precio == null) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  const sql =
    "INSERT INTO productos (nombre, categoria, cantidad, precio) VALUES (?, ?, ?, ?)";
  db.run(sql, [nombre, categoria, cantidad, precio], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ id: this.lastID, nombre, categoria, cantidad, precio });
  });
});

// Listar productos
app.get("/productos", (req, res) => {
  const sql = "SELECT * FROM productos";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Obtener producto por ID
app.get("/productos/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM productos WHERE id = ?";
  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!row) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(row);
  });
});

// Actualizar producto (nombre, precio, categoría)
app.patch("/productos/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, precio, categoria } = req.body;

  const campos = [];
  const valores = [];

  if (nombre) {
    campos.push("nombre = ?");
    valores.push(nombre);
  }
  if (precio) {
    campos.push("precio = ?");
    valores.push(precio);
  }
  if (categoria) {
    campos.push("categoria = ?");
    valores.push(categoria);
  }

  if (campos.length === 0) {
    return res.status(400).json({ error: "No hay campos para actualizar" });
  }

  valores.push(id);
  const sql = `UPDATE productos SET ${campos.join(", ")} WHERE id = ?`;

  db.run(sql, valores, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json({ message: "Producto actualizado" });
  });
});

// Actualizar stock (venta o reposición)
app.patch("/productos/:id/stock", (req, res) => {
  const { id } = req.params;
  const { cantidad, accion } = req.body; // accion = "v" (venta), "r" (reposicion)

  if (!cantidad || !accion) {
    return res
      .status(400)
      .json({ error: "Cantidad y acción son obligatorios" });
  }

  db.get("SELECT * FROM productos WHERE id = ?", [id], (err, product) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    let nuevaCantidad = product.cantidad;
    if (accion === "v") {
      if (cantidad > product.cantidad) {
        return res.status(400).json({ error: "Stock insuficiente" });
      }
      nuevaCantidad -= cantidad;
    } else if (accion === "r") {
      nuevaCantidad += cantidad;
    } else {
      return res.status(400).json({ error: "Acción inválida" });
    }

    db.run(
      "UPDATE productos SET cantidad = ? WHERE id = ?",
      [nuevaCantidad, id],
      function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Stock actualizado", cantidad: nuevaCantidad });
      }
    );
  });
});

// Eliminar producto
app.delete("/productos/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM productos WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json({ message: "Producto eliminado" });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
