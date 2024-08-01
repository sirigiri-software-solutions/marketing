import React, { useState, useEffect } from 'react';
import { getAuth } from "firebase/auth";
import { ref, set, push, onValue } from "firebase/database";
import { database } from '../Firebase'; // Import the database instance
import './Dashboardpage.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome

const Dashboardpage = () => {
  const [formData, setFormData] = useState({
    hostelName: '',
    hostelOwner: '',
    hostelOwnerContact: '',
    hostelImages: null,
    hostelLocation: '',
    boardingType: '',
    boardingTime: '',
    boardingDate: '',
    marketingPerson: '', // This will be populated from local storage
  });

  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [hostelData, setHostelData] = useState([]);
  const [filter, setFilter] = useState(''); // State for filter
  const [startDate, setStartDate] = useState(''); // State for start date filter
  const [endDate, setEndDate] = useState(''); // State for end date filter
  const auth = getAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userFirstName, setUserFirstName] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    const storedFirstName = localStorage.getItem('firstName');
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
    if (storedFirstName) {
      setUserFirstName(storedFirstName);
      setFormData((prevData) => ({
        ...prevData,
        marketingPerson: storedFirstName, // Set marketing person from local storage
      }));
    }

    fetchHostelData();
  }, [userEmail, filter, startDate, endDate]); // Add startDate and endDate to dependency array

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prevData) => ({
        ...prevData,
        hostelImages: reader.result,
      }));
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { hostelName, hostelOwner, hostelOwnerContact, hostelImages, hostelLocation, boardingType, boardingTime, boardingDate, marketingPerson } = formData;
    let formErrors = {};

    if (!hostelName) formErrors.hostelName = "Hostel Name is required";
    if (!hostelOwner) formErrors.hostelOwner = "Hostel Owner is required";
    if (!hostelOwnerContact) formErrors.hostelOwnerContact = "Contact Number is required";
    if (!hostelLocation) formErrors.hostelLocation = "Hostel Location is required";
    if (!boardingType) formErrors.boardingType = "Boarding Type is required";
    if (!boardingTime) formErrors.boardingTime = "Boarding Time is required";
    if (!boardingDate) formErrors.boardingDate = "Boarding Date is required";
    if (!marketingPerson) formErrors.marketingPerson = "Marketing Person is required";

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const newHostelRef = push(ref(database, 'hostels'));
      await set(newHostelRef, {
        hostelName,
        hostelOwner,
        hostelOwnerContact,
        hostelImages, // Storing Base64 image string
        hostelLocation,
        boardingType,
        boardingTime,
        boardingDate,
        marketingPerson,
        userEmail,
      });
      setFormData({
        hostelName: '',
        hostelOwner: '',
        hostelOwnerContact: '',
        hostelImages: null,
        hostelLocation: '',
        boardingType: '',
        boardingTime: '',
        boardingDate: '',
        marketingPerson: userFirstName,
      });
      fetchHostelData(); // Refresh hostel data
      setShowForm(false);
    } catch (e) {
      console.error("Error adding document: ", e);
      setErrors({ general: "Error submitting form" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchHostelData = () => {
    const hostelsRef = ref(database, 'hostels');
    onValue(hostelsRef, (snapshot) => {
      const data = snapshot.val();
      let hostels = data ? Object.values(data).filter(hostel => hostel.userEmail === userEmail) : [];

      // Filter based on selected boarding type
      if (filter) {
        hostels = hostels.filter(hostel => hostel.boardingType === filter);
      }

      // Filter based on selected date range
      if (startDate) {
        hostels = hostels.filter(hostel => new Date(hostel.boardingDate) >= new Date(startDate));
      }
      if (endDate) {
        hostels = hostels.filter(hostel => new Date(hostel.boardingDate) <= new Date(endDate));
      }

      setHostelData(hostels);
    });
  };

  const handleFetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            if (data) {
              const location = data.display_name;
              setFormData((prevData) => ({
                ...prevData,
                hostelLocation: location,
              }));
            } else {
              console.error("Error fetching location: ", data);
              setErrors({ general: "Error fetching location" });
            }
          } catch (error) {
            console.error("Error fetching location: ", error);
            setErrors({ general: "Error fetching location" });
          }
        },
        (error) => {
          console.error("Error fetching location: ", error);
          setErrors({ general: "Error fetching location" });
        }
      );
    } else {
      setErrors({ general: "Geolocation is not supported by this browser." });
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome, {userFirstName}</h1>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Add Hostel"}
      </button>

      {/* Radio Buttons for Filtering */}
      <div className="filter-options">
        <label>
          <input
            type="radio"
            name="filter"
            value=""
            checked={filter === ''}
            onChange={(e) => setFilter(e.target.value)}
          />
          All
        </label>
        <label>
          <input
            type="radio"
            name="filter"
            value="OnBoarding"
            checked={filter === 'OnBoarding'}
            onChange={(e) => setFilter(e.target.value)}
          />
          Onboarding
        </label>
        <label>
          <input
            type="radio"
            name="filter"
            value="Visiting"
            checked={filter === 'Visiting'}
            onChange={(e) => setFilter(e.target.value)}
          />
          Visiting
        </label>
      </div>

      {/* Date Range Filter */}
      <div className="date-filter">
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      {showForm && (
        <form className="hostel-form" onSubmit={handleFormSubmit}>
          <input
            type="text"
            placeholder="Hostel Name"
            name="hostelName"
            value={formData.hostelName}
            onChange={handleInputChange}
          />
          {errors.hostelName && <div className="error-text">{errors.hostelName}</div>}
          
          <input
            type="text"
            placeholder="Hostel Owner"
            name="hostelOwner"
            value={formData.hostelOwner}
            onChange={handleInputChange}
          />
          {errors.hostelOwner && <div className="error-text">{errors.hostelOwner}</div>}

          <input
            type="text"
            placeholder="Contact Number"
            name="hostelOwnerContact"
            value={formData.hostelOwnerContact}
            onChange={handleInputChange}
          />
          {errors.hostelOwnerContact && <div className="error-text">{errors.hostelOwnerContact}</div>}

          <input
            type="file"
            accept="image/*"
            name="hostelImages"
            onChange={handleImageChange}
          />
          {errors.hostelImages && <div className="error-text">{errors.hostelImages}</div>}

          <div className="location-field">
            <input
              type="text"
              placeholder="Hostel Location"
              name="hostelLocation"
              value={formData.hostelLocation}
              onChange={handleInputChange}
            />
            <div><button type="button" onClick={handleFetchLocation}>
              <i className="fas fa-location-arrow"></i> {/* Location icon */}
            </button></div>
          </div>
          {errors.hostelLocation && <div className="error-text">{errors.hostelLocation}</div>}

          <select
            name="boardingType"
            value={formData.boardingType}
            onChange={handleInputChange}
          >
            <option value="">Select Boarding Type</option>
            <option value="OnBoarding">Onboarding</option>
            <option value="Visiting">Visiting</option>
          </select>
          {errors.boardingType && <div className="error-text">{errors.boardingType}</div>}

          <input
            type="time"
            placeholder="Boarding Time"
            name="boardingTime"
            value={formData.boardingTime}
            onChange={handleInputChange}
          />
          {errors.boardingTime && <div className="error-text">{errors.boardingTime}</div>}

          <input
            type="date"
            placeholder="Boarding Date"
            name="boardingDate"
            value={formData.boardingDate}
            onChange={handleInputChange}
          />
          {errors.boardingDate && <div className="error-text">{errors.boardingDate}</div>}

         

          {errors.general && <div className="error-text">{errors.general}</div>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}

      <div className="hostel-list">
        <h2>Your Hostels</h2>
        {hostelData.length > 0 ? (
          hostelData.map((hostel, index) => (
            <div key={index} className="hostel-item">
              <h3>{hostel.hostelName}</h3>
              <p>Owner: {hostel.hostelOwner}</p>
              <p>Contact: {hostel.hostelOwnerContact}</p>
              <p>Location: {hostel.hostelLocation}</p>
              <p>Boarding Type: {hostel.boardingType}</p>
              <p>Boarding Time: {hostel.boardingTime}</p>
              <p>Boarding Date: {hostel.boardingDate}</p>
              {hostel.hostelImages && <img src={hostel.hostelImages} alt="Hostel"  height="100px" width="100px"/>}
            </div>
          ))
        ) : (
          <p>No hostels found.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboardpage;