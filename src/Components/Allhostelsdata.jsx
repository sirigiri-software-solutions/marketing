import React, { useState, useEffect } from 'react';
import { ref, onValue } from "firebase/database";
import { database } from '../Firebase';
import './Allhostelsdata.css';

const Allhostelsdata = () => {
  const [hostels, setHostels] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchHostelData = () => {
      const hostelsRef = ref(database, 'hostels');
      onValue(hostelsRef, (snapshot) => {
        const data = snapshot.val();
        const hostelsList = data ? Object.values(data) : [];
        setHostels(hostelsList);
      });
    };

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    fetchHostelData();
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  return (
    <div className="all-hostels-container">
      <h1>All Hostels Data</h1>
      {isMobile ? (
        <div className="hostels-cards">
          {hostels.length > 0 ? (
            hostels.map((hostel, index) => (
              <div key={index} className="hostel-card">
                <h2>{hostel.hostelName}</h2>
                <p><strong>Owner:</strong> {hostel.hostelOwner}</p>
                <p><strong>Location:</strong> {hostel.hostelLocation}</p>
                <p><strong>Boarding Type:</strong> {hostel.boardingType}</p>
                <p><strong>Marketing Person:</strong> {hostel.marketingPerson}</p>
                <div className="hostel-image-container">
                  {hostel.hostelImages ? (
                    <img src={hostel.hostelImages} alt={hostel.hostelName} className="hostel-image" />
                  ) : (
                    'No Image'
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No data available</p>
          )}
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default Allhostelsdata;
