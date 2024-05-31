import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import NavStudent from "./templates/studentNavbar";

const TestComponent = () => {
  const { studentId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [score, setScore] = useState(null);
  const [timer, setTimer] = useState(300); // Initial timer value: 300 seconds (5 minutes per question)

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(
        `/api/questions?student_id=${studentId}`
      );
      if (response.data.questions.length === 0) {
        // If no questions available, set timer to 0
        setTimer(0);
      }
      setQuestions(response.data.questions);
      // Calculate total time based on the number of questions (5 minutes per question)
      const totalTime = response.data.questions.length * 300;
      setTimer(totalTime);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleResponseChange = (questionId, selectedOption) => {
    setResponses({
      ...responses,
      [questionId]: selectedOption,
    });
  };

  const handleSubmitTest = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    let score = 0;

    // Loop through each question
    questions.forEach((question) => {
      // Get the correct option from the question object
      const correctOption = question.correct_option;

      // Get the selected option from the responses object
      const selectedOption = responses[question.id];

      // If the selected option matches the correct option, increment the score
      if (selectedOption && parseInt(selectedOption) === correctOption) {
        score++;
      }
    });

    // Update the score state
    setScore(score);

    // Optionally, you can display the score to the user
    console.log("Your score:", score);

    // Create a payload containing the student ID and score
    const payload = {
      student_id: studentId,
      score: score,
    };

    try {
      // Make a POST request to the backend to store the score
      await axios.post("/api/scores", payload);
      console.log("Score stored successfully.");

      // Delete the record from the mcq_assignments table
      await axios.delete(`/api/mcq_assignments/${studentId}`);
      console.log("MCQ assignment record deleted successfully.");
    } catch (error) {
      console.error("Error storing score or deleting record:", error);
    }
  };

  return (
    <div>
      <NavStudent />
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
        <h1 className="text-3xl font-bold mb-8">MCQ Test</h1>
        {questions.length > 0 && (
          <p className="mb-4">
            Time Remaining: {Math.floor(timer / 60)}:
            {timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
          </p>
        )}
        {questions.length > 0 && (
          <form className="max-w-md w-full" onSubmit={handleSubmitTest}>
            {questions.map((question) => (
              <div key={question.id} className="mb-4">
                <p className="font-semibold">{question.question}</p>
                <div className="mt-2">
                  {[1, 2, 3, 4].map((index) => (
                    <label
                      key={index}
                      className="flex items-center mb-2 py-1 rounded-md bg-gray-200"
                    >
                      <input
                        type="radio"
                        name={`question_${question.id}`}
                        value={index}
                        checked={responses[question.id] === String(index)}
                        onChange={(e) =>
                          handleResponseChange(question.id, e.target.value)
                        }
                        className="mr-2"
                        disabled={score !== null} // Disable radio buttons after submission
                      />
                      {question[`option${index}`]}
                    </label>
                  ))}
                </div>
                {/* Display correct answer and selected option after submission */}
                {score !== null && (
                  <div
                    className={`mt-2 ${
                      responses[question.id] === String(question.correct_option)
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    Correct Answer:{" "}
                    {question[`option${question.correct_option}`]}
                    <br />
                    Your Answer: {question[`option${responses[question.id]}`]}
                  </div>
                )}
              </div>
            ))}
            {/* Hide the submit button after submission */}
            {score === null && (
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
              >
                Submit Test
              </button>
            )}
          </form>
        )}
        {questions.length === 0 && <p>No MCQs assigned as of now.</p>}
      </div>
    </div>
  );
};

export default TestComponent;
