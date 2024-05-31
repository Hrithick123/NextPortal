import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Navbar from "./templates/staffNavbar";

const MCQuestions = () => {
  const { staffId } = useParams();
  const [courseId, setCourseId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correct_option: "",
    difficulty: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    fetchAssignedCourse();
  }, []);

  const fetchAssignedCourse = async () => {
    try {
      const response = await axios.get(`/api/staffs/${staffId}`);
      const courseIdFromResponse = response.data.staff[4];
      if (courseIdFromResponse) {
        setCourseId(courseIdFromResponse);
        fetchQuestions(courseIdFromResponse); // Fetch questions after setting courseId
        setCourseName(response.data.staff[5]);
      } else {
        console.error("Course ID not found in response");
      }
      setIsLoading(false); // Set loading to false once courseId is set
    } catch (error) {
      console.error("Error fetching assigned course:", error);
    }
  };

  const fetchQuestions = async (courseId) => {
    // Pass courseId to fetchQuestions
    try {
      const response = await axios.get(`/api/questions/${courseId}`);
      setQuestions(response.data.questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateInputs(newQuestion);
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await axios.post("/api/questions", {
          ...newQuestion,
          staff_id: staffId, // Include courseId from hidden input
        });
        setNewQuestion({
          ...newQuestion,
          question: "",
          option1: "",
          option2: "",
          option3: "",
          option4: "",
          correct_option: "",
          difficulty: "",
        });
        fetchQuestions(courseId); // Pass courseId to fetchQuestions
      } catch (error) {
        console.error("Error creating question:", error);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/questions/${id}`);
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion({
      ...newQuestion,
      [name]: value,
    });
    // Clear the error message for the input field when typing
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validateInputs = (inputs) => {
    const errors = {};
    Object.entries(inputs).forEach(([key, value]) => {
      if (value.trim() === "") {
        errors[key] = `${
          key.charAt(0).toUpperCase() + key.slice(1)
        } cannot be empty`;
      }
    });
    return errors;
  };

  const difficultyText = (difficulty) => {
    switch (difficulty) {
      case 0:
        return "Easy";
      case 1:
        return "Medium";
      case 2:
        return "Hard";
      default:
        return "Unknown";
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-8 flex flex-col lg:flex-row">
        <div className="lg:w-1/2 lg:pr-8">
          <h1 className="text-2xl font-bold mb-4">
            MCQ Assignment - {courseName}
          </h1>
          <form onSubmit={handleSubmit} className="mb-8 max-w-md">
            <div>
              <label className="block mb-2" htmlFor="question">
                Question:
              </label>
              <input type="hidden" name="course_id" value={courseId} />
              <input
                type="text"
                id="question"
                name="question"
                value={newQuestion.question}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded ${
                  errors["question"] ? "border-red-500" : ""
                }`}
              />
              {errors["question"] && (
                <p className="text-red-500 mt-1">{errors["question"]}</p>
              )}
            </div>
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2" htmlFor="option1">
                  Option 1:
                </label>
                <input
                  type="text"
                  id="option1"
                  name="option1"
                  value={newQuestion.option1}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded ${
                    errors["option1"] ? "border-red-500" : ""
                  }`}
                />
                {errors["option1"] && (
                  <p className="text-red-500 mt-1">{errors["option1"]}</p>
                )}
              </div>
              <div>
                <label className="block mb-2" htmlFor="option2">
                  Option 2:
                </label>
                <input
                  type="text"
                  id="option2"
                  name="option2"
                  value={newQuestion.option2}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded ${
                    errors["option2"] ? "border-red-500" : ""
                  }`}
                />
                {errors["option2"] && (
                  <p className="text-red-500 mt-1">{errors["option2"]}</p>
                )}
              </div>
              <div>
                <label className="block mb-2" htmlFor="option3">
                  Option 3:
                </label>
                <input
                  type="text"
                  id="option3"
                  name="option3"
                  value={newQuestion.option3}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded ${
                    errors["option3"] ? "border-red-500" : ""
                  }`}
                />
                {errors["option3"] && (
                  <p className="text-red-500 mt-1">{errors["option3"]}</p>
                )}
              </div>
              <div>
                <label className="block mb-2" htmlFor="option4">
                  Option 4:
                </label>
                <input
                  type="text"
                  id="option4"
                  name="option4"
                  value={newQuestion.option4}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded ${
                    errors["option4"] ? "border-red-500" : ""
                  }`}
                />
                {errors["option4"] && (
                  <p className="text-red-500 mt-1">{errors["option4"]}</p>
                )}
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-2" htmlFor="correct_option">
                Correct Option:
              </label>
              <select
                id="correct_option"
                name="correct_option"
                value={newQuestion.correct_option}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded ${
                  errors["correct_option"] ? "border-red-500" : ""
                }`}
              >
                <option value="">Select Correct Option</option>
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
                <option value="3">Option 3</option>
                <option value="4">Option 4</option>
              </select>
              {errors["correct_option"] && (
                <p className="text-red-500 mt-1">{errors["correct_option"]}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block mb-2" htmlFor="difficulty">
                Difficulty:
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={newQuestion.difficulty}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded ${
                  errors["difficulty"] ? "border-red-500" : ""
                }`}
              >
                <option value="">Select Difficulty</option>
                <option value="0">Easy</option>
                <option value="1">Medium</option>
                <option value="2">Hard</option>
              </select>
              {errors["difficulty"] && (
                <p className="text-red-500 mt-1">{errors["difficulty"]}</p>
              )}
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Add Question
            </button>
          </form>
        </div>
        <div className="lg:w-1/2">
          <div>
            <h2 className="text-xl font-bold mb-4">Questions</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Question</th>
                  <th className="border px-4 py-2">Difficulty</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
                  <tr key={question[0]} className="mb-4">
                    <td className="border px-4 py-2">{question[2]}</td>
                    <td className="border px-4 py-2">
                      {difficultyText(question[8])}
                    </td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => handleDelete(question[0])}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCQuestions;
