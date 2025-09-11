// server/index.js
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
