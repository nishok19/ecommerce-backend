import Product from "../models/product.schema.js";
import User from "../models/user.schema.js";
import formidable from "formidable";
import fs from "fs";
import { deleteFile, s3FileUpload } from "../services/imageUpload.js";
import Mongoose from "mongoose";
import asyncHandler from "../services/asyncHandler.js";
import CustomError from "../utils/customError.js";
import config from "../config/index.js";

/**********************************************************
 * @ADD_PRODUCT
 * @route https://localhost:5000/api/product
 * @description Controller used for creating a new product
 * @description Only admin can create the coupon
 * @descriptio Uses AWS S3 Bucket for image upload
 * @returns Product Object
 *********************************************************/

export const addProduct = asyncHandler(async (req, res) => {
  const form = formidable({
    multiples: true,
    keepExtensions: true,
  });

  form.parse(req, async function (err, fields, files) {
    try {
      if (err) {
        throw new CustomError(err.message || "Something went wrong", 500);
      }
      let productId = new Mongoose.Types.ObjectId().toHexString();
      //console.log(fields, files)

      // check for fields
      if (
        !fields.name ||
        !fields.price ||
        !fields.description ||
        !fields.collectionId
      ) {
        throw new CustomError("Please fill all details", 500);
      }

      // handling images
      let imgArrayResp = Promise.all(
        Object.keys(files).map(async (filekey, index) => {
          const element = files[filekey];

          const data = fs.readFileSync(element.filepath);

          const upload = await s3FileUpload({
            bucketName: config.S3_BUCKET_NAME,
            key: `products/${productId}/photo_${index + 1}.png`,
            body: data,
            contentType: element.mimetype,
          });
          return {
            secure_url: upload.Location,
          };
        })
      );

      let imgArray = await imgArrayResp;

      const product = await Product.create({
        _id: productId,
        photos: imgArray,
        ...fields,
      });

      if (!product) {
        throw new CustomError("Product was not created", 400);
        //remove image
      }
      res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message || "Something went wrong",
      });
    }
  });
});

/**********************************************************
 * @GET_ALL_PRODUCT
 * @route https://localhost:5000/api/product
 * @description Controller used for getting all products details
 * @description User and admin can get all the prducts
 * @returns Products Object
 *********************************************************/

export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});

  if (!products) {
    throw new CustomError("No product was found", 404);
  }
  res.status(200).json({
    success: true,
    products,
    user: req.user,
  });
});

/**********************************************************
 * @GET_PRODUCT_BY_ID
 * @route https://localhost:5000/api/product
 * @description Controller used for getting single product details
 * @description User and admin can get single product details
 * @returns Product Object
 *********************************************************/

export const getProductById = asyncHandler(async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findById(productId);

  if (!product) {
    throw new CustomError("No product was found", 404);
  }
  res.status(200).json({
    success: true,
    product,
  });
});

/**********************************************************
 * @ADD_TO_CART
 * @route https://localhost:5000/api/product/cart/:id
 * @description Controller used for adding a product to the user's cart
 * @description User can add a product to their cart
 * @returns Products Object
 *********************************************************/

export const addProductToUserCart = asyncHandler(async (req, res) => {
  const { id: productId } = req.params;
  const { _id: userId } = req.user;

  const user = await User.findById(userId);

  if (!user) throw new CustomeError("No user was found", 404);

  const newProduct = { productId, count: 1 };

  const isProductPresent = await user.cart.filter(
    (item) => item.productId.toString() === productId
  );

  if (isProductPresent.length !== 0) {
    res.status(204).json({ success: true });
    return;
  }

  await user.cart.push(newProduct);

  user.save();

  res.status(200).json({
    success: true,
    user,
  });
});

/**********************************************************
 * @UPDATE_TO_CART
 * @route https://localhost:5000/api/cart/:id
 * @description Updating the cart
 * @description User can increase or decrease the number of items in the cart
 * @returns User Object
 *********************************************************/

export const updateCartProductCount = asyncHandler(async (req, res) => {
  const { id: productId } = req.params;
  const { count } = req.body;
  const { _id: userId } = req.user;

  const user = await User.findById(userId);

  if (!user) throw new CustomeError("No user was found", 404);

  user.cart.map((item) => {
    if (item.productId.toString() === productId) {
      item.count = count;
    }
  });

  user.save();

  return res.status(200).json({
    success: true,
    user,
  });
});

/**********************************************************
 * @DELETE_TO_CART
 * @route https://localhost:5000/api/cart/:id
 * @description Deleting a product from the cart
 * @description User can remove a product from the cartu
 * @returns User Object
 *********************************************************/

export const deleteCartProduct = asyncHandler(async (req, res) => {
  const { id: productId } = req.params;
  const { _id: userId } = req.user;

  const user = await User.findById(userId);

  if (!user) throw new CustomeError("No user was found", 404);

  const newCart = user.cart.filter(
    (item) => item.productId.toString() !== productId
  );

  user.cart = newCart;

  user.save();

  return res.status(200).json({
    success: true,
    user,
    productId,
  });
});

/**********************************************************
 * @SEARCH_PRODUCTS
 * @route https://localhost:5000/api/product/:searchText
 * @description Controller used for searching products using a keyword
 * @description Searching the products for a keyword
 * @returns Products Object
 *********************************************************/
export const searchProducts = asyncHandler(async (req, res) => {
  const { searchText } = req.params;

  let products = await Product.find({
    $or: [
      { name: new RegExp(searchText, "i") },
      { description: new RegExp(searchText, "i") },
    ],
  });

  return res.status(200).json({
    success: true,
    products,
  });
});
