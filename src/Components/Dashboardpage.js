import React, { useState, useEffect } from 'react';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import './Dashboardpage.css';

const Dashboardpage = () => {
  const [formData, setFormData] = useState({
    hostelName: '',
    hostelOwner: '',
    hostelImages: null,
    hostelLocation: '',
    boardingType: '',
    marketingPerson: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername);

    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setFirstName(userDoc.data().firstName); // Assuming the first name is stored as 'firstName'
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'hostelImages') {
      setFormData((prevData) => ({
        ...prevData,
        [name]: files,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(formData);
    setShowModal(false); // Close the modal after submission
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className='dashboard'>
      <div className='dashboard-row'>
        <div>
          <button onClick={openModal} className='button-show'>Add Hostel</button>
          {username && <span className='welcome-message'>Welcome, {username}!</span>}
        </div>
        <div></div>
      </div>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="hostelName">Name of Hostel:</label>
                <input
                  type="text"
                  id="hostelName"
                  name="hostelName"
                  value={formData.hostelName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="hostelOwner">Hostel Owner:</label>
                <input
                  type="text"
                  id="hostelOwner"
                  name="hostelOwner"
                  value={formData.hostelOwner}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="hostelImages">Images of Hostel:</label>
                <input
                  type="file"
                  id="hostelImages"
                  name="hostelImages"
                  multiple
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="hostelLocation">Hostel Location:</label>
                <input
                  type="text"
                  id="hostelLocation"
                  name="hostelLocation"
                  value={formData.hostelLocation}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="boardingType">Type of Boarding:</label>
                <select
                  id="boardingType"
                  name="boardingType"
                  value={formData.boardingType}
                  onChange={handleChange}
                >
                  <option value="">Select...</option>
                  <option value="OnBoarding">OnBoarding</option>
                  <option value="Visiting">Visiting</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="marketingPerson">Marketing Person:</label>
                <input
                  type="text"
                  id="marketingPerson"
                  name="marketingPerson"
                  value={formData.marketingPerson}
                  onChange={handleChange}
                />
              </div>

              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboardpage;
