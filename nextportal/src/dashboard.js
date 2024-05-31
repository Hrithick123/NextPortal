import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const Dashboard = () => {
  const { userRole, studentId } = useParams();
  const [studentDetails, setStudentDetails] = useState(null);

  useEffect(() => {
    if (userRole === "student" && studentId) {
      // Fetch student details based on the ID
      fetch(`http://localhost:8000/api/student/${studentId}`)
        .then((response) => response.json())
        .then((data) => setStudentDetails(data.student))
        .catch((error) =>
          console.error("Error fetching student details:", error)
        );
    }
  }, [userRole, studentId]);

  const renderNavbar = () => {
    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            Dashboard
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ml-auto">
              {userRole === "admin" && (
                <>
                  <li className="nav-item">
                    <a className="nav-link" href="/register">
                      Add User
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/enroll">
                      Enroll Student
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/editcourse">
                      Manage Courses
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/editattendance">
                      Manage Attendance
                    </a>
                  </li>
                </>
              )}
              {userRole === "staff" && (
                <>
                  <li className="nav-item">
                    <a className="nav-link" href="/students">
                      Students Details
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/attendance">
                      Mark Attendance
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/viewattendance">
                      View Attendance
                    </a>
                  </li>
                </>
              )}
              {userRole === "student" && (
                <>
                  <li className="nav-item">
                    <a className="nav-link" href="/student">
                      Student Profile
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/view-attendance">
                      View Attendance
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/view-courses">
                      View Courses
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    );
  };

  return (
    <div>
      {renderNavbar()}
      <div className="dashboard-content">
        <h1>Welcome to the Dashboard</h1>
        {userRole === "student" && studentDetails ? (
          <>
            <p>Name: {studentDetails.name}</p>

            <p>Email: {studentDetails.email}</p>
            {/* Add other details as needed */}
          </>
        ) : (
          <p>
            {userRole === "student"
              ? "Loading student details..."
              : "Explore the dashboard features"}
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
