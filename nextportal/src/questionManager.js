import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "./templates/staffNavbar";

const AssignMCQTest = () => {
  const { staffId } = useParams();
  const [formData, setFormData] = useState({
    student_ids: [],
    course_id: "",
    deadline: "",
    difficulty: "",
    num_questions: "",
  });

  const [assignedCourse, setAssignedCourse] = useState("");
  const [courseName, setCourseName] = useState("");
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchAssignedCourse();
    fetchStudents();
  }, []);

  const fetchAssignedCourse = async () => {
    try {
      const response = await axios.get(`/api/staffs/${staffId}`);
      setAssignedCourse(response.data.staff[4]);
      setCourseName(response.data.staff[5]);
    } catch (error) {
      console.error("Error fetching assigned course:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`/api/staffs/${staffId}/students`);
      setStudents(response.data.students);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "student_ids" ? Array.from(value) : value,
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    const studentId = e.target.value;
    setFormData((prevFormData) => {
      if (checked) {
        return {
          ...prevFormData,
          student_ids: [...prevFormData.student_ids, studentId],
        };
      } else {
        return {
          ...prevFormData,
          student_ids: prevFormData.student_ids.filter(
            (id) => id !== studentId
          ),
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      formData.course_id = assignedCourse;
      await axios.post("/api/assignments", formData);
      console.log("MCQ test assigned successfully.");
    } catch (error) {
      console.error("Error assigning MCQ test:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">
          Assign MCQ Test for {courseName}
        </h2>
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          <div className="mb-4">
            <label className="block mb-2">Students:</label>
            {students.map((student) => (
              <div key={student.id} className="mb-2">
                <input
                  type="checkbox"
                  id={`student_${student.id}`}
                  name="student_ids"
                  value={student.id}
                  checked={formData.student_ids.includes(student.id)}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor={`student_${student.id}`}>{student.name}</label>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <label className="block mb-2">Deadline:</label>
            <input
              type="datetime-local"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Difficulty:</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              required
            >
              <option value="">Select Difficulty</option>
              <option value="0">Easy</option>
              <option value="1">Medium</option>
              <option value="2">Hard</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Number of Questions:</label>
            <input
              type="number"
              name="num_questions"
              value={formData.num_questions}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Assign Test
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssignMCQTest;
