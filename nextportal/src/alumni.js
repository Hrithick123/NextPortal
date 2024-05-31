import React, { useState, useEffect } from "react";
import Navadmin from "./templates/adminNavbar";

const AlumniList = () => {
  const [alumniList, setAlumniList] = useState([]);

  useEffect(() => {
    // Fetch all alumni data
    const fetchAlumniData = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/alumni");
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setAlumniList(data.alumni); // Access data.alumni directly
        } else {
          console.error("Error fetching alumni data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching alumni data:", error);
      }
    };

    fetchAlumniData();
  }, []);

  return (
    <div>
      <Navadmin />
      <br />
      <div className="max-w-4xl mx-auto bg-blue-100">
        <h2 className="text-2xl font-bold mb-4 text-center">Alumni List</h2>
        <div className="overflow-x-auto">
          <table className="table-auto min-w-full">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Graduated Year</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {alumniList.map((alumni) => (
                <tr
                  key={alumni.alumni_id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="px-6 py-4 whitespace-nowrap">{alumni.name}</td>
                  <td className="px-6 py-4">{alumni.email}</td>
                  <td className="px-6 py-4">{alumni.phone}</td>
                  <td className="px-6 py-4">{alumni.graduated_year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AlumniList;
