import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NavStaff from "./templates/staffNavbar"; // Assuming you have a Navbar component for staff
import moment from "moment";

const StaffAttendance = () => {
  const { staffId } = useParams(); // Change to staffId
  const [attendance, setAttendance] = useState([]);
  const [percentage, setPercentage] = useState(0); // Initialize percentage with 0

  useEffect(() => {
    // Fetch attendance data for the staff with the given ID
    const fetchAttendance = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/staffattendance?staff_id=${staffId}` // Update endpoint
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
  }, [staffId]); // Update dependency

  return (
    <div>
      <NavStaff /> {/* Use staff navigation instead */}
      <div className="staffAttendanceContainer">
        {" "}
        {/* Update class name */}
        <br />
        <h2 className="text-2xl font-bold mb-4 text-center">
          Staff Attendance Record {/* Update heading */}
        </h2>
        <table className="w-full mb-8">
          <thead>
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Attendance Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((record) => (
              <tr key={record.id} className="border-b">
                <td className="px-4 py-2">
                  {moment(record.date).format("YYYY-MM-DD")}
                </td>
                <td className="px-4 py-2">
                  {record.is_present ? "Present" : "Absent"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h4 className="text-lg font-semibold text-center">
          Attendance Percentage: {percentage}%
        </h4>
      </div>
    </div>
  );
};

export default StaffAttendance;
