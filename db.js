const sqlite3 = require("sqlite3").verbose();

// Conexión a la base de datos
const db = new sqlite3.Database("inventario.sqlite", (err) => {
  if (err) {
    console.error("Error al conectar con la base de datos:", err.message);
  } else {
    console.log("Conectado a la base de datos SQLite");
  }
});

// Crear tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS productos (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK(categoria IN ('Electrónica','Ropa','Alimentos','Muebles','Libros')),
  cantidad INTEGER NOT NULL,
  precio REAL NOT NULL
)`);

module.exports = db;