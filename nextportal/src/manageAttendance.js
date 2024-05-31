import React, { useState, useEffect } from "react";
import Navbar from "./templates/staffNavbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit } from "@fortawesome/free-solid-svg-icons";

const ManageAttendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    // Fetch students initially
    fetch("http://localhost:8000/api/students")
      .then((response) => response.json())
      .then((data) => setStudents(data.students))
      .catch((error) => console.error("Error fetching students:", error));

    fetch("http://localhost:8000/api/courses")
      .then((response) => response.json())
      .then((data) => setCourses(data.courses))
      .catch((error) => console.error("Error fetching Courses:", error));

    // Fetch all attendance initially
    fetch("http://localhost:8000/api/attendance")
      .then((response) => response.json())
      .then((data) => setAttendance(data.attendance))
      .catch((error) => console.error("Error fetching attendance:", error));
  }, []);

  const fetchFilteredAttendance = () => {
    // Fetch attendance with filters
    fetch(
      `http://localhost:8000/api/attendance?student_id=${selectedStudent}&date=${selectedDate}&course_id=${selectedCourse}`
    )
      .then((response) => response.json())
      .then((data) => setAttendance(data.attendance))
      .catch((error) => console.error("Error fetching attendance:", error));
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const updateAttendanceStatus = (recordId, isPresent) => {
    // Update attendance status in the local state
    const updatedAttendance = attendance.map((record) => {
      if (record.id === recordId) {
        return { ...record, is_present: isPresent };
      } else {
        return record;
      }
    });
    setAttendance(updatedAttendance); // Update local state immediately

    // Send the request to update the attendance status in the database
    fetch(`http://localhost:8000/api/attendance/${recordId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_present: isPresent }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update attendance");
        }
      })
      .catch((error) => {
        // If the request fails, revert the local state back to its original state
        console.error("Error updating attendance:", error);
        setAttendance((prevAttendance) =>
          prevAttendance.map((record) => {
            if (record.id === recordId) {
              return { ...record, is_present: !isPresent };
            } else {
              return record;
            }
          })
        );
      });
  };

  return (
    <div>
      <Navbar />
      {/* Top container */}
      <div className="topContainer p-6">
        <div className="titleContainer mb-4">
          <h2 className="text-2xl font-semibold">View Attendance</h2>
        </div>
        {/* Filter options */}
        <div className="flex flex-wrap mb-4">
          {/* Button to toggle between edit and view mode */}
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
            onClick={toggleEditMode}
          >
            {editMode ? (
              <>
                <FontAwesomeIcon icon={faEye} className="mr-2" />
                View Mode
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                Edit Mode
              </>
            )}
          </button>
          {/* Select Student dropdown */}
          <div className="mr-2">
            <label>Select Student:</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-400"
            >
              <option value="">All Students</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
          {/* Select Course dropdown */}
          <div className="mr-2">
            <label>Select Course:</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-400"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name}
                </option>
              ))}
            </select>
          </div>
          {/* Select Date input */}
          <div className="mr-2">
            <label>Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-400"
            />
          </div>
          {/* Show Attendance button */}
          <div>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={fetchFilteredAttendance}
            >
              Show Attendance
            </button>
          </div>
        </div>
        {/* Attendance records table */}
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Student Name</th>
              <th className="p-3">Attendance Status</th>
              {editMode && <th className="p-3">Edit Attendance</th>}{" "}
              {/* Conditional rendering for Edit Attendance column */}
              <th className="p-3">Course Name</th>
            </tr>
          </thead>
          <tbody>
            {/* Map over the attendance and populate the table */}
            {attendance.map((record) => (
              <tr key={record[0]} className="border-b border-gray-200">
                <td className="p-3">{record[2]}</td>
                <td className="p-3">{record[4]}</td>
                <td className="p-3">{record[3] ? "Present" : "Absent"}</td>
                {editMode && ( // Render Edit Attendance column only in edit mode
                  <td className="p-3">
                    <button
                      className="bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600 mr-2"
                      onClick={() => updateAttendanceStatus(record[0], true)}
                    >
                      Mark Present
                    </button>
                    <button
                      className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
                      onClick={() => updateAttendanceStatus(record[0], false)}
                    >
                      Mark Absent
                    </button>
                  </td>
                )}
                <td className="p-3">{record[5]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageAttendance;
