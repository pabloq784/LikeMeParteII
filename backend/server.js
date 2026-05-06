const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

//  Middleware
app.use(cors());
app.use(express.json());


/* =========================
   GET /
========================= */
app.get("/posts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener posts");
  }
});


/* =========================
   POST /
========================= */

app.post("/posts", async (req, res) => {
  try {
    const { titulo, img, descripcion } = req.body;

    // validación 
    if (!titulo || !img || !descripcion) {
      return res.status(400).send("Faltan datos");
    }

    await pool.query(
      "INSERT INTO posts (titulo, img, descripcion, likes) VALUES ($1, $2, $3, $4)",
      [titulo, img, descripcion, 0]
    );

    res.send("Post agregado");
  } catch (error) {
    console.error("ERROR REAL:", error);
    res.status(500).send("Error al guardar post");
  }
});


/* =========================
   PUT /
========================= */

app.put("/posts/like/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 👇 GUARDAR resultado
    const result = await pool.query(
      "UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING *",
      [id]
    );

    // 👇 VALIDACIÓN
    if (result.rowCount === 0) {
      return res.status(404).send("Post no encontrado");
    }

    res.status(200).send("Like agregado");

  } catch (error) {
    console.error("ERROR REAL:", error);
    res.status(500).send("Error al dar like");
  }
});


/* =========================
   DELETE /
========================= */

app.delete("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM posts WHERE id = $1 RETURNING *",
      [id]
    );

    // 👇 Validación
    if (result.rowCount === 0) {
      return res.status(404).send("Post no encontrado");
    }

    res.status(200).send("Post eliminado");

  } catch (error) {
    console.error("ERROR REAL:", error);
    res.status(500).send("Error al eliminar");
  }
});


/* =========================
   SERVER
========================= */

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});