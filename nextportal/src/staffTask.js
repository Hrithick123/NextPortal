import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./templates/staffNavbar";

const StaffTaskComponent = () => {
  const { staffId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudentsData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/staffs/${staffId}/students`
        );
        if (response.ok) {
          const data = await response.json();
          setStudents(
            data.students.map((student) => ({ ...student, selected: false }))
          );
        } else {
          throw new Error("Failed to fetch students data");
        }
      } catch (error) {
        console.error("Error fetching students data:", error);
      }
    };

    fetchStudentsData();
  }, []);

  useEffect(() => {
    const fetchTasksData = async () => {
      try {
        const selectedStudents = students.filter((student) => student.selected);
        const tasksPromises = selectedStudents.map(async (student) => {
          const response = await fetch(
            `http://localhost:8000/api/students/${student.id}/tasks`
          );
          if (response.ok) {
            const data = await response.json();
            return data.tasks;
          } else {
            throw new Error(
              `Failed to fetch tasks data for student ${student.id}`
            );
          }
        });
        const tasksData = await Promise.all(tasksPromises);
        const allTasks = tasksData.reduce((acc, val) => acc.concat(val), []);
        setTasks(allTasks);
      } catch (error) {
        console.error("Error fetching tasks data:", error);
      }
    };

    fetchTasksData();
  }, [students]);

  const handleAddTask = async () => {
    setLoading(true);
    try {
      const tasksPromises = students
        .filter((student) => student.selected)
        .map(async (student) => {
          const response = await fetch(
            `http://localhost:8000/api/students/${student.id}/tasks`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                task_description: newTask,
                deadline,
                staff_id: staffId,
              }),
            }
          );
          if (response.ok) {
            const data = await response.json();
            return data.task; // Ensure task_description is retrieved
          } else {
            throw new Error(`Failed to add task for student ${student.id}`);
          }
        });

      const newTasks = await Promise.all(tasksPromises);
      setTasks([...tasks, ...newTasks.filter((task) => task !== null)]);
      setNewTask("");
      setDeadline("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
    setLoading(false);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/tasks/${taskId}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        setTasks(tasks.filter((task) => task.id !== taskId));
      } else {
        throw new Error(`Failed to delete task ${taskId}`);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Assign Task</h2>
        <div className="space-y-2 mb-4">
          {students.map((student) => (
            <div key={student.id} className="flex items-center">
              <input
                type="checkbox"
                checked={student.selected}
                onChange={(e) =>
                  setStudents(
                    students.map((s) =>
                      s.id === student.id
                        ? { ...s, selected: e.target.checked }
                        : s
                    )
                  )
                }
                className="mr-2"
              />
              <label>{student.name}</label>
            </div>
          ))}
        </div>
        <div className="flex space-x-4 mb-4">
          <div>
            <label className="block">Task Description:</label>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="border rounded px-4 py-2 w-64"
            />
          </div>
          <div>
            <label className="block">Deadline:</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="border rounded px-4 py-2"
            />
          </div>
          <button
            onClick={handleAddTask}
            disabled={!newTask || loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {loading ? "Adding Task..." : "Add Task"}
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-4">Tasks</h2>
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.task_id}>
              {task && task.task_description && task.deadline && (
                <>
                  {task.task_description} (Deadline: {task.deadline})
                  <button onClick={() => handleDeleteTask(task.task_id)}>
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StaffTaskComponent;
