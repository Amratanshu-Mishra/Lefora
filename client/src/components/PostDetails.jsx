import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./PostDetails.css";
import Navbar from "./Navbar";
import { useAuth } from "../services/AuthContext"; // Adjust path as needed
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai"; // Import heart icons

export default function PostDetails({ currentPage, handleNavClick }) {
  const { id } = useParams();
  const { currentUser } = useAuth(); // Get current user from AuthContext
  const [post, setPost] = useState({ comments: [] }); // Initialize post with comments as an empty array
  const [comment, setComment] = useState("");
  const [showDropdown, setShowDropdown] = useState(false); // Dropdown visibility state
  const [hasLiked, setHasLiked] = useState(false); // State to track if the user has liked the post
  const [isEditing, setIsEditing] = useState(false); // State to track if in edit mode
  const [editedTitle, setEditedTitle] = useState(""); // State for edited title
  const [editedContent, setEditedContent] = useState(""); // State for edited content
  const dropdownRef = useRef(null); // Reference to the dropdown element
  const navigate = useNavigate();

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/posts/${id}`);
        setPost(res.data);
        if (currentUser) {
          // Check if the current user has already liked the post
          setHasLiked(res.data.likedBy.includes(currentUser.id));
        }
      } catch (err) {
        console.error("Error fetching post:", err);
      }
    };
    fetchPost();
  }, [id, currentUser]);

  // Handle adding a comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `http://localhost:3001/api/posts/${id}/comments`,
        {
          author: currentUser ? currentUser.username : "Anonymous",
          text: comment,
        }
      );
      setPost(res.data.post); // Update the post data after adding the comment
      setComment(""); // Clear the comment input field
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  // Handle editing the post
  const handleEditPost = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:3001/api/posts/${id}`, {
        title: editedTitle || post.title, // Use edited title or fallback to original
        content: editedContent || post.content, // Use edited content or fallback to original
        images: post.images, // Keep the original images during editing
      });
      setPost(res.data); // Update the post data after editing
      setIsEditing(false); // Exit edit mode
      setEditedTitle(""); // Clear edited title
      setEditedContent(""); // Clear edited content
    } catch (err) {
      console.error("Error editing post:", err);
    }
  };

  // Handle deleting the post
  const deletePost = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmDelete) return; // Exit if the user cancels

    try {
      await axios.delete(`http://localhost:3001/api/posts/${id}`);
      navigate("/");
      alert("Post deleted successfully!"); // Notify the user
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete post. Please try again."
      );
    }
  };

  // Handle liking and unliking the post
  const handleLikePost = async () => {
    if (!currentUser) return; // Ensure user is logged in

    try {
      const res = await axios.post(
        `http://localhost:3001/api/posts/${id}/toggle-like`,
        { userId: currentUser.id }
      );
      setPost(res.data.post); // Update the post data after liking/unliking
      setHasLiked(res.data.post.likedBy.includes(currentUser.id)); // Update like status
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev); // Toggle dropdown visibility
  };

  // Close dropdown if clicking outside
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false); // Close the dropdown
    }
  };

  // Add event listener to handle click outside
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!post) return <div>Loading...</div>; // Show loading message while fetching data

  return (
    <>
      <Navbar currentPage={currentPage} handleNavClick={handleNavClick} />
      <div className="post-details-container">
        <div className="post-card">
          {isEditing ? (
            <form onSubmit={handleEditPost} className="edit-post-form">
              <input
                type="text"
                value={editedTitle || post.title} // Display edited title or original
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Edit Title"
                className="edit-input"
                required
              />
              <textarea
                value={editedContent || post.content} // Display edited content or original
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="Edit Content"
                className="edit-textarea"
                required
              />
              {/* Display images while editing */}
              {post.images && post.images.length > 0 && (
                <div className="post-images-edit">
                  <h4>Images:</h4>
                  {post.images.map((image, index) => (
                    <img
                      key={index}
                      src={`http://localhost:3001/${image}`} // Ensure correct path for images
                      alt="Post"
                      className="post-image"
                    />
                  ))}
                </div>
              )}
              <button type="submit" className="edit-submit-button">
                Save Changes
              </button>
              <button
                type="button"
                className="cancel-edit-button"
                onClick={() => {
                  setIsEditing(false);
                  setEditedTitle("");
                  setEditedContent("");
                }}
              >
                Cancel
              </button>
            </form>
          ) : (
            <>
              <h2 className="post-title">{post.title}</h2>

              {/* Dropdown for post actions (delete/edit) */}
              {currentUser && currentUser.username === post.author && (
                <div className="dropdown" ref={dropdownRef}>
                  <button onClick={toggleDropdown} className="dropdown-btn">
                    ⋮
                  </button>
                  {showDropdown && (
                    <div className="dropdown-menu">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          <label>title:</label>;
                          setEditedTitle(post.title); // Set initial title for editing
                          setEditedContent(post.content); // Set initial content for editing
                        }}
                        className="edit-option"
                      >
                        Edit Post
                      </button>
                      <button onClick={deletePost} className="delete-option">
                        Delete Post
                      </button>
                    </div>
                  )}
                </div>
              )}

              <p className="post-content">{post.content}</p>
              <p className="post-author">Posted by: {post.author}</p>

              {/* Render post images */}
              {post.images && post.images.length > 0 && (
                <div className="post-images">
                  {post.images.map((image, index) => (
                    <img
                      key={index}
                      src={`http://localhost:3001/${image}`} // Ensure correct path for images
                      alt="Post"
                      className="post-image"
                    />
                  ))}
                </div>
              )}

              {/* Like button and count */}
              <p className="post-likes">
                Likes: {post.likes}
                <button
                  className="like-button"
                  onClick={handleLikePost}
                  aria-label="Like Post"
                >
                  {hasLiked ? (
                    <AiFillHeart color="red" size={24} /> // Filled heart when liked
                  ) : (
                    <AiOutlineHeart color="black" size={24} /> // Empty heart when not liked
                  )}
                </button>
              </p>
            </>
          )}
        </div>

        {/* Comments section */}
        <div className="comments-section">
          <h3 className="comments-title">Comments</h3>
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((c) => (
              <div key={c._id} className="comment">
                <p>
                  <strong>{c.author}</strong>: {c.text}
                </p>
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}
          {currentUser && (
            <form onSubmit={handleAddComment} className="comment-form">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="comment-input"
                required
              />
              <button type="submit" className="comment-submit-button">
                Comment
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
