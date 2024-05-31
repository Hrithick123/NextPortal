import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NavStudent from "./templates/studentNavbar";

const StudentProfile = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);
  const imageUrl = `http://localhost:8000/profile/${studentId}.jpg`;

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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setProfilePicture(file);
  };

  const handleUpload = async () => {
    if (!profilePicture) {
      alert("Please select a file.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("profilePicture", profilePicture);

    try {
      const response = await fetch(
        `http://localhost:8000/api/students/${studentId}/profile-picture`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStudent({ ...student, profile_picture: data.profile_picture });
        alert("Profile picture updated successfully.");
      } else {
        console.error("Error updating profile picture:", response.statusText);
        alert("Error updating profile picture. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      alert("Error updating profile picture. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!student) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <NavStudent />
      <br />
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Student Profile</h2>
        <div className="flex justify-center items-center mb-4">
          <img
            src={imageUrl}
            alt="Profile"
            className="w-32 h-32 rounded-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Upload Profile Picture:</label>
          <input type="file" onChange={handleFileChange} />
          <button
            className="ml-2 py-1 px-3 bg-blue-500 text-white rounded"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
        <div>
          <p className="mb-2">
            <span className="font-semibold">Name:</span> {student.name}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Email:</span> {student.email}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Phone:</span> {student.phone}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Course ID:</span> {student.course}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Staff ID:</span> {student.staff}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
