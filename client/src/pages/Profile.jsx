import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./profile.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Profile({ currentPage, handleNavClick }) {
  const { userId } = useParams(); // Gets the user ID from the URL
  const [user, setUser] = useState({ name: "", email: "" }); // State to store user data
  const [orders, setOrders] = useState([]); // State to store user orders
  const [editing, setEditing] = useState(false); // State to track editing mode
  const [error, setError] = useState(""); // State for error handling
  const [loading, setLoading] = useState(true); // State for loading status
  const [currentPassword, setCurrentPassword] = useState(""); // State for current password
  const [newPassword, setNewPassword] = useState(""); // State for new password
  const [passwordError, setPasswordError] = useState(""); // State for password change error
  const [changingPassword, setChangingPassword] = useState(false); // State for password change mode

  // Fetch user profile data and orders when the component mounts
  useEffect(() => {
    console.log("User ID from URL:", userId); // Log the ID
    const fetchUserProfile = async () => {
      if (userId) {
        // Check if ID is defined
        try {
          // Fetch user profile
          const res = await axios.get(
            `http://localhost:3001/api/users/profile/${userId}`
          );
          console.log("Fetched profile data:", res.data); // Log the profile data received
          setUser(res.data); // Set the user data

          // Fetch user orders linked to the user
          const ordersRes = await axios.get(
            `http://localhost:3001/api/orders?userId=${userId}` // Updated endpoint with userId query parameter
          );
          console.log("Fetched user orders:", ordersRes.data); // Log the orders data
          setOrders(ordersRes.data); // Set the user orders
        } catch (err) {
          setError("Error fetching profile or order data. Please try again.");
          console.error("Error fetching profile or orders", err);
        } finally {
          setLoading(false);
        }
      } else {
        setError("User ID is not defined."); // Handle undefined ID
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  // Handle profile update (PUT request)
  const handleUpdate = async (e) => {
    e.preventDefault(); // Prevents the form from refreshing the page

    console.log("User data to update:", user); // Log the user data before sending the update request

    try {
      await axios.put(
        `http://localhost:3001/api/users/profile/${userId}`,
        user
      );
      alert("Profile updated successfully!");
      setEditing(false); // Exit editing mode after successful update
    } catch (err) {
      setError("Error updating profile. Please try again."); // Error handling
      console.error("Error updating profile", err);
    }
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault(); // Prevents the form from refreshing the page

    if (!currentPassword || !newPassword) {
      setPasswordError("Both fields are required.");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:3001/api/users/change-password/${userId}`,
        { currentPassword, newPassword }
      );
      alert(res.data.message || "Password changed successfully!");
      setChangingPassword(false); // Exit changing password mode
    } catch (err) {
      setPasswordError("Error changing password. Please try again.");
      console.error("Error changing password", err);
    }
  };

  return (
    <>
      <Navbar currentPage={currentPage} handleNavClick={handleNavClick} />
      <div className="profile-container">
        <div className="profile-card">
          <h1>Profile</h1>
          {loading ? (
            <p>Loading...</p> // Loading state
          ) : (
            <>
              {error && <div className="alert alert-danger">{error}</div>}{" "}
              {/* Display error if any */}
              {editing ? (
                <form onSubmit={handleUpdate} className="profile-form">
                  <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input
                      type="text"
                      id="name"
                      value={user.name}
                      onChange={(e) =>
                        setUser({ ...user, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                      type="email"
                      id="email"
                      value={user.email}
                      onChange={(e) =>
                        setUser({ ...user, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <button type="submit" className="btn save-btn">
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn cancel-btn"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </button>

                  {/* Change Password Section */}
                  <div className="change-password-section">
                    <h2>Change Password</h2>
                    {changingPassword ? (
                      <form
                        onSubmit={handleChangePassword}
                        className="change-password-form"
                      >
                        <div className="form-group">
                          <label htmlFor="currentPassword">
                            Current Password:
                          </label>
                          <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="newPassword">New Password:</label>
                          <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="btn change-password-btn"
                        >
                          Change Password
                        </button>
                        <button
                          type="button"
                          className="btn cancel-btn"
                          onClick={() => setChangingPassword(false)}
                        >
                          Cancel
                        </button>
                        {passwordError && (
                          <div className="alert alert-danger">
                            {passwordError}
                          </div>
                        )}
                      </form>
                    ) : (
                      <button
                        onClick={() => setChangingPassword(true)}
                        className="btn change-password-btn"
                      >
                        Change Password
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <div className="profile-info">
                  <p>
                    <strong>Name:</strong> {user.username}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <button
                    onClick={() => setEditing(true)}
                    className="btn edit-btn"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* New Section for User's Orders */}
        <div className="user-orders">
          <h2>Your Orders</h2>
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order._id} className="order">
                <p>
                  <strong>Order ID:</strong> {order._id}
                </p>
                <p>
                  <strong>Total Price:</strong> ${order.totalPrice}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(order.date).toLocaleDateString()}
                </p>
                {/* Add more details about the order as needed */}
              </div>
            ))
          ) : (
            <p>No orders found.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Profile;
