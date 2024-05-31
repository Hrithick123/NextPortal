import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./templates/staffNavbar";

const StaffReviewComponent = () => {
  const { staffId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [reviews, setReviews] = useState({}); // State to hold reviews for each task
  const [review, setReview] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/staffs/${staffId}/tasks`
        );
        if (response.ok) {
          const data = await response.json();
          setTasks(data.tasks);
        } else {
          console.error("Failed to fetch tasks:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [staffId]);

  const handleTaskReview = async (taskId, review) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/tasks/${taskId}/review`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ review }),
        }
      );

      if (response.ok) {
        console.log("Task reviewed successfully!");
        // Update the task's review status in the state
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.task_id === taskId ? { ...task, review } : task
          )
        );
        // Update the review state for the specific task
        setReviews((prevReviews) => ({
          ...prevReviews,
          [taskId]: review,
        }));
      } else {
        console.error("Failed to review task:", response.statusText);
      }
    } catch (error) {
      console.error("Error reviewing task:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <br />
      <h2 className="text-2xl font-bold mb-4 text-center">
        Tasks Submitted by Students
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {tasks.map((task) => (
          <div key={task.task_id} className="bg-white rounded-lg shadow-md p-4">
            <div className="mb-2">
              <h3 className="text-lg font-semibold">{task.task_description}</h3>
              <p className="text-gray-500">Assigned To: {task.student_name}</p>
              <p className="text-gray-500">Deadline: {task.deadline}</p>
            </div>
            <div>
              {task.file_or_link ? (
                <div>
                  <h4>Submitted File:</h4>
                  <iframe
                    src={`http://localhost:8000/submit/${task.task_id}.pdf`}
                    title="Submitted File"
                    width="600"
                    height="400"
                  ></iframe>
                </div>
              ) : (
                <div>No file submitted</div>
              )}
              {task.review ? (
                // If review exists, display it
                <div>Review: {task.review}</div>
              ) : (
                // If review does not exist, display a text area and submit button
                <div>
                  <textarea
                    placeholder="Enter your review here"
                    className="border border-gray-300 rounded p-2 w-full"
                    onChange={(e) => setReview(e.target.value)}
                  />
                  <button
                    onClick={() => handleTaskReview(task.task_id, review)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-2"
                  >
                    Submit Review
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffReviewComponent;
