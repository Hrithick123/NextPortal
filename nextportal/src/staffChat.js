import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Navbar from "./templates/staffNavbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

const ChatStaff = () => {
  const { staffId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState("");

  const fetchStaffData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/staffs/${staffId}`
      );
      setUserId(response.data.staff[3]);
      fetchMessages();
    } catch (error) {
      console.error("Error fetching Staff data:", error);
    }
  };

  useEffect(() => {
    fetchStaffData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffId]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/messages");
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/messages", {
        user_id: userId,
        message: newMessage,
      });
      fetchMessages();
      setNewMessage("");
    } catch (error) {
      console.error("Error submitting message:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex flex-col h-screen">
        <h2 className="text-2xl font-bold p-4 bg-gray-800 text-white">
          Chat Forum
        </h2>
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${
                message[0] === userId ? "self-end" : "self-start"
              } flex flex-col items-${
                message[0] === userId ? "end" : "start"
              } mb-4`}
            >
              <div
                className={`${
                  message[0] === userId ? "bg-cyan-200" : "bg-grey-200"
                } rounded-lg p-2 max-w-xs`}
                style={{
                  alignSelf: message[0] === userId ? "flex-end" : "flex-start",
                  color: message[0] === userId ? "#333" : "#000",
                  wordWrap: "break-word",
                }}
              >
                <p className="text-sm">
                  <span className="text-blue-600">{message[3]}</span>
                  <span className="text-xs text-brown-400">
                    {" "}
                    ({message[4]})
                  </span>
                </p>
                <p className="text-lg">{message[1]}</p>
                <span className="text-xs text-gray-600 float-right">
                  {message[2]}
                </span>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="p-4 flex items-center">
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 mr-2"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatStaff;
