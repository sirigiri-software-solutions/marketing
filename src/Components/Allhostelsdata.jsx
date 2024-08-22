import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { database } from '../Firebase';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Allhostelsdata.css';

const Allhostelsdata = () => {
  const [hostels, setHostels] = useState([]);
  const [filteredHostels, setFilteredHostels] = useState([]);
  const [filters, setFilters] = useState({
    marketingPerson: '',
    boardingType: '',
    hostelLocation: '',
    boardingDate: null,
  });
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const applyFilters = () => {
      let filtered = hostels;
      console.log('Applying filters:', filters);
  
      if (filters.marketingPerson) {
        filtered = filtered.filter((hostel) =>
          hostel.marketingPerson.toLowerCase().includes(filters.marketingPerson.toLowerCase())
        );
      }
  
      if (filters.boardingType) {
        console.log('Filtering by boardingType:', filters.boardingType);
        filtered = filtered.filter((hostel) => {
          console.log('Hostel boardingType:', hostel.boardingType);
          return hostel.boardingType.toLowerCase() === filters.boardingType.toLowerCase();
        });
      }
  
      if (filters.hostelLocation) {
        filtered = filtered.filter((hostel) =>
          hostel.hostelLocation.toLowerCase().includes(filters.hostelLocation.toLowerCase())
        );
      }
  
      if (filters.boardingDate) {
        filtered = filtered.filter((hostel) => {
          const hostelDate = new Date(hostel.boardingDate);
          return hostelDate.toDateString() === filters.boardingDate.toDateString();
        });
      }
  
      setFilteredHostels(filtered);
    };
  
    applyFilters();
  }, [filters, hostels]);
  

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      boardingDate: date,
    }));
  };

  useEffect(() => {
    const applyFilters = () => {
      let filtered = hostels;
      console.log('Applying filters:', filters);
  
      if (filters.marketingPerson) {
        filtered = filtered.filter((hostel) =>
          hostel.marketingPerson.toLowerCase().includes(filters.marketingPerson.toLowerCase())
        );
      }
  
      if (filters.boardingType) {
        console.log('Filtering by boardingType:', filters.boardingType);
        filtered = filtered.filter((hostel) => {
          console.log('Hostel boardingType:', hostel.boardingType); 
          return hostel.boardingType === filters.boardingType;
        });
      }
  
      if (filters.hostelLocation) {
        filtered = filtered.filter((hostel) =>
          hostel.hostelLocation.toLowerCase().includes(filters.hostelLocation.toLowerCase())
        );
      }
  
      if (filters.boardingDate) {
        filtered = filtered.filter((hostel) => {
          const hostelDate = new Date(hostel.boardingDate);
          return hostelDate.toDateString() === filters.boardingDate.toDateString();
        });
      }
  
      setFilteredHostels(filtered);
    };
  
    applyFilters();
  }, [filters, hostels]);
  

  const handleLogout = () => {
   
    navigate('/');
  };

  return (
    <div className="all-hostels-container">
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
      <h1>All Hostels Data</h1>

      <div className="filter-section">
        <input
          type="text"
          placeholder="Marketing Person"
          name="marketingPerson"
          value={filters.marketingPerson}
          onChange={handleFilterChange}
        />
        <select
          name="boardingType"
          value={filters.boardingType}
          onChange={handleFilterChange}
        >
          <option value="">All Boarding Types</option>
          <option value="OnBoarding">OnBoarding</option>
          <option value="Visiting">Visiting</option>
        </select>
        <input
          type="text"
          placeholder="Hostel Location"
          name="hostelLocation"
          value={filters.hostelLocation}
          onChange={handleFilterChange}
        />
        <DatePicker
          selected={filters.boardingDate}
          onChange={handleDateChange}
          placeholderText="Select Boarding Date"
        />
      </div>

      {/* Table for larger screens */}
      <div className="hostels-table-wrapper">
        <table className="hostels-table">
          <thead>
            <tr>
              <th>Hostel Name</th>
              <th>Hostel Owner</th>
              <th>Hostel Location</th>
              <th>Contact Number</th>
              <th>Boarding Type</th>
              <th>Boarding Date</th>
              <th>Marketing Person</th>
              <th>Hostel Images</th>
            </tr>
          </thead>
          <tbody>
            {filteredHostels.length > 0 ? (
              filteredHostels.map((hostel, index) => (
                <tr key={index}>
                  <td>{hostel.hostelName}</td>
                  <td>{hostel.hostelOwner}</td>
                  <td>{hostel.hostelLocation}</td>
                  <td>{hostel.hostelOwnerContact}</td>
                  <td>{hostel.boardingType}</td>
                  <td>{hostel.boardingDate ? format(new Date(hostel.boardingDate), 'PPP') : 'No Date'}</td>
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
                <td colSpan="8">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Card layout for smaller screens */}
      <div className="hostels-cards">
        {filteredHostels.length > 0 ? (
          filteredHostels.map((hostel, index) => (
            <div className="hostel-card" key={index}>
              <h2>{hostel.hostelName}</h2>
              <p><strong>Owner:</strong> {hostel.hostelOwner}</p>
              <p><strong>Location:</strong> {hostel.hostelLocation}</p>
              <p><strong>Contact Number:</strong> {hostel.hostelOwnerContact}</p>
              <p><strong>Type:</strong> {hostel.boardingType}</p>
              <p><strong>Date:</strong> {hostel.boardingDate ? format(new Date(hostel.boardingDate), 'PPP') : 'No Date'}</p>
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
    </div>
  );
};

export default Allhostelsdata;
