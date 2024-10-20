const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId, // Store Object IDs referencing the orders
      ref: "Order", // Reference the 'Order' collection
    },
  ],
});

const User = mongoose.model("User", userSchema);
module.exports = User;
