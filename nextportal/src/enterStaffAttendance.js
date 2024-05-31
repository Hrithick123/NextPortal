import React, { useState, useEffect } from "react";
import Navadmin from "./templates/adminNavbar";

const EnterStaffAttendance = () => {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Fetch staff list
    fetch("http://localhost:8000/api/staffs")
      .then((response) => response.json())
      .then((data) => setStaffList(data.staffs))
      .catch((error) => console.error("Error fetching staff list:", error));
  }, []);

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

  const markAttendance = (staffName, isPresent) => {
    fetch("http://localhost:8000/api/staffattendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        staff_id: staffName, // Assuming staff_id is actually the staff's name
        is_present: isPresent,
        date: new Date().toISOString().split("T")[0], // Today's date
      }),
    })
      .then((response) => {
        if (response.ok) {
          alert("Attendance marked successfully!");
        } else if (response.status === 409) {
          alert("Attendance already marked for today");
        } else {
          console.error(response);
          alert("Error marking attendance. Please try again.");
        }
      })
      .catch((error) => console.error("Error marking attendance:", error));
  };

  return (
    <div>
      <Navadmin />
      <div className="mainContainer p-8">
        <div className="titleContainer text-2xl font-bold mb-4">
          Enter Staff Attendance
        </div>
        <div className="attendanceTable mb-4">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2">Staff Name</th>
                <th className="border p-2">Mark Attendance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">
                  <select
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Staff</option>
                    {staffList.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => markAttendance(selectedStaff, true)}
                    className={`bg-green-500 text-white px-4 py-2 mr-2 rounded hover:bg-green-600 ${
                      !selectedStaff && "opacity-50 cursor-not-allowed"
                    }`}
                    disabled={!selectedStaff}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => markAttendance(selectedStaff, false)}
                    className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ${
                      !selectedStaff && "opacity-50 cursor-not-allowed"
                    }`}
                    disabled={!selectedStaff}
                  >
                    Absent
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4">{currentTime}</div>
      </div>
    </div>
  );
};

export default EnterStaffAttendance;
