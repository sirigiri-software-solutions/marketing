import React, { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { ref, set, push, onValue } from 'firebase/database';
import { database } from '../Firebase';
import { useNavigate } from 'react-router-dom';
import './Dashboardpage.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

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
  const [filter, setFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const auth = getAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userFirstName, setUserFirstName] = useState('');
  const navigate = useNavigate();

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
        marketingPerson: storedFirstName,
      }));
    }

    fetchHostelData();
  }, [userEmail, filter, startDate, endDate]);

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
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prevData) => ({
          ...prevData,
          hostelImages: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { hostelName, hostelOwner, hostelOwnerContact, hostelImages, hostelLocation, boardingType, boardingTime, boardingDate, marketingPerson } = formData;
    let formErrors = {};
  
    if (!hostelName) formErrors.hostelName = "Hostel Name is required";
    if (!hostelOwner) formErrors.hostelOwner = "Hostel Owner is required";
    if (!hostelOwnerContact || !/^\d{10}$/.test(hostelOwnerContact)) {
      formErrors.hostelOwnerContact = "Contact Number must be exactly 10 digits";
    }

    if (!hostelImages) formErrors.hostelImages = "Hostel Image is required";

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
        hostelImages,
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
      fetchHostelData();
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

      if (filter) {
        hostels = hostels.filter(hostel => hostel.boardingType === filter);
      }

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('email');
      localStorage.removeItem('firstName');
      navigate("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sticky-header">
        <div className="welcome-message">
          <h1>Welcome, {userFirstName}</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="button-addhostel">
          Add Hostel
        </button>
        <button onClick={handleLogout} className="button-logout">
          Logout
        </button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowForm(false)}>&times;</span>
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
                type="tel"
                placeholder="Contact Number"
                name="hostelOwnerContact"
                value={formData.hostelOwnerContact}
                onChange={handleInputChange}
                maxLength="10"
                pattern="\d{10}"
              />

              {errors.hostelOwnerContact && <div className="error-text">{errors.hostelOwnerContact}</div>}

              <input
                type="file"
                id="imageUpload"
                name='hostelImages'
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              

              <div className="image-upload-section">
                <label htmlFor="imageUpload" className="image-upload-label">
                  <i className="fas fa-camera"></i> {/* Camera icon */}
                  Upload or Take a Photo
                </label>
                {formData.hostelImages && (
                  <img
                    src={formData.hostelImages}
                    alt="Hostel Preview"
                    className="image-preview"
                    height="100px"
                    width="100px"
                  />
                )}
                {errors.hostelImages && <div className="error-text">{errors.hostelImages}</div>}
              </div>

              <input
                type="text"
                placeholder="Hostel Location"
                name="hostelLocation"
                value={formData.hostelLocation}
                onChange={handleInputChange}
              />
              <button type="button" onClick={handleFetchLocation}>
                <i className="fas fa-location-arrow"></i> {/* Location icon */}
              </button>
              {errors.hostelLocation && <div className="error-text">{errors.hostelLocation}</div>}

              <select
                name="boardingType"
                value={formData.boardingType}
                onChange={handleInputChange}
              >
                <option value="">Select Boarding Type</option>
                <option value="Onboarding">Onboarding</option>
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

              <input
                type="text"
                placeholder="Marketing Person"
                name="marketingPerson"
                value={formData.marketingPerson}
                onChange={handleInputChange}
                disabled
              />

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
              {errors.general && <div className="error-text">{errors.general}</div>}
            </form>
          </div>
        </div>
      )}

      <div className="filter-container">
        <div className="filter-options">
          <div className='filter-item'>
            <p>Select Category Type:</p>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All</option>
              <option value="Onboarding">Onboarding</option>
              <option value="Visiting">Visiting</option>
            </select>
          </div>
          <div className='filter-item'>
            <p>Start Date:</p>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
          </div>
          <div className='filter-item'>
            <p>End Date:</p>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      <div className="hostel-list">
        {hostelData.length > 0 ? (
          hostelData.map((hostel, index) => (
            <div key={index} className="hostel-card">
              <h2>{hostel.hostelName}</h2>
              <p>Owner: {hostel.hostelOwner}</p>
              <p>Contact: {hostel.hostelOwnerContact}</p>
              <p>Location: {hostel.hostelLocation}</p>
              <p>Type: {hostel.boardingType}</p>
              <p>Time: {hostel.boardingTime}</p>
              <p>Date: {hostel.boardingDate}</p>
              <p>Marketing Person: {hostel.marketingPerson}</p>
              {hostel.hostelImages && <img src={hostel.hostelImages} alt="Hostel" className="hostel-image" height="100px" width="100px" />}
            </div>
          ))
        ) : (
          <p>No hostels found</p>
        )}
      </div>
    </div>
  );
};

export default Dashboardpage;
