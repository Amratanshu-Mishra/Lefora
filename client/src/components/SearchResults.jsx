import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios"; // Import axios
import Navbar from "./Navbar";
import "./SearchResults.css"; // Import the CSS file

function SearchResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Function to parse the query from the URL
  const query = new URLSearchParams(location.search).get("query"); // Get the search query from the URL

  console.log("Current Search Query:", query); // Log the current search query

  useEffect(() => {
    if (query) {
      // Fetch results based on the search query
      const fetchResults = async () => {
        try {
          console.log(`Fetching results for query: ${query}`); // Log the fetch action
          const response = await axios.get(
            `http://localhost:3001/api/search?q=${query}`
          );
          console.log("API Response:", response.data); // Log the API response
          setResults(response.data); // Update the results state
        } catch (err) {
          console.error("Fetch Error:", err); // Log the error
          setError("Error fetching results");
        } finally {
          setLoading(false);
        }
      };

      fetchResults();
    } else {
      console.log("No query provided, stopping loading."); // Log when no query is found
      setLoading(false); // If no query, stop loading
    }
  }, [query]); // Re-fetch if query changes

  if (loading) {
    console.log("Loading results..."); // Log loading state
    return <div>Loading...</div>;
  }
  if (error) {
    console.error("Error State:", error); // Log the error state
    return <div>{error}</div>;
  }

  console.log("Search Results:", results); // Log the results to check the final state
  console.log("Image URL:", results.image);

  return (
    <>
      <Navbar />
      <div className="search-results-container">
        <h1>Search Results</h1>
        {results.length === 0 ? (
          <p>No results found for "{query}"</p>
        ) : (
          <ul className="results-list">
            {results.map((result) => (
              <li key={result._id} className="result-item">
                <Link to={`/posts/${result._id}`} className="result-link">
                  <div className="result-content">
                    <h2>{result.title}</h2>
                    {result.images.length > 0 && (
                      <img
                        src={`http://localhost:3001/${result.images[0]}`} // Update to use correct image URL
                        alt={result.title}
                        className="result-image"
                      />
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default SearchResults;
