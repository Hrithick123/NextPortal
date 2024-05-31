import React, { useState, useEffect } from "react";

const AdminQueryModule = () => {
  const [queries, setQueries] = useState([]);

  useEffect(() => {
    // Function to fetch queries from the backend
    const fetchQueries = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/admin/queries");
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

  // Function to handle replying to a query
  const replyToQuery = async (queryId, replyText) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/queries/${queryId}/reply`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reply_text: replyText }),
        }
      );
      if (response.ok) {
        // Update the query in the state to mark it as resolved
        setQueries((prevQueries) =>
          prevQueries.map((query) =>
            query.id === queryId ? { ...query, resolved: true } : query
          )
        );
      } else {
        console.error("Error replying to query:", response.statusText);
      }
    } catch (error) {
      console.error("Error replying to query:", error);
    }
  };

  return (
    <div>
      <h2>Admin Queries</h2>
      <ul>
        {queries.map((query) => (
          <li key={query.id}>
            <div>
              <strong>Student ID:</strong> {query.student_id}
            </div>
            <div>
              <strong>Query:</strong> {query.query_text}
            </div>
            {!query.resolved && (
              <div>
                <textarea placeholder="Reply to query..."></textarea>
                <button
                  onClick={() => replyToQuery(query.id, "Your reply text here")}
                >
                  Send Reply
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminQueryModule;
