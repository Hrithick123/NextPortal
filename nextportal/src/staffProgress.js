import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const UpdateStaffProgress = () => {
  const { staffId } = useParams();
  const [assignedCourse, setAssignedCourse] = useState("");
  const [courseName, setCourseName] = useState("");
  const [date, setDate] = useState("");
  const [formData, setFormData] = useState({
    course_id: "",
    progress: "",
    staff_id: staffId,
  });
  const [previousProgress, setPreviousProgress] = useState([]);

  useEffect(() => {
    fetchAssignedCourse();
    fetchPreviousProgress();
  }, []);

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    setDate(formattedDate);
  }, []);

  const fetchAssignedCourse = async () => {
    try {
      const response = await axios.get(`/api/staffs/${staffId}`);
      setAssignedCourse(response.data.staff[4]);
      setCourseName(response.data.staff[5]);
      // Set the course_id in formData
      setFormData((prevFormData) => ({
        ...prevFormData,
        course_id: response.data.staff[4],
      }));
    } catch (error) {
      console.error("Error fetching assigned course:", error);
    }
  };

  const fetchPreviousProgress = async () => {
    try {
      const response = await axios.get(`/api/staff_progress/${staffId}`);
      setPreviousProgress(response.data.progress);
    } catch (error) {
      console.error("Error fetching previous progress:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Check if progress for the current date already exists
      const existingProgress = previousProgress.find(
        (progress) => progress.date === date
      );
      if (existingProgress) {
        alert("Progress for this date already exists.");
        return;
      }

      await axios.post("/api/staff_progress", formData);
      console.log("Staff progress updated successfully.");
      // Refresh previous progress after adding new progress
      fetchPreviousProgress();
    } catch (error) {
      console.error("Error updating staff progress:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">
        Update Daily Progress for {courseName} - {date}
      </h2>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
        <div className="mb-4">
          <label className="block mb-2">Progress:</label>
          <textarea
            name="progress"
            value={formData.progress}
            onChange={handleChange}
            required
            rows={4}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Update Progress
        </button>
      </form>
      {previousProgress.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Previous Progress</h3>
          <ul>
            {previousProgress.map((progress, index) => (
              <li key={index}>
                <strong>Date:</strong> {progress.date},{" "}
                <strong>Progress:</strong> {progress.progress}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UpdateStaffProgress;
