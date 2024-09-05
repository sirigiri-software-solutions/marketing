import React, { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { ref, set, push, onValue, update } from '../Firebase';
import { database } from '../Firebase';
import { useNavigate } from 'react-router-dom';
import './Dashboardpage.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { firestore, collection, addDoc } from '../Firebase';
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

 // Import necessary Firestore functions

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
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [nameFilter, setNameFilter] = useState('');
  



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


  function sortVisitsByDateTime(visits) {
    // Convert visits object to an array of visit objects
    const visitsArray = Object.keys(visits).map(key => visits[key]);

    // Sort visits array by visitDate and visitTime
    return visitsArray.sort((a, b) => {
      const dateTimeA = new Date(`${a.visitDate}T${a.visitTime}`);
      const dateTimeB = new Date(`${b.visitDate}T${b.visitTime}`);
      return dateTimeA - dateTimeB;
    });
  }

  const fetchHostelData = () => {
    const hostelsRef = ref(database, 'hostels');
    onValue(hostelsRef, (snapshot) => {
      const data = snapshot.val();
      console.log(data, "EntireHostel");
  
      let hostels = data ? Object.entries(data)
        .filter(([id, hostel]) => hostel.userEmail === userEmail)
        .map(([id, hostel]) => {
          // Extract and sort visits for this hostel
          const sortedVisits = hostel.visits ? sortVisitsByDateTime(hostel.visits) : [];
          return { id, ...hostel, visits: sortedVisits };
        }) : [];
  
      // Create a new variable to hold filtered hostels
      let filteredHostels = hostels;
  
      // Apply filters
      if (filter) {
        filteredHostels = filteredHostels.filter(hostel => hostel.boardingType === filter);
      }
      if (nameFilter) {
        filteredHostels = filteredHostels.filter(hostel => hostel.hostelName.toLowerCase().includes(nameFilter.toLowerCase()));
      }
      if (startDate) {
        filteredHostels = filteredHostels.filter(hostel => new Date(hostel.boardingDate) >= new Date(startDate));
      }
      if (endDate) {
        filteredHostels = filteredHostels.filter(hostel => new Date(hostel.boardingDate) <= new Date(endDate));
      }
  
      console.log(filteredHostels, "FilteredHostel");
      setHostelData(filteredHostels);
    });
  };
  


  const handleFetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Use the Google Maps Geocoding API to get address details
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_GOOGLE_API_KEY`);
            const data = await response.json();
  
            if (data.status === 'OK') {
              // Extract the address or name from the response
              const addressComponents = data.results[0].address_components;
              const formattedAddress = data.results[0].formatted_address;
  
              // Optionally, find more specific details from addressComponents if needed
              setFormData((prevData) => ({
                ...prevData,
                hostelLocation: formattedAddress, // Or any specific part of addressComponents
              }));
            } else {
              console.error("Error fetching location: ", data.status);
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
  const getMapsUrl = (location) => {
    return location ? `https://www.google.com/maps?q=${location}` : '#';
  };

  return (
    <div className="dashboard-container">
      <div className="sticky-header">
        <div className="welcome-message">
          <h3>Welcome, </h3>
          <h4>{userFirstName}</h4>
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
            <div><span className="close1" onClick={() => setShowForm(false)}>&times;</span></div>
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
          <div className='filter-item-filter'>
          <div className='filter-item'>
            <p>Select Category:</p>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: '150px', height: '30px' }}>
              <option value="">All</option>
              <option value="Onboarding">Onboarding</option>
              <option value="Visiting">Visiting</option>
            </select>
          </div>
          <div className='filter-item'>
            <p>Hostel Name:</p>
            <input
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Filter by hostel name" style={{ width: '150px', height: '23px',marginRight:'15px' ,borderRadius:'8px'}}
            />
          </div>
          </div>
          <div className='filter-container-filter'>
            <div className='filter-item'>
              <p>Start Date:</p>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date" style={{ width: '150px', height: '30px' ,marginRight:'15px'}}
              />
            </div>
            <div className='filter-item'>
              <p>End Date:</p>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date" style={{ width: '150px', height: '30px' }}
              />
            </div>
          </div>
          
        </div>
      </div> 

      <div className="hostel-list">
      {hostelData.length > 0 ? (
        hostelData.map((hostel, index) => (
          <div
            key={index}
            className="hostel-card"
            onClick={() => setSelectedHostel(hostel)}
          >
            <h2>{hostel.hostelName}</h2>
            <p>Owner: {hostel.hostelOwner}</p>
            <p>Contact: {hostel.hostelOwnerContact}</p>
            <p>Location: {hostel.hostelLocation}</p>
            <button
              onClick={() => window.open(getMapsUrl(hostel.hostelLocation), '_blank')}
              disabled={!hostel.hostelLocation}
            >
              Open in Google Maps
            </button>
            <p>Type: {hostel.boardingType}</p>
            <p>Time: {hostel.boardingTime}</p>
            <p>Date: {hostel.boardingDate}</p>
            <p>Marketing Person: {hostel.marketingPerson}</p>
            {hostel.hostelImages && <img src={hostel.hostelImages} alt="Hostel" className="hostel-image" height="100px" width="100px" />}
            {hostel.visits && hostel.visits.map((eachVisit, index) => (
              <React.Fragment key={index}>
                <h3>Visit : {index + 1}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
                    <h4 style={{ margin: 0, marginRight: '5px' }}>VisitDate:</h4>
                    <p style={{ margin: 0 }}>{eachVisit.visitDate}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
                    <h4 style={{ margin: 0, marginRight: '5px' }}>VisitTime:</h4>
                    <p style={{ margin: 0 }}>{eachVisit.visitTime}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, marginRight: '5px' }}>Updation:</h4>
                    <p style={{ margin: 0 }}>{eachVisit.comments}</p>
                  </div>
                </div>
              </React.Fragment>
            ))}
           
          </div>
        ))
      ) : (
        <p>No hostels found</p>
      )}
    </div>

      {selectedHostel && (
        <HostelDetailsPopup
          hostel={selectedHostel}
          onClose={() => setSelectedHostel(null)}
        />
      )}

    </div>
  );
};










const HostelDetailsPopup = ({ hostel, onClose }) => {
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [comments, setComments] = useState('');

  const handleRadioChange = (e) => {
    setShowAdditionalFields(e.target.checked);
  };

  const handleVisitDateChange = (e) => {
    setVisitDate(e.target.value);
  };

  const handleVisitTimeChange = (e) => {
    setVisitTime(e.target.value);
  };

  const handleCommentsChange = (e) => {
    setComments(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (visitDate && visitTime && comments) {
      try {
        // Create visit details object
        const visitDetails = {
          visitDate,
          visitTime,
          comments,
          createdAt: new Date().toISOString(),
        };

        // Reference to the Firestore document for the 
        await push(ref(database, `hostels/${hostel.id}/visits`), visitDetails)




        alert('Visit details submitted successfully!');
        onClose()

        // Reset the form but keep the popup open for another submission
        setVisitDate('');
        setVisitTime('');
        setComments('');
        setShowAdditionalFields(true); // Keep the additional fields open for the next input
      } catch (error) {
        console.error('Error submitting visit details:', error);
        alert('Failed to submit visit details. Please try again.');
      }
    } else {
      alert('Please fill in all the fields.');
    }
  };

  return (
    <div className="popup">
      <div className="popup-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{hostel.hostelName}</h2>
        <p>Owner: {hostel.hostelOwner}</p>
        <p>Contact: {hostel.hostelOwnerContact}</p>
        <p>Location: {hostel.hostelLocation}</p>
        <p>Type: {hostel.boardingType}</p>
        <p>Time: {hostel.boardingTime}</p>
        <p>Date: {hostel.boardingDate}</p>
        <p>Marketing Person: {hostel.marketingPerson}</p>
        {hostel.hostelImages && (
          <img src={hostel.hostelImages} alt="Hostel" className="popup-image" height="100px" width="100px" />
        )}

        <div className="visiting-hostel">
          <div>
            <input
              type="checkbox"
              id="visiting"
              checked={showAdditionalFields}
              onChange={handleRadioChange}
            />
            <label htmlFor="visiting">Again Visiting the Hostel</label>
          </div>

          {showAdditionalFields && (
            <div className="additional-fields">
              <label htmlFor="visit-date">Visit Date:</label>
              <input
                type="date"
                id="visit-date"
                value={visitDate}
                onChange={handleVisitDateChange}
              />
              <label htmlFor="visit-time">Visit Time:</label>
              <input
                type="time"
                id="visit-time"
                value={visitTime}
                onChange={handleVisitTimeChange}
              />
              <label htmlFor="comments">Comments:</label>
              <textarea
                id="comments"
                value={comments}
                onChange={handleCommentsChange}
                rows="4"
              />
              <button onClick={handleSubmit}>Submit</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
















export default Dashboardpage;