import React, { useState, useEffect } from "react";
import Navadmin from "./templates/adminNavbar";

const FeesModule = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [feesData, setFeesData] = useState([]);

  useEffect(() => {
    const fetchStudentsData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/admin-dashboard"
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched admin dashboard data:", data.studentsData);
          setStudentsData(data.studentsData);
        } else {
          console.error(
            "Error fetching admin dashboard data:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      }
    };

    const fetchFeesData = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/fees");
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched fees data:", data.fees);
          setFeesData(data.fees);
        } else {
          console.error("Error fetching fees data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching fees data:", error);
      }
    };

    fetchStudentsData();
    fetchFeesData();
  }, []);

  const handleUpdateInstallment = async (studentId, installment) => {
    const updatedInstallments = {
      [`paid_${installment}`]: true,
      date: new Date().toISOString().split("T")[0], // Update with current date
    };

    try {
      // Update fee installments through API
      await fetch("http://localhost:8000/api/update-installments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: studentId,
          ...updatedInstallments,
          installment: installment,
        }),
      });

      // Refresh fees data after successful update
      const response = await fetch("http://localhost:8000/api/fees");
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched fees data:", data.fees);
        setFeesData(data.fees);
      } else {
        console.error("Error fetching fees data:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating installments:", error);
    }
  };

  return (
    <div>
      <Navadmin />
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-4">Fees Module</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            {/* Table headers */}
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Course</th>
                <th className="border border-gray-300 px-4 py-2">
                  1st Installment
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  2nd Installment
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  3rd Installment
                </th>
              </tr>
            </thead>
            <tbody>
              {studentsData.map((student) => {
                const studentFees = feesData.find(
                  (fee) => fee.student_id === student.id
                );
                return (
                  <tr key={student.id}>
                    <td className="border border-gray-300 px-4 py-2">
                      {student.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {student.course}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {studentFees &&
                        (studentFees.paid_1st ? "Paid" : "Not Paid")}
                      {studentFees && studentFees.date_1st && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Paid on {studentFees.date_1st})
                        </span>
                      )}
                      {!studentFees ||
                        (!studentFees.paid_1st && (
                          <button
                            onClick={() =>
                              handleUpdateInstallment(student.id, "1st")
                            }
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 ml-2 rounded-md sm:px-3 sm:py-2"
                          >
                            Update
                          </button>
                        ))}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {studentFees &&
                        (studentFees.paid_2nd ? "Paid" : "Not Paid")}
                      {studentFees && studentFees.date_2nd && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Paid on {studentFees.date_2nd})
                        </span>
                      )}
                      {!studentFees ||
                        (!studentFees.paid_2nd && (
                          <button
                            onClick={() =>
                              handleUpdateInstallment(student.id, "2nd")
                            }
                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 ml-2 rounded-md sm:px-3 sm:py-2"
                          >
                            Update
                          </button>
                        ))}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {studentFees &&
                        (studentFees.paid_3rd ? "Paid" : "Not Paid")}
                      {studentFees && studentFees.date_3rd && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Paid on {studentFees.date_3rd})
                        </span>
                      )}
                      {!studentFees ||
                        (!studentFees.paid_3rd && (
                          <button
                            onClick={() =>
                              handleUpdateInstallment(student.id, "3rd")
                            }
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 ml-2 rounded-md sm:px-3 sm:py-2"
                          >
                            Update
                          </button>
                        ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeesModule;
