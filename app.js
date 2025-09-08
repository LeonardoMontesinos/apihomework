const express = require("express");
const db = require("./db"); // Importamos la conexión a la base de datos

const app = express();
const PORT = 3000;

app.use(express.json());

// Categorías fijas
const categoriasPermitidas = ["Electrónica", "Ropa", "Alimentos", "Muebles", "Libros"];

// ==================== ENDPOINTS ==================== //

// Listar todos los productos
app.get("/productos", (req, res) => {
  db.all("SELECT * FROM productos", [], (err, rows) => {
    if (err) return res.status(500).json({ mensaje: "Error al obtener productos" });
    res.json(rows);
  });
});

// Obtener un producto por ID
app.get("/productos/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM productos WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ mensaje: "Error al buscar el producto" });
    if (!row) return res.status(404).json({ mensaje: "Producto no encontrado" });
    res.json(row);
  });
});

// Crear producto
app.post("/productos", (req, res) => {
  const { nombre, categoria, cantidad, precio } = req.body;

  if (!categoriasPermitidas.includes(categoria)) {
    return res.status(400).json({ mensaje: "Categoría inválida. Debe ser una de: " + categoriasPermitidas.join(", ") });
  }

  db.run(
    "INSERT INTO productos (nombre, categoria, cantidad, precio) VALUES (?, ?, ?, ?)",
    [nombre, categoria, cantidad, precio],
    function (err) {
      if (err) return res.status(500).json({ mensaje: "Error al agregar producto" });
      res.status(201).json({ mensaje: "Producto agregado correctamente", id: this.lastID });
    }
  );
});

// Actualizar producto
app.put("/productos/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, cantidad, precio } = req.body;

  if (!categoriasPermitidas.includes(categoria)) {
    return res.status(400).json({ mensaje: "Categoría inválida. Debe ser una de: " + categoriasPermitidas.join(", ") });
  }

  db.run(
    "UPDATE productos SET nombre = ?, categoria = ?, cantidad = ?, precio = ? WHERE id = ?",
    [nombre, categoria, cantidad, precio, id],
    function (err) {
      if (err) return res.status(500).json({ mensaje: "Error al actualizar producto" });
      if (this.changes === 0) return res.status(404).json({ mensaje: "Producto no encontrado" });
      res.json({ mensaje: "Producto actualizado correctamente" });
    }
  );
});

// Vender o reponer stock (PATCH)
app.patch("/productos/:id/stock", (req, res) => {
  const { id } = req.params;
  const { cantidadVendida = 0, cantidadRepuesta = 0 } = req.body;

  db.get("SELECT cantidad FROM productos WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ mensaje: "Error al buscar producto" });
    if (!row) return res.status(404).json({ mensaje: "Producto no encontrado" });

    let nuevaCantidad = row.cantidad - cantidadVendida + cantidadRepuesta;
    if (nuevaCantidad < 0) return res.status(400).json({ mensaje: "Stock insuficiente" });

    db.run("UPDATE productos SET cantidad = ? WHERE id = ?", [nuevaCantidad, id], function (err) {
      if (err) return res.status(500).json({ mensaje: "Error al actualizar stock" });
      res.json({ mensaje: "Stock actualizado correctamente", stockActual: nuevaCantidad });
    });
  });
});

// Eliminar producto
app.delete("/productos/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM productos WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ mensaje: "Error al eliminar producto" });
    if (this.changes === 0) return res.status(404).json({ mensaje: "Producto no encontrado" });
    res.json({ mensaje: "Producto eliminado correctamente" });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
