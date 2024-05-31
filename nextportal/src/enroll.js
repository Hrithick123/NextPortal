import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navadmin from "./templates/adminNavbar";

const EnrollmentForm = () => {
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [doj, setDoj] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/courses");
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched courses:", data.courses);
          setCourses(data.courses);
        } else {
          console.error("Error fetching courses:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  const enrollStudent = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          course,
          doj,
          email,
          phone,
          dob,
          password: dob, // Set password as dob
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result.message);

        // Update the Users table with user role, user id, and password
        alert("Enrollment Successful");
        navigate("/admin");
      } else {
        const result = await response.json();
        setErrorMessage(result.error);
      }
    } catch (error) {
      console.error("Error enrolling student:", error);
      setErrorMessage("Error enrolling student. Please try again.");
    }
  };

  return (
    <div>
      <Navadmin />

      <div className="max-w-md mx-auto my-8 p-8 bg-white rounded-lg shadow-md">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Enrollment Form</h2>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Name:
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Course:
          </label>
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          >
            <option value="" disabled>
              Select a course
            </option>
            {courses.map((course) => (
              <option key={course.course_id} value={course.course_id}>
                {course.course_name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Date of Joining:
          </label>
          <input
            type="date"
            value={doj}
            onChange={(e) => setDoj(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Email:
          </label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Phone:
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Date of Birth:
          </label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <button
            className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:bg-blue-700 hover:bg-blue-700"
            onClick={enrollStudent}
          >
            Enroll Student
          </button>
        </div>
        {errorMessage && <div className="text-red-600">{errorMessage}</div>}
      </div>
    </div>
  );
};

export default EnrollmentForm;
