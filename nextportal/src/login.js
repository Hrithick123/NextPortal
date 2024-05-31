import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();

  const logIn = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.message === "Login successful") {
          console.log("Authentication successful:", result);

          // Determine the path based on the user's role
          let path = "/admin";
          if (result.userRole === "student") {
            path = `/student/${result.userId}`; // Navigate to student profile
          } else if (result.userRole === "staff") {
            path = `/staff/${result.userId}`; // Navigate to staff profile
          }

          navigate(path); // Navigate to the determined path
        } else {
          console.log("Authentication failed:", result);
          window.alert("Wrong email or password");
        }
      } else {
        // Handle other HTTP status codes (non-200)
        console.log("Error during login:", response.statusText);
        window.alert("Please Check your email or password");
      }
    } catch (error) {
      // Handle network or other errors
      console.error("Error during login:", error);
      window.alert("Error during login. Please try again.");
    }
  };

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

    // Call the server API to log in
    await logIn();
  };

  return (
    <div className="mainContainer flex flex-col items-center justify-center h-screen">
      <div className="titleContainer mt-8">
        <img
          src={require("./static/nextskill_logo.png")}
          alt="Nextportal Logo"
          className="cursor-pointer"
        />
        <div className="text-xl font-bold mb-4">Students Management Portal</div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <div className="text-3xl font-bold mb-4">Login</div>

        <div className="mb-4">
          <input
            value={email}
            placeholder="Enter your email here"
            onChange={(ev) => setEmail(ev.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:border-blue-400"
          />
          <label className="text-red-500">{emailError}</label>
        </div>

        <div className="mb-4">
          <input
            value={password}
            placeholder="Enter your password here MM-DD-YYYY"
            onChange={(ev) => setPassword(ev.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:border-blue-400"
            type="password"
          />
          <label className="text-red-500">{passwordError}</label>
        </div>

        <div>
          <input
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            type="button"
            onClick={onButtonClick}
            value="Log in"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
