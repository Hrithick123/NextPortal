import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NavStudent from "./templates/studentNavbar";

const StudentTaskComponent = () => {
  const { studentId } = useParams();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/students/${studentId}/tasks`
        );
        if (response.ok) {
          const data = await response.json();
          setTasks(data.tasks.map((task) => ({ ...task })));
        } else {
          console.error("Failed to fetch tasks:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [studentId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => ({
          ...task,
          remainingTime: calculateRemainingTime(task.deadline),
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const calculateRemainingTime = (deadline) => {
    const deadlineTime = new Date(deadline);
    const currentTime = new Date();
    const difference = deadlineTime.getTime() - currentTime.getTime();

    if (difference <= 0) {
      return "Deadline passed";
    } else {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
    }
  };

  const handleFileSubmission = async (taskId, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `http://localhost:8000/api/tasks/${taskId}/submit-file`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        console.log("File submitted successfully!");
        const updatedTasks = tasks.map((task) => {
          if (task.task_id === taskId) {
            return {
              ...task,
              file_or_link: file.name,
              progress_date: new Date().toISOString(),
            };
          }
          return task;
        });
        setTasks(updatedTasks);
      } else {
        console.error("Failed to submit file:", response.statusText);
      }
    } catch (error) {
      console.error("Error submitting file:", error);
    }
  };

  return (
    <div>
      <NavStudent />
      <br />
      <h2 className="text-2xl font-bold mb-4 text-center">Tasks Assigned</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.task_id} className="mb-4">
            <div className="border rounded-lg p-4">
              <div>
                <strong>{task.task_description}</strong>
              </div>
              <div className="mt-2">Deadline: {task.deadline}</div>
              <div className="mt-2">Remaining Time: {task.remainingTime}</div>
              <div className="mt-2 font-bold">
                Last Submission: {task.progress_date}
              </div>
              <div className="mt-2">
                {task.file_or_link ? (
                  <iframe
                    src={`http://localhost:8000/submit/${task.task_id}.pdf`}
                    title="File Viewer"
                    width="600"
                    height="400"
                    className="border"
                  ></iframe>
                ) : task.file_or_link ? (
                  <p>File submitted: {task.file_or_link}</p>
                ) : (
                  <p className="text-red-500">Not Submitted</p>
                )}
              </div>
              <div className="mt-2">
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileSubmission(task.task_id, e.target.files[0])
                  }
                />
              </div>
              {/* Display error message if file submission fails */}
              {task.error && (
                <div className="text-red-500 mt-2">{task.error}</div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentTaskComponent;
