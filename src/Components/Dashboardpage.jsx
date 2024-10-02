import React, { useState, useEffect, useCallback } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { ref, set, push, onValue, update } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; // Import Firebase storage functions
import { database } from '../Firebase';
import { useNavigate, useLocation } from 'react-router-dom';
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
    latitude: '', // New field
    longitude: '', // New field
  });
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [hostelData, setHostelData] = useState([]);
  const [filter, setFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userFirstName, setUserFirstName] = useState('');
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [nameFilter, setNameFilter] = useState('');
  const [exactLocation, setExactLocation] = useState({
    latitude: '',
    longitude: ''
  });
  const [uploadProgress, setUploadProgress] = useState(null); // State for upload progress

  const auth = getAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", file);

      // Reset any previous errors related to images
      setErrors((prevErrors) => ({
        ...prevErrors,
        hostelImages: '',
      }));

      const storage = getStorage();
      const storageReference = storageRef(storage, `images/${file.name}`);
      const uploadTask = uploadBytesResumable(storageReference, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          setErrors({ hostelImages: `Error uploading image: ${error.message}` });
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("File available at:", downloadURL);
          setFormData((prevData) => ({
            ...prevData,
            hostelImages: downloadURL,
          }));
          setUploadProgress(null);
        }
      );
    } else {
      console.warn("No file selected");
    }
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const { hostelName, hostelOwner, hostelOwnerContact, hostelImages, hostelLocation, boardingType, boardingTime, boardingDate, marketingPerson, latitude, longitude } = formData;

    let formErrors = {};

    // Validation checks
    if (!hostelName) formErrors.hostelName = "Hostel Name is required";
    if (!hostelOwner) formErrors.hostelOwner = "Hostel Owner is required";
    if (!hostelOwnerContact || !/^\d{10}$/.test(hostelOwnerContact)) {
      formErrors.hostelOwnerContact = "Contact Number must be exactly 10 digits";
    }
    if (!hostelImages) formErrors.hostelImages = "Hostel Image is required"; // Ensure this condition is checked properly
    if (!hostelLocation) formErrors.hostelLocation = "Hostel Location is required";
    if (!boardingType) formErrors.boardingType = "Boarding Type is required";
    if (!boardingTime) formErrors.boardingTime = "Boarding Time is required";
    if (!boardingDate) formErrors.boardingDate = "Boarding Date is required";
    if (!marketingPerson) formErrors.marketingPerson = "Marketing Person is required";
    if (!latitude) formErrors.latitude = "Latitude is required";
    if (!longitude) formErrors.longitude = "Longitude is required";

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
        latitude,
        longitude,
      });

      // Reset form after submission
      resetForm();
      fetchHostelData();
      setShowForm(false);
    } catch (e) {
      console.error("Error adding document: ", e);
      setErrors({ general: "Error submitting form" });
    } finally {
      setIsSubmitting(false);
    }
  };


  const resetForm = () => {
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
      latitude: '',
      longitude: '',
    });
    setErrors({});
  };

  useEffect(() => {
    fetchHostelData();
  }, [userEmail, filter, startDate, endDate, nameFilter]); // Added nameFilter



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
          const sortedVisits = hostel.visits ? sortVisitsByDateTime(hostel.visits) : [];
          return { id, ...hostel, visits: sortedVisits };
        }) : [];

      // Apply filters
      let filteredHostels = hostels;

      if (filter) {
        filteredHostels = filteredHostels.filter(hostel => hostel.boardingType === filter);
      }
      if (nameFilter) {
        filteredHostels = filteredHostels.filter(hostel =>
          hostel.hostelName.toLowerCase().includes(nameFilter.toLowerCase())
        );
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



  const handleFetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log(latitude, longitude, "exact")
          setFormData((prevData) => ({
            ...prevData,
            latitude: latitude.toFixed(6),  // Format latitude
            longitude: longitude.toFixed(6) // Format longitude
          }));
          setExactLocation({
            latitude: latitude,
            longitude: longitude
          })

        },
        (error) => {
          console.error("Error fetching geolocation: ", error);
          setErrors({ general: "Error fetching geolocation: " + error.message });
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
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




  const getMapsUrl = (latitude, longitude) => {
    return latitude && longitude ? `https://www.google.com/maps?q=${latitude},${longitude}` : '#';
  };

  const openForm = () => {
    resetForm();
    setShowForm(true);
    window.history.pushState(null, null, location.pathname); // Prevent back navigation
  };

  const closeForm = () => {
    setShowForm(false);
  };

  const handlePopState = useCallback((event) => {
    if (showForm) {
      closeForm(); // Close form on back navigation
    }
  }, [showForm]);

  useEffect(() => {
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [handlePopState]);




  const openPopup = (hostel) => {
    setSelectedHostel(hostel);
    window.history.pushState({ popupOpen: true }, '');
    console.log('Popup opened for hostel:', hostel.hostelName); // Log when popup opensss
  };


  const closePopup = () => {
    console.log('Popup closed'); // Log when popup closes
    setSelectedHostel(null);
    window.history.pushState({ popupOpen: true }, '');

  };

  useEffect(() => {
    const handlePopState = (event) => {

      console.log('Popstate event triggered', event.state); // Log the popstate event

      if (event.state && event.state.popupOpen) {
        closePopup();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);


  return (
    <div className="dashboard-container">
      <div className="sticky-header">
        <div className="welcome-message">
          <h4>Welcome, </h4>
          <h4 >{userFirstName}</h4>
        </div>
        <button onClick={openForm} className="add-hostel-btn">Add Hostel</button>

        <button onClick={handleLogout} className="button-logout">
          Logout
        </button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <form className="hostel-form" onSubmit={handleFormSubmit}>
              <input
                type="text"
                placeholder="Hostel Name"
                style={{ width: '100%', height: '22px', marginBottom: '10px' }}
                name="hostelName"
                value={formData.hostelName}
                onChange={handleInputChange}
              />
              {errors.hostelName && <div className="error-text">{errors.hostelName}</div>}

              <input
                type="text"
                placeholder="Hostel Owner"
                style={{ width: '100%', height: '22px', marginBottom: '10px' }}
                name="hostelOwner"
                value={formData.hostelOwner}
                onChange={handleInputChange}
              />
              {errors.hostelOwner && <div className="error-text">{errors.hostelOwner}</div>}

              <input
                type="tel"
                placeholder="Contact Number"
                style={{ width: '100%', height: '22px', marginBottom: '10px' }}
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
                accept=".png,.jpeg,.jpg"
                onChange={handleImageChange}
                style={{ marginBottom: '10px' }}
              />
              {errors.hostelImages && <div className="error-text">{errors.hostelImages}</div>}

              <input
                type="text"
                placeholder="Hostel Location"
                style={{ width: '100%', height: '22px', marginBottom: '10px' }}
                name="hostelLocation"
                value={formData.hostelLocation}
                onChange={handleInputChange}
              />
              {errors.hostelLocation && <div className="error-text">{errors.hostelLocation}</div>}

              <button
                type="button"
                onClick={handleFetchLocation}
                style={{ width: '100%', height: '22px', marginBottom: '10px' }}
              >
                <i className="fas fa-location-arrow"></i> {/* Location icon */}
              </button>

              <input
                type="text"
                placeholder="Latitude"
                style={{ width: '100%', height: '22px', marginBottom: '10px' }}
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                readOnly
              />

              <input
                type="text"
                placeholder="Longitude"
                style={{ width: '100%', height: '22px', marginBottom: '10px' }}
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                readOnly
              />

              <select
                name="boardingType"
                value={formData.boardingType}
                onChange={handleInputChange}
                style={{ width: '100%', height: '22px', marginBottom: '10px' }}
              >
                <option value="">Select Boarding Type</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Visiting">Visiting</option>
              </select>
              {errors.boardingType && <div className="error-text">{errors.boardingType}</div>}

              <input
                type="time"
                placeholder="Boarding Time"
                style={{ width: '100%', height: '22px', marginBottom: '10px' }}
                name="boardingTime"
                value={formData.boardingTime}
                onChange={handleInputChange}
              />
              {errors.boardingTime && <div className="error-text">{errors.boardingTime}</div>}

              <input
                type="date"
                placeholder="Boarding Date"
                style={{ width: '100%', height: '22px', marginBottom: '10px' }}
                name="boardingDate"
                value={formData.boardingDate}
                onChange={handleInputChange}
              />
              {errors.boardingDate && <div className="error-text">{errors.boardingDate}</div>}

              <input
                type="text"
                placeholder="Marketing Person"
                style={{ width: '100%', height: '22px', marginBottom: '10px' }}
                name="marketingPerson"
                value={formData.marketingPerson}
                onChange={handleInputChange}
                disabled
              />

              <div className="button-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100px',
                    height: '30px',
                    backgroundColor: "#0056b3",
                    color: "white",
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
                <button
                  className="close1"
                  onClick={closeForm}
                  style={{
                    width: '100px',
                    height: '30px',
                    backgroundColor: "green",
                    color: "white",
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginLeft: '10px'
                  }}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}




      <div className="filter-container">
        <div className="filter-options">
          <div className='filter-item-filter'>
            <div className='filter-item'>
              <p>Select Category:</p>
              <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: '100px', height: '25px' }}>
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
                placeholder="Search for Hostel"
                style={{ width: '100px', height: '23px', marginRight: '15px', borderRadius: '8px' }}
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
                placeholder="Start Date" style={{ width: '100px', height: '25px', marginRight: '15px' }}
              />
            </div>
            <div className='filter-item'>
              <p>End Date:</p>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date" style={{ width: '100px', height: '25px' }}
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
              <p>Owner Name: {hostel.hostelOwner}</p>
              <p>Contact Number: {hostel.hostelOwnerContact}</p>
              <p>Location: {hostel.hostelLocation}</p>

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
          onClose={closePopup}
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
  const [typeOfBoarding, setTypeOfBoarding] = useState(hostel.boardingType || '');
  const location = useLocation();

  const handleBoardingTypeChange = (e) => {
    const newBoardingType = e.target.value;

    // Confirm with user before changing boarding type
    const confirmChange = window.confirm('Are you sure you want to switch to Onboarding?');
    if (confirmChange) {
      setTypeOfBoarding(newBoardingType);

      // Update Firebase with the new boarding type
      update(ref(database, `hostels/${hostel.id}`), { boardingType: newBoardingType })
        .then(() => console.log('Boarding type updated successfully'))
        .catch((error) => console.error('Error updating boarding type:', error));
    }
  };

  const handleVisitDateChange = (e) => setVisitDate(e.target.value);
  const handleVisitTimeChange = (e) => setVisitTime(e.target.value);
  const handleCommentsChange = (e) => setComments(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (visitDate && visitTime && comments) {
      try {
        const visitDetails = {
          visitDate,
          visitTime,
          comments,
          createdAt: new Date().toISOString(),
        };

        // Reference to the Firestore document for the hostel
        await push(ref(database, `hostels/${hostel.id}/visits`), visitDetails);

        alert('Visit details submitted successfully!');
        onClose(); // Close the popup

        // Reset fields
        setVisitDate('');
        setVisitTime('');
        setComments('');
        setShowAdditionalFields(false);
      } catch (error) {
        console.error('Error submitting visit details:', error);
        alert('Failed to submit visit details. Please try again.');
      }
    } else {
      alert('Please fill in all the fields.');
    }
  };

  useEffect(() => {
    // Function to handle popstate event
    const handlePopState = () => {
      onClose(); // Close the popup
    };

    window.history.pushState(null, null, location.pathname); // Push current state to prevent back navigation
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname, onClose]);

  return (
    <div className="popup">
      <div className="popup-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{hostel.hostelName}</h2>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <h4 style={{ margin: 0, marginRight: '8px' }}>Owner Name:</h4>
            <p style={{ margin: 0 }}>{hostel.hostelOwner}</p>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <h4 style={{ margin: 0, marginRight: '8px' }}>Contact Number:</h4>
            <p style={{ margin: 0 }}>{hostel.hostelOwnerContact}</p>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <h4 style={{ margin: 0, marginRight: '8px' }}>Location:</h4>
            <p style={{ margin: 0 }}>{hostel.hostelLocation}</p>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <h4 style={{ margin: 0, marginRight: '8px' }}>Type of Boarding: </h4>
            <p style={{ margin: 0 }}>{typeOfBoarding}</p>
          </div>
        </div>

        {typeOfBoarding === 'Visiting' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type='radio'
                id='switch-to-onboarding'
                name='boardingType'
                value='Onboarding'
                checked={typeOfBoarding === 'Onboarding'}
                onChange={handleBoardingTypeChange}
                style={{ marginRight: '8px', marginBottom: '10px' }}
              />
              <p style={{ margin: 0 }}>Switch to Onboarding</p>
            </div>
          </div>
        )}

        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <h4 style={{ margin: 0, marginRight: '8px' }}>Time: </h4>
            <p style={{ margin: 0 }}>{hostel.boardingTime}</p>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <h4 style={{ margin: 0, marginRight: '8px' }}>Date: </h4>
            <p style={{ margin: 0 }}>{hostel.boardingDate}</p>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <h4 style={{ margin: 0, marginRight: '8px' }}>Marketing Person: </h4>
            <p style={{ margin: 0 }}>{hostel.marketingPerson}</p>
          </div>
        </div>

        {hostel.hostelImages && (
          <img src={hostel.hostelImages} alt="Hostel" className="popup-image" height="100px" width="100px" />
        )}

        <div className="visiting-hostel">
          <div>
            <input
              type="checkbox"
              id="visiting"
              checked={showAdditionalFields}
              onChange={(e) => setShowAdditionalFields(e.target.checked)}
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
              <button
                onClick={handleSubmit}
                className='check-submit'
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                Submit
              </button>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};






















export default Dashboardpage;