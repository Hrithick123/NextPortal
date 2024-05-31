import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import NavStudent from "./templates/studentNavbar";

const StudentDashboard = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [fees, setFees] = useState(null);

  useEffect(() => {
    // Fetch student data based on the studentId parameter
    const fetchStudentData = async () => {
      try {
        const studentResponse = await fetch(
          `http://localhost:8000/api/students/${studentId}`
        );
        if (studentResponse.ok) {
          const studentData = await studentResponse.json();
          setStudent(studentData.student);
        } else {
          console.error(
            "Error fetching student data:",
            studentResponse.statusText
          );
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    // Fetch tasks assigned to the student
    const fetchTasks = async () => {
      try {
        const tasksResponse = await fetch(
          `http://localhost:8000/api/students/${studentId}/tasks`
        );
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          setTasks(tasksData.tasks);
        } else {
          console.error(
            "Error fetching student tasks:",
            tasksResponse.statusText
          );
        }
      } catch (error) {
        console.error("Error fetching student tasks:", error);
      }
    };

    // Fetch fees information for the student
    const fetchFeesData = async () => {
      try {
        const feesResponse = await fetch(
          `http://localhost:8000/api/students/${studentId}/fees`
        );
        if (feesResponse.ok) {
          const feesData = await feesResponse.json();
          setFees(feesData.fees);
        } else {
          console.error("Error fetching fees data:", feesResponse.statusText);
        }
      } catch (error) {
        console.error("Error fetching fees data:", error);
      }
    };

    fetchStudentData();
    fetchTasks();
    fetchFeesData();
  }, [studentId]);

  return (
    <div>
      <NavStudent />
      <div className="container mx-auto px-4 lg:px-0 pt-16">
        <div className="flex flex-col lg:flex-row items-center justify-center">
          {student && (
            <div className="lg:w-1/3 mb-4 lg:mb-0">
              <div className="bg-white shadow-md rounded-lg p-4">
                <img
                  className="rounded-full w-32 h-32 mx-auto mb-4"
                  src={`http://localhost:8000/profile/${student.id}.jpg`}
                  alt="Profile"
                />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-center">
                    {student.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Email:</span>{" "}
                    {student.email}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Staff:</span>{" "}
                    {student.staff}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Course:</span>{" "}
                    {student.course}
                  </p>
                  <p className="text-xl text-blue-600">
                    <span className="font-bold">Last Score:</span>{" "}
                    {student.score}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="lg:w-2/3 lg:pl-4">
            <div className="bg-white shadow-md rounded-lg p-4 mb-4">
              <h2 className="text-xl font-semibold mb-4">Tasks Assigned</h2>
              <ul>
                {tasks.map((task) => (
                  <Link to={`/student/tasks/${studentId}`} key={task.task_id}>
                    <li className="mb-2">
                      <p>{task.task_description}</p>
                    </li>
                  </Link>
                ))}
              </ul>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Fees Information</h2>
              {fees ? (
                <div>
                  <p className="mb-2">
                    <strong>Total Amount:</strong> {fees.amount}
                  </p>
                  {renderInstallment(
                    "1st",
                    fees.paid_1st,
                    fees.date_1st,
                    fees.due_1st,
                    fees.inst_1
                  )}
                  {renderInstallment(
                    "2nd",
                    fees.paid_2nd,
                    fees.date_2nd,
                    fees.due_2,
                    fees.inst_2
                  )}
                  {renderInstallment(
                    "3rd",
                    fees.paid_3rd,
                    fees.date_3rd,
                    fees.due_3,
                    fees.inst_3
                  )}
                </div>
              ) : (
                <div className="text-gray-600">Loading fees information...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const renderInstallment = (name, paid, date, dueDate, amount) => {
  return (
    <p className="mb-2">
      <span className="text-blue-600">
        {paid === 1 ? `Paid on: ` : `Due Date for ${name} Installment: `}
      </span>
      <span className="text-gray-700">
        {paid === 1 ? `${date}` : `${dueDate}`}
      </span>
    </p>
  );
};

export default StudentDashboard;
