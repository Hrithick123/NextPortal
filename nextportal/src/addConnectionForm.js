import React, { useState, useEffect } from "react";
import axios from "axios";

const AddConnectionForm = ({ onAddConnection, onCancel }) => {
  const [connectionData, setConnectionData] = useState({
    date: new Date().toISOString().split("T")[0],
    name: "",
    phone_number: "",
    email: "",
    interest: "TBD",
    source: "",
    lead_stage: "",
    lead_status: "Hot",
    message: "",
    course: "",
    comments: "",
  });

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get("/api/courses");
      setCourses(response.data.courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConnectionData({ ...connectionData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/add_connection", connectionData);
      onAddConnection(connectionData);
      setConnectionData({
        date: new Date().toISOString().split("T")[0],
        name: "",
        phone_number: "",
        email: "",
        interest: "TBD",
        source: "",
        lead_stage: "",
        lead_status: "",
        message: "",
        course: "",
        comments: "",
      });
    } catch (error) {
      console.error("Error adding connection:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Add New Connection
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label htmlFor="name" className="text-sm font-medium">
              Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={connectionData.name}
              onChange={handleChange}
              className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="phone_number" className="text-sm font-medium">
              Phone Number:
            </label>
            <input
              type="text"
              id="phone_number"
              name="phone_number"
              value={connectionData.phone_number}
              onChange={handleChange}
              className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-medium">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={connectionData.email}
              onChange={handleChange}
              className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="interest" className="text-sm font-medium">
              Interested:
            </label>
            <select
              id="interest"
              name="interest"
              value={connectionData.interest}
              onChange={handleChange}
              className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="TBD">TBD</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="source" className="text-sm font-medium">
              Source:
            </label>
            <input
              type="text"
              id="source"
              name="source"
              value={connectionData.source}
              onChange={handleChange}
              className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="lead_stage" className="text-sm font-medium">
              Lead Stage:
            </label>
            <select
              id="lead_stage"
              name="lead_stage"
              value={connectionData.lead_stage}
              onChange={handleChange}
              className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            >
              <option value="Hot">Hot</option>
              <option value="Warm">Warm</option>
              <option value="Cold">Cold</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="lead_status" className="text-sm font-medium">
              Lead Status:
            </label>
            <input
              type="text"
              id="lead_status"
              name="lead_status"
              value={connectionData.lead_status}
              onChange={handleChange}
              className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="course" className="text-sm font-medium">
              Course:
            </label>
            <select
              id="course"
              name="course"
              value={connectionData.course}
              onChange={handleChange}
              className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="comments" className="text-sm font-medium">
              Comments (If any):
            </label>
            <input
              type="text"
              id="comments"
              name="comments"
              value={connectionData.comments}
              onChange={handleChange}
              className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex justify-between col-span-2">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddConnectionForm;
