const mongoose = require("mongoose");

// Define the order schema
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the User model
    ref: "User",
    required: true, // Ensure this field is always present
  },
  items: [
    {
      id: { type: Number, required: true }, // Item ID
      name: { type: String, required: true }, // Item name
      price: { type: Number, required: true }, // Item price
      quantity: { type: Number, required: true }, // Quantity of the item
      img: { type: String }, // Image URL of the item
    },
  ],
  deliveryInfo: {
    name: { type: String, required: true }, // Recipient's name
    mobile: { type: String, required: true }, // Recipient's mobile number
    email: { type: String, required: true }, // Recipient's email
    city: { type: String, required: true }, // City of delivery
    state: { type: String, required: true }, // State of delivery
    zip: { type: String, required: true }, // Zip code
    address: { type: String, required: true }, // Delivery address
  },
  totalPrice: { type: Number, required: true }, // Total price of the order
  date: {
    type: Date,
    default: Date.now, // Default to current date
  },
  scheduleDate: {
    type: Date, // Scheduled delivery date
  },
});

// Create the Order model
const Order = mongoose.model("Order", orderSchema);

// Export the Order model
module.exports = Order;
