const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel");

// POST route to handle order submission
router.post("/create", async (req, res) => {
  console.log("Request Body:", req.body); // Log the incoming request body

  const { userId, cartItems, deliveryInfo, totalPrice, scheduleDate } =
    req.body;

  // Check if userId is provided
  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }

  try {
    // Create a new order document
    const newOrder = new Order({
      user: userId, // Associate the order with the user
      items: cartItems,
      deliveryInfo,
      totalPrice,
      scheduleDate,
    });

    // Save the order to the database
    await newOrder.save();

    res
      .status(201)
      .json({ message: "Order saved successfully!", order: newOrder });
  } catch (err) {
    console.error("Error saving order:", err);
    res
      .status(500)
      .json({ error: "Error saving order.", details: err.message });
  }
});

// GET route to fetch orders by userId
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params; // Get userId from URL params

  // Check if userId is provided
  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }

  try {
    // Fetch orders for the given userId
    const orders = await Order.find({ user: userId });

    // Check if orders exist
    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this user." });
    }

    res.status(200).json({ message: "Orders retrieved successfully.", orders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res
      .status(500)
      .json({ error: "Error fetching orders.", details: err.message });
  }
});

module.exports = router;
