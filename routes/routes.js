import express from "express";
import { login, signup } from "../Controllers/auth.controller.js";
import {
  createCollection,
  getAllCollections,
} from "../Controllers/collection.controller.js";
import {
  addProduct,
  getAllProducts,
} from "../Controllers/product.controller.js";

const router = express.Router();

router.get("/api/products", getAllProducts);
router.post("/api/products", addProduct);

router.post("/api/auth/signup", signup);
router.post("/api/auth/login", login);

router.post("/api/collection", createCollection);
router.get("/api/collection", getAllCollections);

export default router;
