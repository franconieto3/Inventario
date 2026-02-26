import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js"
import documentRoutes from "./routes/document.routes.js";
import componentRoutes from "./routes/component.routes.js";


// Middlewares
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

app.use("/auth", authRoutes);
app.use("/api/productos", productRoutes);
app.use('/api/documentos', documentRoutes);
app.use('/api/componentes', componentRoutes);


const PORT = 4000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
