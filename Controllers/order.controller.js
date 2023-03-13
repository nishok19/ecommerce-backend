import Product from "../models/product.schema.js";
import Coupon from "../models/coupon.schema.js";
import User from "../models/user.schema.js";
import Order from "../models/order.schema.js";
import asyncHandler from "../services/asyncHandler.js";
import CustomError from "../utils/customError.js";
import { razorpay } from "../config/razorpay.config.js";

/**********************************************************
 * @GENEARATE_RAZORPAY_ID
 * @route https://localhost:5000/api/order/razorpay
 * @description Controller used for genrating razorpay Id
 * @description Creates a Razorpay Id which is used for placing order
 * @returns Order Object with "Razorpay order id generated successfully"
 *********************************************************/

export const generateRazorpayOrderId = asyncHandler(async (req, res) => {
  //get product and coupon from frontend
  const { productIds } = req.body;

  //verfiy product price from backend

  // make DB query to get all products and info
  const products = await Product.find().where("_id").in(productIds);

  let totalAmount = 0;

  await products.map((p) => {
    totalAmount = totalAmount + p.price;
  });

  //total amount and final amount
  // coupon check - DB
  // disount
  // finalAmount = totalAmount - discount

  if (totalAmount === 0) throw new CustomError("Amount to bill is 0");

  const options = {
    amount: Math.round(totalAmount * 100),
    currency: "INR",
    receipt: `receipt_${new Date().getTime()}`,
  };

  const order = await razorpay.orders.create(options);

  //if order does not exist
  if (!order) throw new CustomError("Error in placing the order ", order);

  // success then, send it to front end
  res.status(200).json({
    success: true,
    order,
  });
});

/**********************************************************
 * @UPDATE_SUCCESSFUL_PAYMENT
 * @route https://localhost:5000/api/order/razorpay/success
 * @description Controller used for updating the database on successful payment
 * @description Adds the items to the orders list in User data
 * @returns Order Object with User
 *********************************************************/

export const updateSuccessPayment = asyncHandler(async (req, res) => {
  const { data: rzp } = req.body;
  const { _id: userId } = req.user;

  if (!rzp.razorpay_payment_id && !rzp.razorpay_order_id && !razorpay_signature)
    throw new CustomError(
      "Error in updating the entries after successful payment ",
      rzp
    );

  //
  const user = await User.findById(userId);

  if (!user) throw new CustomError("User not found", 400);

  user.cart.map((item) => {
    user.orders.push(item);
  });

  console.log("dataaaaaaa", user.orders, user.cart);
  user.cart = [];

  user.save();

  res.status(200).json({
    success: true,
    user,
  });
});
