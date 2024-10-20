import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  FiEdit,
  FiSave,
  FiX,
  FiLock,
  FiPackage,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./profile.css";

export default function Profile({ currentPage, handleNavClick }) {
  const { userId } = useParams();
  const [user, setUser] = useState({ name: "", email: "", username: "" });
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchUserProfileAndOrdersAndPosts = async () => {
      if (!userId) {
        setError("User ID is not defined.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // Fetch user profile
        const userResponse = await axios.get(
          `http://localhost:3001/api/users/profile/${userId}`
        );
        const user = userResponse.data;
        setUser(user);

        // Fetch user orders
        const ordersResponse = await axios.get(
          `http://localhost:3001/api/orders/user/${userId}`
        );
        setOrders(ordersResponse.data.orders);

        // Fetch user posts using the author field (assume it's username or email)
        const postsResponse = await axios.get(
          `http://localhost:3001/api/posts/author/${user.username}` // or use `user.email` if author is based on email
        );
        setPosts(postsResponse.data); // Assuming response.data contains the list of posts
      } catch (err) {
        setError(
          "Error fetching profile, orders, or posts data. Please try again."
        );
        console.error("Error fetching profile, orders, or posts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfileAndOrdersAndPosts();
  }, [userId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:3001/api/users/profile/${userId}`,
        user
      );
      alert("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      setError("Error updating profile. Please try again.");
      console.error("Error updating profile", err);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
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
      setChangingPassword(false);
    } catch (err) {
      setPasswordError("Error changing password. Please try again.");
      console.error("Error changing password", err);
    }
  };

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <>
      <Navbar currentPage={currentPage} handleNavClick={handleNavClick} />
      <div className="profile-container">
        <div className="profile-info">
          <h2 className="text-xl font-bold">Profile</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              {error && <div className="text-red-500 mb-4">{error}</div>}
              {editing ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label htmlFor="name">Name:</label>
                    <input
                      type="text"
                      id="name"
                      value={user.name}
                      onChange={(e) =>
                        setUser({ ...user, name: e.target.value })
                      }
                      className="border rounded p-2 w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="email">Email:</label>
                    <input
                      type="email"
                      id="email"
                      value={user.email}
                      onChange={(e) =>
                        setUser({ ...user, email: e.target.value })
                      }
                      required
                      className="border rounded p-2 w-full"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="bg-blue-500 text-white p-2 rounded"
                    >
                      <FiSave className="mr-2" /> Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="border rounded p-2"
                    >
                      <FiX className="mr-2" /> Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2">
                  <p>
                    <strong>Name:</strong> {user.username}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-blue-500 text-white p-2 rounded"
                  >
                    <FiEdit className="mr-2" /> Edit Profile
                  </button>
                </div>
              )}
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                {changingPassword ? (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword">Current Password:</label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="border rounded p-2 w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="newPassword">New Password:</label>
                      <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="border rounded p-2 w-full"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded"
                      >
                        <FiLock className="mr-2" /> Change Password
                      </button>
                      <button
                        type="button"
                        onClick={() => setChangingPassword(false)}
                        className="border rounded p-2"
                      >
                        <FiX className="mr-2" /> Cancel
                      </button>
                    </div>
                    {passwordError && (
                      <div className="text-red-500 mt-2">{passwordError}</div>
                    )}
                  </form>
                ) : (
                  <button
                    onClick={() => setChangingPassword(true)}
                    className="bg-blue-500 text-white p-2 rounded"
                  >
                    <FiLock className="mr-2" /> Change Password
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Middle Section for Posts */}
        <div className="posts-section" style={{ flex: "1", margin: "0 20px" }}>
          <h1 className="text-2xl font-bold mb-6">Your Posts</h1>
          {posts.length > 0 ? (
            posts
              .slice()
              .reverse()
              .map((post) => (
                <div key={post._id} className="post-item">
                  <h3 className="text-xl font-semibold">{post.title}</h3>
                  <p>{post.content}</p>

                  {/* Display post images if they exist */}
                  {post.images && post.images.length > 0 && (
                    <div className="post-images">
                      {post.images.map((image, index) => (
                        <img
                          key={index}
                          src={`http://localhost:3001/${image}`}
                          alt=""
                          className="post-image"
                        />
                      ))}
                    </div>
                  )}

                  <span className="text-sm text-gray-500">
                    Posted on: {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
          ) : (
            <p>No posts found.</p>
          )}
        </div>

        <div className="user-orders">
          <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order._id} className="border p-4 mb-4 rounded shadow">
                <div
                  className="cursor-pointer"
                  onClick={() => toggleOrder(order._id)}
                >
                  <h3 className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <FiPackage className="h-5 w-5" />
                      <span>
                        {order.items.length > 0
                          ? order.items[0].name
                          : "Unnamed Order"}
                      </span>
                    </span>
                    <span>
                      {expandedOrder === order._id ? (
                        <FiChevronUp className="h-4 w-4" />
                      ) : (
                        <FiChevronDown className="h-4 w-4" />
                      )}
                    </span>
                  </h3>
                </div>
                {expandedOrder === order._id && (
                  <div className="mt-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Price
                        </p>
                        <p className="font-semibold">
                          ${order.totalPrice.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Order Date
                        </p>
                        <p className="font-semibold">
                          {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Delivery Date
                        </p>
                        <p className="font-semibold">
                          {order.scheduleDate
                            ? new Date(order.scheduleDate).toLocaleDateString()
                            : "No schedule date set"}
                        </p>
                      </div>
                    </div>
                    <h4 className="font-semibold">Items:</h4>
                    <ul>
                      {order.items.map((item, index) => (
                        <li key={index} className="flex items-center mb-2">
                          <img
                            src={item.img}
                            alt={item.name}
                            className="cart-item-image"
                          />
                          <span>
                            {item.name} - ${item.price.toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No orders found.</p>
          )}
        </div>
      </div>
      <Footer className="fot" />
    </>
  );
}
