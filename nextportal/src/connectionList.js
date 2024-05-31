import React, { useState, useEffect } from "react";
import axios from "axios";
import AddConnectionForm from "./addConnectionForm";
import Navadmin from "./templates/adminNavbar";

const ConnectionList = () => {
  const [connections, setConnections] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    interest: "",
    course: "",
    lead_stage: "",
  });
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchConnections();
    fetchCourses();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await axios.get("/api/connections");
      setConnections(response.data.connections);
    } catch (error) {
      console.error("Error fetching connections:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get("/api/courses");
      setCourses(response.data.courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleUpdateField = async (value, id, field) => {
    try {
      await axios.put(`/api/connections/${id}`, { [field]: value });
      const updatedConnections = connections.map((connection) =>
        connection.id === id ? { ...connection, [field]: value } : connection
      );
      setConnections(updatedConnections);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };

  const renderDropdown = (value, options, field, id) => (
    <select
      value={value}
      onChange={(e) => handleUpdateField(e.target.value, id, field)}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const applyFilters = () => {
    return connections.filter((connection) => {
      return (
        (filters.interest === "" || connection.interest === filters.interest) &&
        (filters.course === "" || connection.course === filters.course) &&
        (filters.lead_stage === "" ||
          connection.lead_stage === filters.lead_stage)
      );
    });
  };

  const filteredConnections = applyFilters();

  return (
    <div>
      <Navadmin />
      <div className="container mx-auto p-4">
        <div className="flex space-x-4 mb-4">
          <div>
            <label htmlFor="interestFilter">Interest:</label>
            <select
              id="interestFilter"
              value={filters.interest}
              onChange={(e) =>
                setFilters({ ...filters, interest: e.target.value })
              }
            >
              <option value="">All</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="TBD">TBD</option>
            </select>
          </div>
          {/* <div>
          <label htmlFor="courseFilter">Course:</label>
          <select
            id="courseFilter"
            value={filters.course}
            onChange={(e) => setFilters({ ...filters, course: e.target.value })}
          >
            <option value="">All</option>
            {courses.map((course) => (
              <option key={course.course_id} value={course.course_id}>
                {course.course_name}
              </option>
            ))}
          </select>
        </div> */}
          <div>
            <label htmlFor="leadStageFilter">Lead Stage:</label>
            <select
              id="leadStageFilter"
              value={filters.lead_stage}
              onChange={(e) =>
                setFilters({ ...filters, lead_stage: e.target.value })
              }
            >
              <option value="">All</option>
              <option value="Hot">Hot</option>
              <option value="Warm">Warm</option>
              <option value="Cold">Cold</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Connection
        </button>
        {showForm && (
          <AddConnectionForm
            onAddConnection={(newConnection) => {
              setConnections([...connections, newConnection]);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        )}
        <table className="mt-4 w-full border-collapse border border-gray-800">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-800 px-4 py-2">Date</th>
              <th className="border border-gray-800 px-4 py-2">Name</th>
              <th className="border border-gray-800 px-4 py-2">Phone Number</th>
              <th className="border border-gray-800 px-4 py-2">Email</th>
              <th className="border border-gray-800 px-4 py-2">Course</th>
              <th className="border border-gray-800 px-4 py-2">Interest</th>
              <th className="border border-gray-800 px-4 py-2">Source</th>
              <th className="border border-gray-800 px-4 py-2">Lead Stage</th>
              <th className="border border-gray-800 px-4 py-2">Lead Status</th>
              <th className="border border-gray-800 px-4 py-2">Message</th>
            </tr>
          </thead>
          <tbody>
            {filteredConnections.map((connection, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-100" : ""}>
                <td className="border border-gray-800 px-4 py-2">
                  {connection.date}
                </td>
                <td className="border border-gray-800 px-4 py-2">
                  {connection.name}
                </td>
                <td className="border border-gray-800 px-4 py-2">
                  {connection.phone_number}
                </td>
                <td className="border border-gray-800 px-4 py-2">
                  {connection.email}
                </td>
                <td className="border border-gray-800 px-4 py-2">
                  {connection.course}
                </td>
                <td className="border border-gray-800 px-4 py-2">
                  {renderDropdown(
                    connection.interest,
                    ["Yes", "No", "TBD"],
                    "interest",
                    connection.id
                  )}
                </td>
                <td className="border border-gray-800 px-4 py-2">
                  {connection.source}
                </td>
                <td className="border border-gray-800 px-4 py-2">
                  {renderDropdown(
                    connection.lead_stage,
                    ["Hot", "Warm", "Cold"],
                    "lead_stage",
                    connection.id
                  )}
                </td>
                <td className="border border-gray-800 px-4 py-2">
                  <EditableField
                    value={connection.lead_status}
                    id={connection.id}
                    field="lead_status"
                    onUpdate={handleUpdateField}
                  />
                </td>
                <td className="border border-gray-800 px-4 py-2">
                  <EditableField
                    value={connection.message}
                    id={connection.id}
                    field="messages"
                    onUpdate={handleUpdateField}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const EditableField = ({ value, id, field, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setEditedValue(value);
  };

  const saveEdit = () => {
    onUpdate(editedValue, id, field);
    setIsEditing(false);
  };

  return (
    <div>
      {isEditing ? (
        <>
          <input
            type="text"
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
          />
          <button onClick={saveEdit}>Save</button>
        </>
      ) : (
        <span onClick={toggleEdit}>
          {value} <i className="fas fa-pencil-alt"></i>
        </span>
      )}
    </div>
  );
};

export default ConnectionList;
