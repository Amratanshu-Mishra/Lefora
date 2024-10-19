import { useState, useContext } from "react";
import Navbar from "../../components/Navbar";
import "./CartPage.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../services/CartContext";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const CartPage = ({ currentPage, handleNavClick }) => {
  const navigate = useNavigate();
  const { cartItems, setCartItems } = useContext(CartContext);

  const [deliveryInfo, setDeliveryInfo] = useState({
    name: "",
    mobile: "",
    email: "",
    city: "",
    state: "",
    zip: "",
    address: "",
    scheduleDate: "",
  });

  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showPayPal, setShowPayPal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState("");

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const validateInputs = () => {
    let validationErrors = {};
    if (!deliveryInfo.name) validationErrors.name = "Name is required";
    if (!deliveryInfo.mobile)
      validationErrors.mobile = "Mobile number is required";
    else if (!/^[0-9]{10}$/.test(deliveryInfo.mobile))
      validationErrors.mobile = "Invalid mobile number";
    if (!deliveryInfo.email) validationErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(deliveryInfo.email))
      validationErrors.email = "Invalid email address";
    if (!deliveryInfo.city) validationErrors.city = "City is required";
    if (!deliveryInfo.state) validationErrors.state = "State is required";
    if (!deliveryInfo.zip) validationErrors.zip = "ZIP code is required";
    else if (!/^[0-9]{5,6}$/.test(deliveryInfo.zip))
      validationErrors.zip = "Invalid ZIP code";
    if (!deliveryInfo.address) validationErrors.address = "Address is required";
    if (!deliveryInfo.scheduleDate)
      validationErrors.scheduleDate = "Schedule date is required";

    return validationErrors;
  };

  const handleInputChange = (e) => {
    setDeliveryInfo({ ...deliveryInfo, [e.target.name]: e.target.value });
  };

  const handleApprove = async (orderID) => {
    try {
      const token = localStorage.getItem("token"); // Get the token from local storage
      const response = await axios.post(
        "http://localhost:3001/api/orders/create",
        {
          cartItems,
          deliveryInfo,
          totalPrice,
          scheduleDate: deliveryInfo.scheduleDate,
          paymentMethod: "PayPal",
          orderID,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request headers
          },
        }
      );

      if (response.status === 201) {
        setOrderSuccess(true);
        setOrderError("");
        navigate("/thankYou");
      }
    } catch (err) {
      setOrderError("Error saving order: " + err.message);
    }
  };

  const handleConfirmOrder = async () => {
    const validationErrors = validateInputs();
    if (Object.keys(validationErrors).length === 0) {
      setOrderError(""); // Clear previous errors

      const token = localStorage.getItem("token"); // Get the token from local storage
      if (paymentMethod === "online") {
        setShowPayPal(true);
      } else {
        try {
          const response = await axios.post(
            "http://localhost:3001/api/orders/create",
            {
              cartItems,
              deliveryInfo,
              totalPrice,
              scheduleDate: deliveryInfo.scheduleDate,
              paymentMethod: paymentMethod === "cod" ? "COD" : "POS",
            },
            {
              headers: {
                Authorization: `Bearer ${token}`, // Include the token in the request headers
              },
            }
          );

          if (response.status === 201) {
            setOrderSuccess(true);
            navigate("/thankYou");
          }
        } catch (err) {
          setOrderError("Error saving order: " + err.message);
        }
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const handleIncrement = (id) => {
    const updatedCartItems = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updatedCartItems);
  };

  const handleDecrement = (id) => {
    const updatedCartItems = cartItems.map((item) =>
      item.id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    setCartItems(updatedCartItems);
  };

  return (
    <>
      <Navbar currentPage={currentPage} handleNavClick={handleNavClick} />
      <div className="cart-page">
        <div className="left-section">
          <h2>Delivery Information</h2>
          <div className="delivery-info">
            <form>
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter Your Name"
                    value={deliveryInfo.name}
                    onChange={handleInputChange}
                  />
                  {errors.name && <p className="error">{errors.name}</p>}
                </div>
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input
                    type="phone"
                    name="mobile"
                    placeholder="Enter Your Number"
                    value={deliveryInfo.mobile}
                    onChange={handleInputChange}
                  />
                  {errors.mobile && <p className="error">{errors.mobile}</p>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter Your Email"
                    value={deliveryInfo.email}
                    onChange={handleInputChange}
                  />
                  {errors.email && <p className="error">{errors.email}</p>}
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Enter Your City"
                    value={deliveryInfo.city}
                    onChange={handleInputChange}
                  />
                  {errors.city && <p className="error">{errors.city}</p>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="Enter Your State"
                    value={deliveryInfo.state}
                    onChange={handleInputChange}
                  />
                  {errors.state && <p className="error">{errors.state}</p>}
                </div>
                <div className="form-group">
                  <label>ZIP</label>
                  <input
                    type="number"
                    name="zip"
                    placeholder="Enter Your Zip/Postal Code"
                    value={deliveryInfo.zip}
                    onChange={handleInputChange}
                  />
                  {errors.zip && <p className="error">{errors.zip}</p>}
                </div>
              </div>
              <div className="form-group full-width">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Enter Your Address"
                  value={deliveryInfo.address}
                  onChange={handleInputChange}
                />
                {errors.address && <p className="error">{errors.address}</p>}
              </div>
              <div className="form-group full-width">
                <label>Schedule Date</label>
                <input
                  type="date"
                  name="scheduleDate"
                  value={deliveryInfo.scheduleDate}
                  onChange={handleInputChange}
                />
                {errors.scheduleDate && (
                  <p className="error">{errors.scheduleDate}</p>
                )}
              </div>
            </form>
          </div>

          <div>
            <h2>Payment Method</h2>
            <div className="payment-method">
              <div className="payment-options">
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    onChange={handlePaymentChange}
                  />
                  Online Payment (PayPal)
                </label>
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    onChange={handlePaymentChange}
                  />
                  Cash on Delivery
                </label>
              </div>
            </div>
          </div>

          {showPayPal && paymentMethod === "online" && (
            <PayPalScriptProvider
              options={{
                "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
                currency: "USD",
              }}
            >
              <PayPalButtons
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [
                      {
                        amount: {
                          value: totalPrice.toFixed(2),
                        },
                      },
                    ],
                  });
                }}
                onApprove={(data) => handleApprove(data.orderID)} // Pass orderID to handleApprove
              />
            </PayPalScriptProvider>
          )}

          <button onClick={handleConfirmOrder}>Confirm Order</button>

          {orderError && <p className="error">{orderError}</p>}
          {orderSuccess && <p>Order placed successfully!</p>}
        </div>

        <div className="right-section">
          <h2>Order Summary</h2>
          <div className="order-summary">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.img}
                  alt={item.name}
                  className="cart-item-image"
                />
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p>Price: ${item.price.toFixed(2)}</p>
                  <p>Quantity: {item.quantity}</p>
                  <div className="quantity-controls">
                    <button onClick={() => handleIncrement(item.id)}>+</button>
                    <button onClick={() => handleDecrement(item.id)}>-</button>
                  </div>
                </div>
              </div>
            ))}
            <h3>Total Price: ${totalPrice.toFixed(2)}</h3>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;
