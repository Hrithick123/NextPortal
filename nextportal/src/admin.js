import React, { useState, useEffect } from "react";
import Navadmin from "./templates/adminNavbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [studentsData, setStudentsData] = useState([]);

  useEffect(() => {
    const fetchStudentsData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/admin-dashboard"
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched admin dashboard data:", data.studentsData);
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

    fetchStudentsData();
  }, []);

  return (
    <div>
      <Navadmin />
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Hiiii Admin!
          </h1>
          <div className="flex justify-center mt-6 space-x-4">
            <Link to="/admin/viewattendance">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                View Student's Attendance
              </button>
            </Link>
            <Link to="/admin/attendance">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Mark Staff's Attendance
              </button>
            </Link>
            <Link to="/admin/manageattendance">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Manage Staff's Attendance
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {studentsData.map((student) => (
            <div
              key={student.id}
              className="bg-white p-6 rounded-lg shadow-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{student.name}</h2>
                <Link to={`/student/edit/${student.id}`}>
                  <button className="text-blue-500 hover:text-blue-700">
                    <FontAwesomeIcon icon={faEdit} className="mr-2" />
                    Edit Student
                  </button>
                </Link>
              </div>
              <img
                className="w-24 h-24 rounded-full mx-auto mb-4"
                src={`http://localhost:8000/profile/${student.id}.jpg`}
                alt="Profile"
              />
              <p className="mb-2">
                <strong>Email:</strong> {student.email}
              </p>
              <p className="mb-2">
                <strong>Staff:</strong> {student.staff}
              </p>
              <p className="mb-2">
                <strong>Course:</strong> {student.course}
              </p>
              <p className="mb-2">
                <strong>Next Fees Due:</strong> {student.nextFeesDue}
              </p>
              <p className="mb-4">
                <strong>Attendance Percentage:</strong>{" "}
                {student.attendancePercentage}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
