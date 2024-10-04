


import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { getAuth, signOut } from 'firebase/auth';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { database } from '../Firebase';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const hostelsRef = ref(database, 'hostels');
    const unsubscribe = onValue(hostelsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setHostels(formattedData);
      } else {
        setHostels([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = hostels;

      if (filters.marketingPerson) {
        filtered = filtered.filter((hostel) =>
          hostel.marketingPerson.toLowerCase().includes(filters.marketingPerson.toLowerCase())
        );
      }

      if (filters.boardingType) {
        filtered = filtered.filter((hostel) =>
          hostel.boardingType.toLowerCase() === filters.boardingType.toLowerCase()
        );
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
  

  // const handleLogout = async () => {
  //   try {
  //     await signOut(auth); // Sign out from Firebase
  //     localStorage.removeItem('email'); // Clear local storage
  //     localStorage.removeItem('firstName'); 
  //     navigate("/"); // Redirect to login page
  //   } catch (error) {
  //     console.error("Error signing out: ", error);
  //   }
  // };


 

  const handleLogout = async () => {
    try {
      // Clear user data from local storage
      localStorage.removeItem('email');
      localStorage.removeItem('firstName');
      localStorage.removeItem('userRole');
      localStorage.setItem('isLoggedIn', 'false'); // Set login status to false
  
      // Optionally, update user login status in Firebase if necessary
      const email = localStorage.getItem("email"); // Get the email before clearing
      if (email) {
        const userRef = ref(database, "signupdata");
        const snapshot = await get(userRef);
        const userData = snapshot.val();
        const userKey = Object.keys(userData).find(
          (key) => userData[key].signupData.email === email
        );
  
        if (userKey) {
          await set(ref(database, `signupdata/${userKey}/signupData`), {
            ...userData[userKey].signupData,
            isLoggedIn: false, // Update login status
          });
        }
      }
  
      // Redirect to the login page or home page
      navigate("/"); // Adjust the route as needed
    } catch (error) {
      console.error("Error during logout: ", error);
    }
  };
  

  const getMapsUrl = (latitude, longitude) => {
    return latitude && longitude ? `https://www.google.com/maps?q=${latitude},${longitude}` : '#';
  };

  return (
    <div className="all-hostels-container-allhostelsdata">
      <div className="filter-section">
        <div className='uma-uma'>
          <div style={{ marginRight: '20px' }}><h3>Welcome Admin</h3></div>
          <div>
            <button onClick={handleLogout} className='logout-button' style={{ backgroundColor: 'blue', color: 'white', borderRadius: '8px', border: 'none', marginRight: '10px' }}>
              Logout
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'space-evenly' }}>
          <div style={{ flex: '1 1 45%', minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Marketing Person"
              name="marketingPerson"
              value={filters.marketingPerson}
              onChange={handleFilterChange}
              style={{ width: '100%', height: '40px', padding: '8px', boxSizing: 'border-box' }} // Adjust height and padding
            />
          </div>

          <div style={{ flex: '1 1 45%', minWidth: '200px' }}>
            <select
              name="boardingType"
              value={filters.boardingType}
              onChange={handleFilterChange}
              style={{ width: '100%', height: '40px', padding: '8px', boxSizing: 'border-box' }} // Adjust height and padding
            >
              <option value="">All Boarding Types</option>
              <option value="OnBoarding">OnBoarding</option>
              <option value="Visiting">Visiting</option>
            </select>
          </div>

          <div style={{ flex: '1 1 45%', minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Hostel Location"
              name="hostelLocation"
              value={filters.hostelLocation}
              onChange={handleFilterChange}
              style={{ width: '100%', height: '40px', padding: '8px', boxSizing: 'border-box' }} // Adjust height and padding
            />
          </div>

          <div style={{ flex: '1 1 45%', minWidth: '200px' }}>
            <DatePicker
              selected={filters.boardingDate}
              onChange={handleDateChange}
              placeholderText="Select Date"
              style={{ width: '100%', height: '40px', padding: '8px', boxSizing: 'border-box' }} // Adjust height and padding
            />
          </div>
        </div>


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
              <th>Location</th> {/* New column for the location button */}
            </tr>
          </thead>
          <tbody>
            {filteredHostels.length > 0 ? (
              filteredHostels.map((hostel) => (
                <tr key={hostel.id}>
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
                  <td>
                    <button
                      onClick={() => window.open(getMapsUrl(hostel.latitude, hostel.longitude), '_blank')}
                      disabled={!hostel.latitude || !hostel.longitude}
                      style={{
                        width: '100px',
                        height: '30px',
                        backgroundColor: hostel.latitude && hostel.longitude ? "#0056b3" : "gray",
                        color: "white",
                        border: 'none',
                        borderRadius: '5px',
                        cursor: hostel.latitude && hostel.longitude ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Open in Maps
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Card layout for smaller screens */}
      <div className="hostels-cards-admin">
        {filteredHostels.length > 0 ? (
          filteredHostels.map((hostel) => (
            <div className="hostel-card-admin" key={hostel.id}>
              <h2>{hostel.hostelName}</h2>
              <p><strong>Owner:</strong> {hostel.hostelOwner}</p>
              <p><strong>Location:</strong> {hostel.hostelLocation}</p>
              <button
                onClick={() => window.open(getMapsUrl(hostel.latitude, hostel.longitude), '_blank')}
                disabled={!hostel.latitude || !hostel.longitude}
                style={{
                  width: '30%',
                  height: '30px',
                  backgroundColor: hostel.latitude && hostel.longitude ? "lightblue" : "gray",
                  color: "#333",
                  borderWidth: '2px',
                  borderRadius: '5px',
                  cursor: hostel.latitude && hostel.longitude ? 'pointer' : 'not-allowed'
                }}
              >
                Open in Maps
              </button>
              <p><strong>Contact Number:</strong> {hostel.hostelOwnerContact}</p>
              <p><strong>Type:</strong> {hostel.boardingType}</p>
              <p><strong>Date:</strong> {hostel.boardingDate ? format(new Date(hostel.boardingDate), 'PPP') : 'No Date'}</p>
              <p><strong>Marketing Person:</strong> {hostel.marketingPerson}</p>
              <div className="hostel-image-container-admin">
                {hostel.hostelImages ? (
                  <img src={hostel.hostelImages} alt={hostel.hostelName} className="hostel-image-admin" />
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
