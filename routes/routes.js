import express from "express";
import {
  addProduct,
  getAllProducts,
} from "../Controllers/product.controller.js";

const router = express.Router();

router.get("/api/products", getAllProducts);
router.post("/api/products", addProduct);

export default router;
