import React, { useState, useEffect } from "react";

const QueryModule = ({ userId }) => {
  const [queries, setQueries] = useState([]);
  const [resolvedQuery, setResolvedQuery] = useState(null);
  const [newQueryText, setNewQueryText] = useState("");

  useEffect(() => {
    // Function to fetch queries from the backend
    const fetchQueries = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/queries");
        if (response.ok) {
          const data = await response.json();
          setQueries(data.queries);
        } else {
          console.error("Error fetching queries:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching queries:", error);
      }
    };

    // Call fetchQueries function
    fetchQueries();
  }, []);

  // Function to handle resolving a query
  const resolveQuery = async (queryId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/queries/${queryId}/resolve`,
        {
          method: "PUT",
        }
      );
      if (response.ok) {
        setResolvedQuery(queryId);
      } else {
        console.error("Error resolving query:", response.statusText);
      }
    } catch (error) {
      console.error("Error resolving query:", error);
    }
  };

  // Function to handle creating a new query
  const createQuery = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ student_id: userId, query_text: newQueryText }),
      });
      if (response.ok) {
        const newQuery = await response.json();
        setQueries([...queries, newQuery]);
        setNewQueryText(""); // Clear input field
      } else {
        console.error("Error creating query:", response.statusText);
      }
    } catch (error) {
      console.error("Error creating query:", error);
    }
  };

  return (
    <div>
      <h2>Queries</h2>
      <div>
        <textarea
          value={newQueryText}
          onChange={(e) => setNewQueryText(e.target.value)}
          placeholder="Enter your query..."
        ></textarea>
        <button onClick={createQuery}>Submit Query</button>
      </div>
      <ul>
        {queries.map((query) => (
          <li key={query.id}>
            <div>
              <strong>Student ID:</strong> {query.student_id}
            </div>
            <div>
              <strong>Query:</strong> {query.query_text}
            </div>
            {query.resolved ? (
              <div>
                <strong>Status:</strong> Resolved
              </div>
            ) : (
              <button onClick={() => resolveQuery(query.id)}>Resolve</button>
            )}
          </li>
        ))}
      </ul>
      {resolvedQuery && <p>Your query has been resolved.</p>}
    </div>
  );
};

export default QueryModule;
