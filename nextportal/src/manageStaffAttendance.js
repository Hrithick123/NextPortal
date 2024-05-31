import React, { useState, useEffect } from "react";
import Navadmin from "./templates/adminNavbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit } from "@fortawesome/free-solid-svg-icons";

const ManageStaffAttendance = () => {
  const [staffAttendance, setStaffAttendance] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    // Fetch staffs initially
    fetch("http://localhost:8000/api/staffs")
      .then((response) => response.json())
      .then((data) => setStaffs(data.staffs))
      .catch((error) => console.error("Error fetching staffs:", error));

    // Fetch all attendance details initially
    fetch("http://localhost:8000/api/staffattendance")
      .then((response) => response.json())
      .then((data) => setStaffAttendance(data.attendance))
      .catch((error) =>
        console.error("Error fetching staff attendance:", error)
      );
  }, []);

  const fetchFilteredAttendance = () => {
    let url = "http://localhost:8000/api/staffattendance";
    if (selectedStaff || selectedDate) {
      url += "?";
      if (selectedStaff) {
        url += `staff_id=${selectedStaff}&`;
      }
      if (selectedDate) {
        url += `date=${selectedDate}`;
      }
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => setStaffAttendance(data.attendance))
      .catch((error) =>
        console.error("Error fetching staff attendance:", error)
      );
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const updateAttendanceStatus = (recordId, isPresent) => {
    const updatedAttendance = staffAttendance.map((record) => {
      if (record.id === recordId) {
        return { ...record, is_present: isPresent };
      } else {
        return record;
      }
    });
    setStaffAttendance(updatedAttendance);

    fetch(`http://localhost:8000/api/staffattendance/${recordId}`, {
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
        console.error("Error updating attendance:", error);
        // Revert local state on failure
        setStaffAttendance((prevAttendance) =>
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
      <Navadmin />
      <div className="topContainer p-6">
        <div className="titleContainer mb-4">
          <h2 className="text-2xl font-semibold">View Attendance</h2>
        </div>
        <div className="flex flex-wrap mb-4">
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
          <div className="mr-2">
            <label>Select Staff:</label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-400"
            >
              <option value="">All Staff</option>
              {staffs.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mr-2">
            <label>Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={fetchFilteredAttendance}
            >
              Show Attendance
            </button>
          </div>
        </div>
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Staff Name</th>
              <th className="p-3">Attendance Status</th>
              {editMode && <th className="p-3">Edit Attendance</th>}
            </tr>
          </thead>
          <tbody>
            {staffAttendance.map((record) => (
              <tr key={record[0]} className="border-b border-gray-200">
                <td className="p-3">{record[2]}</td>
                <td className="p-3">{record[4]}</td>
                <td className="p-3">{record[3] ? "Present" : "Absent"}</td>
                {editMode && (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageStaffAttendance;
