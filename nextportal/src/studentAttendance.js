import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NavStudent from "./templates/studentNavbar";

const StudentAttendance = () => {
  const { studentId } = useParams();
  const [attendance, setAttendance] = useState([]);
  const [percentage, setPercentage] = useState([]);

  useEffect(() => {
    // Fetch attendance data for the student with the given ID
    const fetchAttendance = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/attendance?student_id=${studentId}`
        );
        if (response.ok) {
          const data = await response.json();
          setAttendance(data.attendance);
          setPercentage(data.attendancePercentage);
        } else {
          console.error("Failed to fetch attendance:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    fetchAttendance();
  }, [studentId]);

  return (
    <div>
      <NavStudent />

      <div className="studentAttendanceContainer">
        <br />
        <h2 className="text-2xl font-bold mb-4 text-center">
          Attendance Record
        </h2>
        <table className="w-full mb-8">
          <thead>
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Attendance Status</th>
              <th className="px-4 py-2">Course Name</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((record) => (
              <tr key={record[0]} className="border-b">
                <td className="px-4 py-2">{record[2]}</td>
                <td className="px-4 py-2">
                  {record[3] ? "Present" : "Absent"}
                </td>
                <td className="px-4 py-2">{record[5]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h4 className="text-lg font-semibold text-center">
          Attendance Percentage: {percentage}
        </h4>
      </div>
    </div>
  );
};

export default StudentAttendance;
