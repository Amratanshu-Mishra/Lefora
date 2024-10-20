import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import icon from "../assets/img/profile.png";
import "./Navbar.css";
import { useAuth } from "../services/AuthContext"; // Import useAuth

function Navbar({ currentPage }) {
  const [email, setEmail] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null); // Ref to track the dropdown
  const { currentUser, logout } = useAuth(); // Destructure currentUser and logout from useAuth

  useEffect(() => {
    // Update email based on currentUser state
    setEmail(currentUser?.email || ""); // Set email if currentUser is available
  }, [currentUser]); // Depend on currentUser to update the email when user logs in/out

  // Event listener to close the dropdown if clicked outside
  const handleOutsideClick = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false); // Close dropdown if clicked outside
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    // Cleanup event listener
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleLogout = () => {
    logout(); // Use the logout function from AuthContext
    localStorage.removeItem("isLoggedIn"); // Clear logged-in state
    localStorage.removeItem("email"); // Clear email state
    navigate("/"); // Optionally redirect to home or login page after logout
  };

  const handleProfileClick = () => {
    const userId = localStorage.getItem("userId"); // Retrieve user ID from localStorage
    navigate(`/profile/${userId}`);
  };

  const loggedIn = !!currentUser; // Determine if the user is logged in based on currentUser

  // Function to handle search submission
  const handleSearch = (e) => {
    e.preventDefault(); // Prevent the default form submission
    if (searchQuery.trim()) {
      navigate(`/search?query=${searchQuery.trim()}`); // Navigate to search results page
      setSearchQuery(""); // Clear the search input
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">
          <h5>LEFORA</h5>
        </Link>
      </div>

      {/* Search Container for Centering */}
      {(location.pathname === "/" || location.pathname === "/search") && (
        <div className="search-container">
          <form onSubmit={handleSearch} className="search-bar">
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} // Update search query state
            />
            {/* <button type="submit" className="search-button">
              Search
            </button> */}
          </form>
        </div>
      )}

      <div className="right-side">
        <div className="shop-link">
          <Link
            to="/shop"
            className={`nav-link ${currentPage === "/shop" ? "active" : ""}`}
          >
            Lefora Shop
          </Link>
        </div>

        {loggedIn && (
          <div className="shop-cart">
            <Link
              to="/cart"
              className={`nav-link ${currentPage === "/cart" ? "active" : ""}`}
            >
              My Cart
            </Link>
          </div>
        )}

        <div className="auth-section">
          {loggedIn ? ( // Check if logged in or currentUser is set
            <div className="profile" ref={dropdownRef}>
              <img
                src={icon}
                alt="Profile"
                style={{ cursor: "pointer" }}
                onClick={() => setDropdownOpen((prev) => !prev)} // Toggle dropdown on click
              />

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div id="navDrop" className="dropdown-menu">
                  <button onClick={handleProfileClick}>Profile</button>
                  <br />
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/cart">My Cart</Link>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
