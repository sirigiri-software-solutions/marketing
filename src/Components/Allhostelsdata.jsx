import React, { useState, useEffect } from 'react';
import { ref, onValue } from "firebase/database";
import { database } from '../Firebase'; // Import the database instance
import './Allhostelsdata.css'; // Import CSS for styling

const Allhostelsdata = () => {
  const [hostels, setHostels] = useState([]);

  useEffect(() => {
    const fetchHostelData = () => {
      const hostelsRef = ref(database, 'hostels');
      onValue(hostelsRef, (snapshot) => {
        const data = snapshot.val();
        const hostelsList = data ? Object.values(data) : [];
        setHostels(hostelsList);
      });
    };

    fetchHostelData();
  }, []);

  return (
    <div className="all-hostels-container">
      <h1>All Hostels Data</h1>
      <table className="hostels-table">
        <thead>
          <tr>
            <th>Hostel Name</th>
            <th>Hostel Owner</th>
            <th>Hostel Location</th>
            <th>Boarding Type</th>
            <th>Marketing Person</th>
            <th>Hostel Images</th>
          </tr>
        </thead>
        <tbody>
          {hostels.length > 0 ? (
            hostels.map((hostel, index) => (
              <tr key={index}>
                <td>{hostel.hostelName}</td>
                <td>{hostel.hostelOwner}</td>
                <td>{hostel.hostelLocation}</td>
                <td>{hostel.boardingType}</td>
                <td>{hostel.marketingPerson}</td>
                <td>
                  {hostel.hostelImages ? (
                    <img src={hostel.hostelImages} alt={hostel.hostelName} className="hostel-image" />
                  ) : (
                    'No Image'
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Allhostelsdata;
