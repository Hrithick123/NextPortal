import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./templates/staffNavbar";
import axios from "axios";
import { Link } from "react-router-dom";

// Import necessary modules

const StaffDashboard = () => {
  const { staffId } = useParams();
  const [studentsData, setStudentsData] = useState([]);
  const [staff, setStaff] = useState([]);
  const [tasksData, setTasksData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentsData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/staff-dashboard/${staffId}`
        );
        if (response.ok) {
          const data = await response.json();
          setStudentsData(data.studentsData);
        } else {
          console.error(
            "Error fetching admin dashboard data:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      }
    };

    const fetchStaffData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/staffs/${staffId}`
        );
        setStaff(response.data.staff);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching Staff data:", error);
      }
    };

    const fetchTasksData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/staffs/${staffId}/tasks`
        );
        if (response.ok) {
          const data = await response.json();
          console.log(data.tasks);
          setTasksData(data.tasks.map((task) => ({ ...task })));
        } else {
          console.error("Failed to fetch tasks:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchStaffData();
    fetchTasksData();
    fetchStudentsData();
  }, [staffId]); // Include staffId as a dependency

  const navigateTask = () => {
    navigate(`/staff/task/${staffId}`);
  };

  const navigateAttendance = () => {
    navigate(`/staff/attendance/${staffId}`);
  };

  const navigateReview = () => {
    navigate(`/staff/taskreview/${staffId}`);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Navbar component */}
      <Navbar />
      <div className="flex justify-center mt-6 space-x-4">
        {/* Buttons for navigating to different pages */}
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
          onClick={navigateAttendance}
        >
          Mark Attendance
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
          onClick={navigateTask}
        >
          Assign Task
        </button>
      </div>
      <div className="container mx-auto py-8 px-4">
        {/* Staff name heading */}
        <h1 className="text-3xl font-bold mb-8"> {staff[1]}'s Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {/* Students detail section */}
            <h2 className="text-xl font-semibold mb-4">Students Detail</h2>
            <div className="grid gap-4">
              {/* Map through unique student data */}
              {studentsData
                .filter(
                  (student, index, self) =>
                    index === self.findIndex((s) => s.id === student.id)
                )
                .map((student) => (
                  <div
                    key={student.id}
                    className="bg-white p-6 rounded-lg shadow-md"
                  >
                    <img
                      className="w-24 h-24 rounded-full mx-auto mb-4"
                      src={`http://localhost:8000/profile/${student.id}.jpg`}
                      alt="Profile"
                    />
                    <h3 className="text-xl font-semibold">{student.name}</h3>
                    <p className="text-gray-600">{student.email}</p>
                    <p className="text-gray-600">Staff: {student.staff}</p>
                    <p className="text-gray-600">Course: {student.course}</p>
                    <p className="text-l font-semibold">
                      Last obtained score: {student.score}
                    </p>
                    <p className="text-l font-semibold">
                      Attendance Percentage: {student.attendance}
                    </p>
                  </div>
                ))}
            </div>
          </div>
          <div>
            {/* Tasks detail section */}
            <h2 className="text-xl font-semibold mb-4">Tasks Detail</h2>
            <div className="grid gap-4">
              {/* Map through tasks data */}
              {tasksData.map((task) => (
                <div
                  key={task.id}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <p className="text-gray-800">
                    Description: {task.task_description}
                  </p>
                  <p className="text-gray-600">Deadline: {task.deadline}</p>
                </div>
              ))}
            </div>
            <div className="mt-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
