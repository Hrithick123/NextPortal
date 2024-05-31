import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-regular-svg-icons";
import Navadmin from "./templates/adminNavbar";

const ViewAttendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [courses, setCourse] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    // Fetch students initially
    fetch("http://localhost:8000/api/students")
      .then((response) => response.json())
      .then((data) => setStudents(data.students))
      .catch((error) => console.error("Error fetching students:", error));

    fetch("http://localhost:8000/api/courses")
      .then((response) => response.json())
      .then((data) => setCourse(data.courses))
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

  return (
    <div>
      <Navadmin />

      <div className="flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">View Attendance</h2>

          <div className="mb-4">
            <label className="mr-2">Select Student:</label>
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

          <div className="mb-4">
            <label className="mr-2">Select Course:</label>
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

          <div className="mb-4">
            <label className="mr-2">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="flex justify-end">
            <FontAwesomeIcon
              icon={faEye}
              className="text-blue-500 hover:text-blue-600 cursor-pointer mr-2"
              onClick={fetchFilteredAttendance}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="py-2">Date</th>
                <th className="py-2">Student Name</th>
                <th className="py-2">Attendance Status</th>
                <th className="py-2">Course Name</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record.id} className="text-center">
                  <td className="py-2">{record[2]}</td>
                  <td className="py-2">{record[4]}</td>
                  <td className="py-2">{record[3] ? "Present" : "Absent"}</td>
                  <td className="py-2">{record[5]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewAttendance;
