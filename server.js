const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();
const app = express();
// Connect Database
connectDB();
app.use(cors());
app.use(express.json());
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
app.get("/", (req, res) => {
  res.send("ShopEZ API Running");
});
app.get("/api/status", (req, res) => {
  res.json({
    status: "running",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});
// Mount Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});