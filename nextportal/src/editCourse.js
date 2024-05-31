import React, { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import Navadmin from "./templates/adminNavbar";

const EditCourse = () => {
  const [courses, setCourses] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editCourseId, setEditCourseId] = useState(null);
  const [editedCourseName, setEditedCourseName] = useState("");
  const [editedStaffId, setEditedStaffId] = useState("");
  const [editedDuration, setEditedDuration] = useState("");
  const [editedFeeAmount, setEditedFeeAmount] = useState("");
  const [staffs, setStaffs] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [newCourseName, setNewCourseName] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newFeeAmount, setNewFeeAmount] = useState("");
  const [addingNewCourse, setAddingNewCourse] = useState(false);

  useEffect(() => {
    // Fetch existing courses when the component mounts
    fetch("http://localhost:8000/api/staffs")
      .then((response) => response.json())
      .then((data) => setStaffs(data.staffs))
      .catch((error) => console.error("Error fetching staffs:", error));

    getCourses();
  }, []);

  const getCourses = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
      } else {
        console.error("Error fetching courses:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleEdit = (courseId, courseName, staffId, duration, feeAmount) => {
    setEditMode(true);
    setEditCourseId(courseId);
    setEditedCourseName(courseName);
    setEditedStaffId(staffId);
    setEditedDuration(duration);
    setEditedFeeAmount(feeAmount);
  };

  const handleSave = async () => {
    try {
      const editedCourse = {
        course_id: editCourseId,
        course_name: editedCourseName,
        staff_id: editedStaffId,
        duration: editedDuration,
        fee_amount: editedFeeAmount, // Include fee_amount in the request
      };

      const response = await fetch(
        `http://localhost:8000/api/update-course/${editedCourse.course_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedCourse),
        }
      );

      if (response.ok) {
        console.log("Course Updated successfully!");
        // Refresh the course list after updating the course
        getCourses();
        // Reset edit mode and edited course
        setEditMode(false);
        setEditCourseId(null);
        // Reset real-time updates
        setEditedCourseName("");
        setEditedStaffId("");
        setEditedDuration("");
        setEditedFeeAmount("");
      } else {
        console.error("Error updating course:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  const deleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        const response = await fetch(
          `http://localhost:8000/api/delete-course/${courseId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log(result.message);
          alert("Course Deleted successfully!");
          // Refresh the course list after deleting the course
          getCourses();
        } else {
          console.error("Error deleting course:", response.statusText);
        }
      } catch (error) {
        console.error("Error deleting course:", error);
      }
    }
  };

  const handleAddNewCourse = () => {
    setAddingNewCourse(true);
  };

  const handleSaveNewCourse = async () => {
    try {
      // Validate that a staff is selected
      if (!selectedStaff) {
        alert("Please select a staff member for the course.");
        return;
      }

      const response = await fetch("http://localhost:8000/api/add-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_name: newCourseName,
          staff_id: selectedStaff,
          duration: newDuration,
          fee_amount: newFeeAmount, // Include fee_amount in the request
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result.message);
        // Refresh the course list after adding a new course
        getCourses();
        // Reset new course input fields and exit adding mode
        setNewCourseName("");
        setNewDuration("");
        setNewFeeAmount("");
        setAddingNewCourse(false);
      } else {
        console.error("Error adding course:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding course:", error);
    }
  };

  return (
    <div>
      <Navadmin />
      <div className="mainContainer px-4 sm:px-6 lg:px-8 py-6">
        <div className="titleContainer mb-6">
          <h2 className="text-2xl font-bold">Existing Courses</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Course Name</th>
                <th className="px-4 py-2 border">Staff</th>
                <th className="px-4 py-2 border">Duration</th>
                <th className="px-4 py-2 border">Fee</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {addingNewCourse && (
                <tr>
                  <td className="px-4 py-2 border">
                    <input
                      type="text"
                      placeholder="Enter course name"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring focus:ring-blue-300"
                    />
                  </td>
                  <td className="px-4 py-2 border">
                    <select
                      value={selectedStaff}
                      onChange={(e) => setSelectedStaff(e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring focus:ring-blue-300"
                    >
                      <option value="">Select Staff</option>
                      {staffs.map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 border">
                    <input
                      type="text"
                      placeholder="Enter duration"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring focus:ring-blue-300"
                    />
                  </td>
                  <td className="px-4 py-2 border">
                    <input
                      type="text"
                      placeholder="Enter fee"
                      value={newFeeAmount}
                      onChange={(e) => setNewFeeAmount(e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring focus:ring-blue-300"
                    />
                  </td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={handleSaveNewCourse}
                      className="px-4 py-2 bg-green-500 text-white rounded focus:outline-none focus:ring focus:ring-green-300"
                    >
                      Save
                    </button>
                  </td>
                </tr>
              )}
              {courses.map((course) => (
                <tr key={course.course_id}>
                  <td className="px-4 py-2 border">
                    {editMode && editCourseId === course.course_id ? (
                      <input
                        type="text"
                        value={editedCourseName}
                        onChange={(e) => setEditedCourseName(e.target.value)}
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring focus:ring-blue-300"
                      />
                    ) : (
                      course.course_name
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    {editMode && editCourseId === course.course_id ? (
                      <select
                        value={editedStaffId}
                        onChange={(e) => setEditedStaffId(e.target.value)}
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring focus:ring-blue-300"
                      >
                        {staffs.map((staff) => (
                          <option
                            key={staff.id}
                            value={staff.id}
                            selected={staff.id === course.staff_id}
                          >
                            {staff.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      staffs.find((staff) => staff.id === course.staff_id)
                        ?.name || "N/A"
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    {editMode && editCourseId === course.course_id ? (
                      <input
                        type="text"
                        value={editedDuration}
                        onChange={(e) => setEditedDuration(e.target.value)}
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring focus:ring-blue-300"
                      />
                    ) : (
                      course.duration
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    {editMode && editCourseId === course.course_id ? (
                      <input
                        type="text"
                        value={editedFeeAmount}
                        onChange={(e) => setEditedFeeAmount(e.target.value)}
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring focus:ring-blue-300"
                      />
                    ) : (
                      course.fee_amount
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    {editMode && editCourseId === course.course_id ? (
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-500 text-white rounded focus:outline-none focus:ring focus:ring-blue-300 mr-2"
                      >
                        Save
                      </button>
                    ) : (
                      <>
                        <button
                          className="px-4 py-2 bg-yellow-500 text-white rounded focus:outline-none focus:ring focus:ring-yellow-300 mr-2"
                          onClick={() =>
                            handleEdit(
                              course.course_id,
                              course.course_name,
                              course.staff_id,
                              course.duration,
                              course.fee_amount
                            )
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="px-4 py-2 bg-red-500 text-white rounded focus:outline-none focus:ring focus:ring-red-300"
                          onClick={() => deleteCourse(course.course_id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="inputContainer mt-6">
          {!addingNewCourse && (
            <button
              onClick={handleAddNewCourse}
              className="px-4 py-2 bg-green-500 text-white rounded focus:outline-none focus:ring focus:ring-green-300"
            >
              Add Course
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditCourse;
