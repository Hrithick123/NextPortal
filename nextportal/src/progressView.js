import React, { useState, useEffect } from "react";
import axios from "axios";
import Navadmin from "./templates/adminNavbar";

const ProgressComponent = () => {
  const [progressData, setProgressData] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    fetchProgress();
    fetchStaffList();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await axios.get("/api/staff_progress");
      setProgressData(response.data.progress);
    } catch (error) {
      console.error("Error fetching progress data:", error);
    }
  };

  const fetchStaffList = async () => {
    try {
      const response = await axios.get("/api/staffs");
      setStaffList(response.data.staffs);
    } catch (error) {
      console.error("Error fetching staff list:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "staff_id") {
      setStaffId(value);
    } else if (name === "date") {
      setDate(value);
    }
  };

  const applyFilters = () => {
    let filteredProgress = [...progressData];
    if (staffId !== "") {
      filteredProgress = filteredProgress.filter(
        (progress) => progress.staff_id === staffId
      );
    }
    if (date !== "") {
      filteredProgress = filteredProgress.filter(
        (progress) => progress.date === date
      );
    }
    setProgressData(filteredProgress);
  };

  return (
    <div>
      <Navadmin />

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Progress</h2>
        <div className="mb-4">
          <label className="block mb-2">Date:</label>
          <input
            type="date"
            name="date"
            value={date}
            onChange={handleFilterChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          />
        </div>
        <button
          onClick={applyFilters}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
        >
          Apply Filters
        </button>
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Staff Name</th>
              <th className="px-4 py-2">Course Name</th>
              <th className="px-4 py-2">Progress</th>
            </tr>
          </thead>
          <tbody>
            {progressData.map((progress, index) => (
              <tr key={index} className="text-center">
                <td className="border px-4 py-2">{progress.date}</td>
                <td className="border px-4 py-2">{progress.staff_name}</td>
                <td className="border px-4 py-2">{progress.course_name}</td>
                <td className="border px-4 py-2">{progress.progress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgressComponent;
