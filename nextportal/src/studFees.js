import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NavStudent from "./templates/studentNavbar";

const StudentFees = () => {
  const { studentId } = useParams();
  const [fees, setFees] = useState(null);

  useEffect(() => {
    const fetchFeesData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/students/${studentId}/fees`
        );
        if (response.ok) {
          const data = await response.json();
          setFees(data.fees);
        } else {
          console.error("Error fetching fees data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching fees data:", error);
      }
    };

    fetchFeesData();
  }, [studentId]);

  return (
    <div>
      <NavStudent />

      <div className="my-8 mx-auto max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Fees Information
        </h2>
        {fees ? (
          <div className="bg-white shadow-md rounded-lg p-4">
            <p className="mb-2">
              <strong>Total Amount: </strong>
              {fees.amount}
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
          <div className="text-gray-600 text-center">
            Loading fees information...
          </div>
        )}
      </div>
    </div>
  );
};

const renderInstallment = (name, paid, date, dueDate, amount) => {
  return (
    <p className="mb-2 text-center">
      <span className="text-blue-600">
        {paid === 1 ? `Paid on: ` : `Due Date for ${name} Installment: `}
      </span>
      <span className="text-gray-700">
        {paid === 1 ? `${date}` : `${dueDate}`}
      </span>
    </p>
  );
};

export default StudentFees;
