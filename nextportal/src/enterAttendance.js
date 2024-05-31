import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./templates/staffNavbar";

const EnterAttendance = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const { staffId } = useParams(); // Get staffId from the URL params

  useEffect(() => {
    // Fetch courses for the given staffId
    fetch(`http://localhost:8000/api/courses?staff_id=${staffId}`)
      .then((response) => response.json())
      .then((data) => setCourses(data.courses))
      .catch((error) => console.error("Error fetching courses:", error));
  }, [staffId]);

  useEffect(() => {
    // Fetch students based on the selected course
    if (selectedCourse) {
      fetch(`http://localhost:8000/api/students?course_id=${selectedCourse}`)
        .then((response) => response.json())
        .then((data) => setStudents(data.students))
        .catch((error) => console.error("Error fetching students:", error));
    } else {
      // If no course is selected, clear the students list
      setStudents([]);
    }
  }, [selectedCourse]);

  useEffect(() => {
    // Get current time in IST format
    const interval = setInterval(() => {
      const now = new Date();
      const options = {
        timeZone: "Asia/Kolkata",
        hour12: true,
        hour: "numeric",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      };
      setCurrentTime(now.toLocaleString("en-IN", options));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const markAttendance = (studentId, isPresent) => {
    fetch("http://localhost:8000/api/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        student_id: studentId,
        is_present: isPresent,
        date: new Date().toISOString().split("T")[0], // Today's date
      }),
    })
      .then((response) => {
        if (response.ok) {
          alert("Attendance marked successfully!");
          // Refresh the students after marking attendance
          fetch(
            `http://localhost:8000/api/students?course_id=${selectedCourse}`
          )
            .then((response) => response.json())
            .then((data) => setStudents(data.students))
            .catch((error) => console.error("Error fetching students:", error));
        } else if (response.status > 400) {
          alert("Attendance status already existing");
        } else {
          console.log(response);
          alert("Error marking attendance. Please try again.");
        }
      })
      .catch((error) => console.error("Error marking attendance:", error));
  };

  return (
    <div>
      <Navbar />
      <div className="mainContainer p-8">
        <div className="titleContainer text-2xl font-bold mb-4">
          Enter Attendance
        </div>
        <div className="mb-4">
          <label className="block mb-2">Select Course:</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.course_id} value={course.course_id}>
                {course.course_name}
              </option>
            ))}
          </select>
        </div>
        <div className="attendanceTable mb-4">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2">Student Name</th>
                <th className="border p-2">Mark Attendance</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="border p-2">{student.name}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => markAttendance(student.id, true)}
                      className="bg-green-500 text-white px-4 py-2 mr-2 rounded hover:bg-green-600"
                    >
                      Present
                    </button>
                    <button
                      onClick={() => markAttendance(student.id, false)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Absent
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* <div className="inputContainer">
          <input
            type="button"
            onClick={viewAttendance}
            value="View Attendance"
            className="inputButton bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          />
        </div> */}
        <div className="mt-4">{currentTime}</div>
      </div>
    </div>
  );
};

export default EnterAttendance;
