import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navadmin from "./templates/adminNavbar";

const Registration = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [transferOwnership, setTransferOwnership] = useState(false); // Toggle state for ownership transfer
  const navigate = useNavigate();

  const onButtonClick = async () => {
    // Set initial error values to empty
    setEmailError("");
    setPasswordError("");

    // Check if the user has entered both fields correctly
    if ("" === email) {
      setEmailError("Please enter your email");
      return;
    }

    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setEmailError("Please enter a valid email");
      return;
    }

    if ("" === password) {
      setPasswordError("Please enter a password");
      return;
    }

    if (password.length < 7) {
      setPasswordError("The password must be 8 characters or longer");
      return;
    }

    // Declare the response variable
    let response;

    if (transferOwnership) {
      // Make a POST request to transfer ownership
      try {
        response = await fetch("http://localhost:8000/api/update_user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            new_username: name,
            new_password: password,
          }),
        });

        if (response.ok) {
          // Transfer ownership successful
          console.log("Ownership transfer successful");
          navigate("/admin");
        } else {
          // Transfer ownership failed
          const errorData = await response.json().catch(() => ({})); // Handle parsing error
          console.error("Ownership transfer failed:", errorData);
        }
      } catch (error) {
        // Log the entire response text if an error occurs
        const errorText = await response.text().catch(() => ""); // Handle parsing error
        console.error("Error during ownership transfer:", error, errorText);
      }
    } else {
      // Make a POST request to register the user to your Flask backend
      try {
        response = await fetch("http://localhost:8000/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            name: name,
            password: password,
            role: role,
          }),
        });

        if (response.ok) {
          // Registration successful
          const data = await response.json();
          console.log("Registration successful:", data);
          navigate("/admin");
        } else {
          // Registration failed
          const errorData = await response.json().catch(() => ({})); // Handle parsing error
          console.error("Registration failed:", errorData);
        }
      } catch (error) {
        // Log the entire response text if an error occurs
        const errorText = await response.text().catch(() => ""); // Handle parsing error
        console.error("Error during registration:", error, errorText);
      }
    }
  };

  const onToggleChange = () => {
    setTransferOwnership(!transferOwnership); // Toggle ownership state
    // Clear form fields when switching modes
    setEmail("");
    setName("");
    setPassword("");
    setEmailError("");
    setPasswordError("");
  };

  return (
    <div>
      <Navadmin />
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="max-w-md w-full bg-white p-8 rounded shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center">
            {transferOwnership ? "Transfer Ownership" : "Registration"}
          </h2>
          {transferOwnership ? (
            <div>
              <div className="mb-4">
                <input
                  value={email}
                  placeholder="Enter your email here"
                  onChange={(ev) => setEmail(ev.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                />
                <label className="text-red-500">{emailError}</label>
              </div>
              <div className="mb-4">
                <input
                  value={name}
                  placeholder="Enter your Name here"
                  onChange={(ev) => setName(ev.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                />
                <label className="text-red-500">{emailError}</label>
              </div>
              <div className="mb-4">
                <button
                  className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                  onClick={onButtonClick}
                >
                  Transfer Ownership
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <input
                  value={email}
                  placeholder="Enter your email here"
                  onChange={(ev) => setEmail(ev.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                />
                <label className="text-red-500">{emailError}</label>
              </div>
              <div className="mb-4">
                <input
                  value={name}
                  placeholder="Enter your Name here"
                  onChange={(ev) => setName(ev.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                />
                <label className="text-red-500">{emailError}</label>
              </div>
              <div className="mb-4">
                <input
                  value={password}
                  placeholder="Enter your password here"
                  onChange={(ev) => setPassword(ev.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                  type="password"
                />
                <label className="text-red-500">{passwordError}</label>
              </div>
              <div className="mb-4">
                <select
                  value={role}
                  onChange={(ev) => setRole(ev.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div className="mb-4">
                <button
                  className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                  onClick={onButtonClick}
                >
                  Register
                </button>
              </div>
            </div>
          )}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-500"
                checked={transferOwnership}
                onChange={onToggleChange}
              />
              <span className="ml-2 text-gray-700">
                {transferOwnership
                  ? "Register a New User"
                  : "Transfer Ownership"}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
