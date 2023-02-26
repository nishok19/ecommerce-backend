import express from "express";
import { login, logout, signup } from "../Controllers/auth.controller.js";
import {
  createCollection,
  getAllCollections,
} from "../Controllers/collection.controller.js";
import {
  addProduct,
  addProductToUserCart,
  deleteCartProduct,
  getAllProducts,
  searchProducts,
  updateCartProductCount,
} from "../Controllers/product.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/api/products", isLoggedIn, getAllProducts);
router.post("/api/products", isLoggedIn, addProduct);
router.get("/api/products/:searchText", isLoggedIn, searchProducts);

router.post("/api/cart/:id", isLoggedIn, addProductToUserCart);
router.put("/api/cart/:id", isLoggedIn, updateCartProductCount);
router.delete("/api/cart/:id", isLoggedIn, deleteCartProduct);

router.post("/api/auth/signup", signup);
router.post("/api/auth/login", login);
router.get("/api/auth/logout", logout);

router.post("/api/collection", isLoggedIn, createCollection);
router.get("/api/collection", isLoggedIn, getAllCollections);

export default router;
