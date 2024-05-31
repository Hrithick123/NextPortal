import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faUserGraduate } from "@fortawesome/free-solid-svg-icons";
import Navadmin from "./templates/adminNavbar";

const StudentEdit = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [editableFields, setEditableFields] = useState({
    name: false,
    email: false,
    phone: false,
    course: false,
    staff: false,
  });

  useEffect(() => {
    // Fetch student data based on the studentId parameter
    const fetchStudentData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/students/${studentId}`
        );
        if (response.ok) {
          const data = await response.json();
          setStudent(data.student);
        } else {
          console.error("Error fetching student data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchStudentData();
  }, [studentId]);

  const handleEdit = (field) => {
    setEditableFields({ ...editableFields, [field]: true });
  };

  const handleSave = async (field) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/students/${studentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            [field]: student[field],
          }),
        }
      );
      if (response.ok) {
        setEditableFields({ ...editableFields, [field]: false });
      } else {
        console.error("Error updating student data:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating student data:", error);
    }
  };

  const moveToAlumni = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/students/${studentId}/alumni`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            graduated_year: new Date().getFullYear(),
          }),
        }
      );
      if (response.ok) {
        // Redirect to alumni page or show success message
      } else {
        console.error("Error moving student to alumni:", response.statusText);
      }
    } catch (error) {
      console.error("Error moving student to alumni:", error);
    }
  };

  if (!student) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navadmin />
      <br />
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Student Profile</h2>
        <div className="mb-4">
          <div>
            <p className="mb-2">
              <span className="font-semibold">Name:</span>{" "}
              {editableFields.name ? (
                <input
                  type="text"
                  value={student.name}
                  onChange={(e) =>
                    setStudent({ ...student, name: e.target.value })
                  }
                  onBlur={() => handleSave("name")}
                />
              ) : (
                <>
                  {student.name}
                  <FontAwesomeIcon
                    icon={faEdit}
                    className="ml-2 cursor-pointer"
                    onClick={() => handleEdit("name")}
                  />
                </>
              )}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Email:</span>{" "}
              {editableFields.email ? (
                <input
                  type="email"
                  value={student.email}
                  onChange={(e) =>
                    setStudent({ ...student, email: e.target.value })
                  }
                  onBlur={() => handleSave("email")}
                />
              ) : (
                <>
                  {student.email}
                  <FontAwesomeIcon
                    icon={faEdit}
                    className="ml-2 cursor-pointer"
                    onClick={() => handleEdit("email")}
                  />
                </>
              )}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Phone:</span>{" "}
              {editableFields.phone ? (
                <input
                  type="tel"
                  value={student.phone}
                  onChange={(e) =>
                    setStudent({ ...student, phone: e.target.value })
                  }
                  onBlur={() => handleSave("phone")}
                />
              ) : (
                <>
                  {student.phone}
                  <FontAwesomeIcon
                    icon={faEdit}
                    className="ml-2 cursor-pointer"
                    onClick={() => handleEdit("phone")}
                  />
                </>
              )}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Course:</span> {student.course}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Staff:</span> {student.staff}
            </p>
          </div>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          onClick={moveToAlumni}
        >
          <FontAwesomeIcon icon={faUserGraduate} className="mr-2" />
          Add to Alumni
        </button>
      </div>
    </div>
  );
};

export default StudentEdit;
