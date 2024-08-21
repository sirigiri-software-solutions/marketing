// import React, { useState, useEffect } from 'react';
// import { ref, onValue } from 'firebase/database';
// import { format } from 'date-fns';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { database } from '../Firebase';
// import { useNavigate } from 'react-router-dom';
// import './Mainadmin.css';

// const Mainadmin = () => {
//   const [hostels, setHostels] = useState([]);
//   const [filteredHostels, setFilteredHostels] = useState([]);
//   const [filters, setFilters] = useState({
//     marketingPerson: '',
//     boardingType: '',
//     hostelLocation: '',
//     boardingDate: null,
//   });
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedHostel, setSelectedHostel] = useState(null);
//   const [verification, setVerification] = useState({
//     hostelName: '',
//     hostelOwner: '',
//     hostelLocation: '',
//     contactNumber: '',
//     boardingType: '',
//     boardingDate: '',
//     marketingPerson: '',
//     hostelImages: '',
//   });

//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchHostelData = () => {
//       const hostelsRef = ref(database, 'hostels');
//       onValue(hostelsRef, (snapshot) => {
//         const data = snapshot.val();
//         const hostelsList = data ? Object.values(data) : [];
//         setHostels(hostelsList);
//         setFilteredHostels(hostelsList);
//       });
//     };

//     fetchHostelData();
//   }, []);

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters((prevFilters) => ({
//       ...prevFilters,
//       [name]: value,
//     }));
//   };

//   const handleDateChange = (date) => {
//     setFilters((prevFilters) => ({
//       ...prevFilters,
//       boardingDate: date,
//     }));
//   };

//   useEffect(() => {
//     const applyFilters = () => {
//       let filtered = hostels;
//       if (filters.marketingPerson) {
//         filtered = filtered.filter((hostel) =>
//           hostel.marketingPerson.toLowerCase().includes(filters.marketingPerson.toLowerCase())
//         );
//       }
//       if (filters.boardingType) {
//         filtered = filtered.filter((hostel) => hostel.boardingType === filters.boardingType);
//       }
//       if (filters.hostelLocation) {
//         filtered = filtered.filter((hostel) =>
//           hostel.hostelLocation.toLowerCase().includes(filters.hostelLocation.toLowerCase())
//         );
//       }
//       if (filters.boardingDate) {
//         filtered = filtered.filter((hostel) => {
//           const hostelDate = new Date(hostel.boardingDate);
//           return hostelDate.toDateString() === filters.boardingDate.toDateString();
//         });
//       }
//       setFilteredHostels(filtered);
//     };

//     applyFilters();
//   }, [filters, hostels]);

//   const handleLogout = () => {
//     navigate('/');
//   };

//   const openModal = (hostel) => {
//     setSelectedHostel(hostel);
//     setVerification({
//       hostelName: '',
//       hostelOwner: '',
//       hostelLocation: '',
//       contactNumber: '',
//       boardingType: '',
//       boardingDate: '',
//       marketingPerson: '',
//       hostelImages: '',
//     });
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setSelectedHostel(null);
//   };

//   const handleRadioChange = (section, value) => {
//     setVerification(prev => ({
//       ...prev,
//       [section]: value,
//     }));
//   };

//   return (
//     <div className="all-hostels-container">
//       <button className="logout-button" onClick={handleLogout}>
//         Logout
//       </button>
//       <h1>All Hostels Data</h1>

//       <div className="filter-section">
//         <input
//           type="text"
//           placeholder="Marketing Person"
//           name="marketingPerson"
//           value={filters.marketingPerson}
//           onChange={handleFilterChange}
//         />
//         <select
//           name="boardingType"
//           value={filters.boardingType}
//           onChange={handleFilterChange}
//         >
//           <option value="">All Boarding Types</option>
//           <option value="OnBoarding">OnBoarding</option>
//           <option value="Visiting">Visiting</option>
//         </select>
//         <input
//           type="text"
//           placeholder="Hostel Location"
//           name="hostelLocation"
//           value={filters.hostelLocation}
//           onChange={handleFilterChange}
//         />
//         <DatePicker
//           selected={filters.boardingDate}
//           onChange={handleDateChange}
//           placeholderText="Select Boarding Date"
//         />
//       </div>

//       {/* Table for larger screens */}
//       <div className="hostels-table-wrapper">
//         <table className="hostels-table">
//           <thead>
//             <tr>
//               <th>Hostel Name</th>
//               <th>Hostel Owner</th>
//               <th>Hostel Location</th>
//               <th>Contact Number</th>
//               <th>Boarding Type</th>
//               <th>Boarding Date</th>
//               <th>Marketing Person</th>
//               <th>Hostel Images</th>
//               <th>Verification</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredHostels.length > 0 ? (
//               filteredHostels.map((hostel, index) => (
//                 <tr key={index}>
//                   <td>{hostel.hostelName}</td>
//                   <td>{hostel.hostelOwner}</td>
//                   <td>{hostel.hostelLocation}</td>
//                   <td>{hostel.hostelOwnerContact}</td>
//                   <td>{hostel.boardingType}</td>
//                   <td>{hostel.boardingDate ? format(new Date(hostel.boardingDate), 'PPP') : 'No Date'}</td>
//                   <td>{hostel.marketingPerson}</td>
//                   <td>
//                     {hostel.hostelImages ? (
//                       <img src={hostel.hostelImages} alt={hostel.hostelName} className="hostel-image" />
//                     ) : (
//                       'No Image'
//                     )}
//                   </td>
//                   <td>
//                     <button onClick={() => openModal(hostel)} className="verification-button">
//                       For Verification
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="9">No data available</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Card layout for smaller screens */}
//       <div className="hostels-cards">
//         {filteredHostels.length > 0 ? (
//           filteredHostels.map((hostel, index) => (
//             <div className="hostel-card" key={index}>
//               <h2>{hostel.hostelName}</h2>
//               <p><strong>Owner:</strong> {hostel.hostelOwner}</p>
//               <p><strong>Location:</strong> {hostel.hostelLocation}</p>
//               <p><strong>Contact Number:</strong> {hostel.hostelOwnerContact}</p>
//               <p><strong>Type:</strong> {hostel.boardingType}</p>
//               <p><strong>Date:</strong> {hostel.boardingDate ? format(new Date(hostel.boardingDate), 'PPP') : 'No Date'}</p>
//               <p><strong>Marketing Person:</strong> {hostel.marketingPerson}</p>
//               <div className="hostel-image-container">
//                 {hostel.hostelImages ? (
//                   <img src={hostel.hostelImages} alt={hostel.hostelName} className="hostel-image" height="100px" width="100px"/>
//                 ) : (
//                   'No Image'
//                 )}
//               </div>
//               <div><button onClick={() => openModal(hostel)} className="verification-button">
//                       For Verification
//                     </button></div>
//             </div>
//           ))
//         ) : (
//           <p>No data available</p>
//         )}
//       </div>

//       {/* Modal for verification */}
//       {isModalOpen && selectedHostel && (
//         <div className="modal-overlay">
//           <div className="modal-content">
//             <button className="close-button" onClick={closeModal}>Close</button>
//             <h2>{selectedHostel.hostelName}</h2>
//             <div className="modal-section">
//               <p><strong>Hostel Name:</strong> {selectedHostel.hostelName}</p>
//               <label>
//                 <input
//                   type="radio"
//                   name="hostelName"
//                   value="yes"
//                   checked={verification.hostelName === 'yes'}
//                   onChange={() => handleRadioChange('hostelName', 'yes')}
//                 />
//                 Yes
//               </label>
//               <label>
//                 <input
//                   type="radio"
//                   name="hostelName"
//                   value="no"
//                   checked={verification.hostelOwner === 'no'}
//                   onChange={() => handleRadioChange('hostelName', 'no')}
//                 />
//                 No
//               </label>
//             </div>
//             <div className="modal-section">
//               <p><strong>Owner:</strong> {selectedHostel.hostelOwner}</p>
//               <label>
//                 <input
//                   type="radio"
//                   name="hostelOwner"
//                   value="yes"
//                   checked={verification.hostelOwner === 'yes'}
//                   onChange={() => handleRadioChange('hostelOwner', 'yes')}
//                 />
//                 Yes
//               </label>
//               <label>
//                 <input
//                   type="radio"
//                   name="hostelOwner"
//                   value="no"
//                   checked={verification.hostelOwner === 'no'}
//                   onChange={() => handleRadioChange('hostelOwner', 'no')}
//                 />
//                 No
//               </label>
//             </div>

//             <div className="modal-section">
//               <p><strong>Location:</strong> {selectedHostel.hostelLocation}</p>
//               <label>
//                 <input
//                   type="radio"
//                   name="hostelLocation"
//                   value="yes"
//                   checked={verification.hostelLocation === 'yes'}
//                   onChange={() => handleRadioChange('hostelLocation', 'yes')}
//                 />
//                 Yes
//               </label>
//               <label>
//                 <input
//                   type="radio"
//                   name="hostelLocation"
//                   value="no"
//                   checked={verification.hostelLocation === 'no'}
//                   onChange={() => handleRadioChange('hostelLocation', 'no')}
//                 />
//                 No
//               </label>
//             </div>

//             <div className="modal-section">
//               <p><strong>Contact Number:</strong> {selectedHostel.hostelOwnerContact}</p>
//               <label>
//                 <input
//                   type="radio"
//                   name="contactNumber"
//                   value="yes"
//                   checked={verification.contactNumber === 'yes'}
//                   onChange={() => handleRadioChange('contactNumber', 'yes')}
//                 />
//                 Yes
//               </label>
//               <label>
//                 <input
//                   type="radio"
//                   name="contactNumber"
//                   value="no"
//                   checked={verification.contactNumber === 'no'}
//                   onChange={() => handleRadioChange('contactNumber', 'no')}
//                 />
//                 No
//               </label>
//             </div>

//             <div className="modal-section">
//               <p><strong>Boarding Type:</strong> {selectedHostel.boardingType}</p>
//               <label>
//                 <input
//                   type="radio"
//                   name="boardingType"
//                   value="yes"
//                   checked={verification.boardingType === 'yes'}
//                   onChange={() => handleRadioChange('boardingType', 'yes')}
//                 />
//                 Yes
//               </label>
//               <label>
//                 <input
//                   type="radio"
//                   name="boardingType"
//                   value="no"
//                   checked={verification.boardingType === 'no'}
//                   onChange={() => handleRadioChange('boardingType', 'no')}
//                 />
//                 No
//               </label>
//             </div>

//             <div className="modal-section">
//               <p><strong>Boarding Date:</strong> {selectedHostel.boardingDate ? format(new Date(selectedHostel.boardingDate), 'PPP') : 'No Date'}</p>
//               <label>
//                 <input
//                   type="radio"
//                   name="boardingDate"
//                   value="yes"
//                   checked={verification.boardingDate === 'yes'}
//                   onChange={() => handleRadioChange('boardingDate', 'yes')}
//                 />
//                 Yes
//               </label>
//               <label>
//                 <input
//                   type="radio"
//                   name="boardingDate"
//                   value="no"
//                   checked={verification.boardingDate === 'no'}
//                   onChange={() => handleRadioChange('boardingDate', 'no')}
//                 />
//                 No
//               </label>
//             </div>

//             <div className="modal-section">
//               <p><strong>Marketing Person:</strong> {selectedHostel.marketingPerson}</p>
//               <label>
//                 <input
//                   type="radio"
//                   name="marketingPerson"
//                   value="yes"
//                   checked={verification.marketingPerson === 'yes'}
//                   onChange={() => handleRadioChange('marketingPerson', 'yes')}
//                 />
//                 Yes
//               </label>
//               <label>
//                 <input
//                   type="radio"
//                   name="marketingPerson"
//                   value="no"
//                   checked={verification.marketingPerson === 'no'}
//                   onChange={() => handleRadioChange('marketingPerson', 'no')}
//                 />
//                 No
//               </label>
//             </div>

//             <div className="modal-section">
//               <p><strong>Hostel Images:</strong></p>
//               {selectedHostel.hostelImages ? (
//                 <img src={selectedHostel.hostelImages} alt={selectedHostel.hostelName} className="hostel-image" />
//               ) : (
//                 'No Image'
//               )}
//               <label>
//                 <input
//                   type="radio"
//                   name="hostelImages"
//                   value="yes"
//                   checked={verification.hostelImages === 'yes'}
//                   onChange={() => handleRadioChange('hostelImages', 'yes')}
//                 />
//                 Yes
//               </label>
//               <label>
//                 <input
//                   type="radio"
//                   name="hostelImages"
//                   value="no"
//                   checked={verification.hostelImages === 'no'}
//                   onChange={() => handleRadioChange('hostelImages', 'no')}
//                 />
//                 No
//               </label>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Mainadmin;






















import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { database } from '../Firebase';
import { useNavigate } from 'react-router-dom';
import './Mainadmin.css';

const Mainadmin = () => {
  const [hostels, setHostels] = useState([]);
  const [filteredHostels, setFilteredHostels] = useState([]);
  const [filters, setFilters] = useState({
    marketingPerson: '',
    boardingType: '',
    hostelLocation: '',
    boardingDate: null,
    verificationStatus: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [verification, setVerification] = useState({
    hostelName: '',
    hostelOwner: '',
    hostelLocation: '',
    contactNumber: '',
    boardingType: '',
    boardingDate: '',
    marketingPerson: '',
    hostelImages: '',
  });
  const [reason, setReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [isEditable, setIsEditable] = useState(true);
  const [validationErrors, setValidationErrors] = useState({
    hostelName: false,
    hostelOwner: false,
    hostelLocation: false,
    contactNumber: false,
    boardingType: false,
    boardingDate: false,
    marketingPerson: false,
    hostelImages: false,
  });
  


  const navigate = useNavigate();

  useEffect(() => {
    const fetchHostelData = () => {
      const hostelsRef = ref(database, 'hostels');
      onValue(hostelsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const hostelsList = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
  
          setHostels(hostelsList);
          setFilteredHostels(hostelsList);
        } else {
          setHostels([]);
          setFilteredHostels([]);
        }
      });
    };
  
    fetchHostelData();
  }, []);
  

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const requiredFields = [
    'hostelName',
    'hostelOwner',
    'hostelLocation',
    'contactNumber',
    'boardingType',
    'boardingDate',
    'marketingPerson',
    'hostelImages'
  ];
  
  
  

  const handleDateChange = (date) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      boardingDate: date,
    }));
  };

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
  
      if (filters.verificationStatus) {
        filtered = filtered.filter((hostel) => {
          // Ensure that `verificationStatus` is in lowercase to match the filter
          const status = (hostel.verification?.verificationStatus || 'Incompleted').toLowerCase();
          return status === filters.verificationStatus.toLowerCase();
        });
      }
  
      setFilteredHostels(filtered);
    };
  
    applyFilters();
  }, [filters, hostels]);
  


  const handleLogout = () => {
    navigate('/');
  };

  const openModal = (hostel) => {
    console.log(hostel)
    setSelectedHostel(hostel);
    if (hostel.verification && hostel.verification.submitted) {
      setVerification({
        hostelName: hostel.verification.hostelName || '',
        hostelOwner: hostel.verification.hostelOwner || '',
        hostelLocation: hostel.verification.hostelLocation || '',
        contactNumber: hostel.verification.contactNumber || '',
        boardingType: hostel.verification.boardingType || '',
        boardingDate: hostel.verification.boardingDate || '',
        marketingPerson: hostel.verification.marketingPerson || '',
        hostelImages: hostel.verification.hostelImages || '',
      });
      setShowReasonInput(true);
      setReason(hostel.verification.reason || '');
      setIsEditable(hostel.verification.verificationStatus !== 'Incompleted');
    } else {
      setVerification({
        hostelName: '',
        hostelOwner: '',
        hostelLocation: '',
        contactNumber: '',
        boardingType: '',
        boardingDate: '',
        marketingPerson: '',
        hostelImages: '',
      });
      setReason('');
      setShowReasonInput(false);
      setIsEditable(true);
    }
  
    setIsModalOpen(true);
  };
  

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedHostel(null);
    setValidationErrors({
      hostelName: false,
      hostelOwner: false,
      hostelLocation: false,
      contactNumber: false,
      boardingType: false,
      boardingDate: false,
      marketingPerson: false,
      hostelImages: false,
    });
  };

  const handleRadioChange = (section, value) => {
    setVerification(prev => ({
      ...prev,
      [section]: value,
    }));
  
    // Show reason input if any field is marked as 'no'
    if (value === 'no') {
      setShowReasonInput(true);
    } else {
      setShowReasonInput(
        requiredFields.some(field => verification[field] === 'no')
      );
    }
  };



  const handleSubmit = () => {
    if (!selectedHostel || !selectedHostel.id) return;
  
    // Validate fields
    const requiredFields = [
      'hostelName',
      'hostelOwner',
      'hostelLocation',
      'contactNumber',
      'boardingType',
      'boardingDate',
      'marketingPerson',
      'hostelImages'
    ];
  
    const errors = {};
  
    // Check if all required fields are filled
    requiredFields.forEach(field => {
      if (verification[field] !== 'yes' && verification[field] !== 'no') {
        errors[field] = true; // Field is missing
      } else {
        errors[field] = false;
      }
    });
  
    // Set validation errors
    setValidationErrors(errors);
  
    // Check if all required fields are filled
    const allFieldsFilled = Object.values(errors).every(error => !error);
  
    if (!allFieldsFilled) {
      alert('Please select Yes or No for all required fields.');
      return;
    }
  
    // Check if any field is marked as "No" and if a reason is provided
    const anyFieldNo = requiredFields.some(field => verification[field] === 'no');
    if (anyFieldNo && !reason.trim()) {
      alert('Please provide a reason if any field is marked as "No".');
      return;
    }
  
    // Determine verification status
    const verificationStatus = anyFieldNo ? 'Incompleted' : 'Completed';
  
    const verificationData = {
      ...verification,
      verificationStatus: verificationStatus,
      submitted: true,
      reason: reason
    };
  
    // Update database
    const hostelsRef = ref(database, `hostels/${selectedHostel.id}`);
    update(hostelsRef, { verification: verificationData })
      .then(() => {
        alert('Verification data updated successfully');
        setIsEditable(verificationStatus !== 'Incompleted');
        closeModal();
      })
      .catch((error) => {
        console.error('Error updating verification data:', error);
      });
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
         <select
          name="verificationStatus"
          value={filters.verificationStatus}
          onChange={handleFilterChange}
        >
          <option value="">All Verification Status</option>
          <option value="Completed">Completed</option>
          <option value="Incompleted">Incompleted</option>
        </select>
      </div>

      
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
        <th>Verification</th>
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
            <td>
              {hostel.verification && hostel.verification.verificationStatus === 'Completed' ? (
                <span>Completed</span>
              ) : (
                <>
                              
              {hostel.verification && hostel.verification.verificationStatus !== 'Completed' ? "InCompleted":"" }
              <button onClick={() => openModal(hostel)} className="verification-button">
                  For Verification
                </button>
                </>

                
              )}
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
                  <img src={hostel.hostelImages} alt={hostel.hostelName} className="hostel-image" height="100px" width="100px"/>
                ) : (
                  'No Image'
                )}
              </div>
              <div>
              {hostel.verification && hostel.verification.verificationStatus === 'Completed' ? (
                <span>Completed</span>
              ) : (
                <>
                              
              {hostel.verification && hostel.verification.verificationStatus !== 'Completed' ? "InCompleted":"" }
              <button onClick={() => openModal(hostel)} className="verification-button">
                  For Verification
                </button>
                </>

                
              )}
            </div>
              
            </div>
          ))
        ) : (
          <p>No data available</p>
        )}
      </div>

      {/* Modal for verification */}
      {isModalOpen && selectedHostel && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={closeModal}>Close</button>
            <h2>{selectedHostel.hostelName}</h2>
            <div className="modal-section">
              <p><strong>Hostel Name:</strong> {selectedHostel.hostelName}</p>
              <label>
                <input
                  type="radio"
                  name="hostelName"
                  value="yes"
                  checked={verification.hostelName === 'yes'}
                  onChange={() => handleRadioChange('hostelName', 'yes')}
                  disabled={!isEditable}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="hostelName"
                  value="no"
                  checked={verification.hostelName === 'no'}
                  onChange={() => handleRadioChange('hostelName', 'no')}
                  disabled={!isEditable}
                />
                No
              </label>
              {validationErrors.hostelName === '' && <span className="error-text">Please select an option.</span>}
            </div>
            <div className="modal-section">
              <p><strong>Hostel Owner:</strong>{selectedHostel.hostelOwner}</p>
              <label>
                <input
                  type="radio"
                  name="hostelOwner"
                  value="yes"
                  checked={verification.hostelOwner === 'yes'}
                  onChange={() => handleRadioChange('hostelOwner', 'yes')}
                  disabled={!isEditable}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="hostelOwner"
                  value="no"
                  checked={verification.hostelOwner === 'no'}
                  onChange={() => handleRadioChange('hostelOwner', 'no')}
                  disabled={!isEditable}
                />
                No
              </label>
              {validationErrors.hostelOwner === '' && <span className="error-text">Please select an option.</span>}
            </div>
            <div className="modal-section">
              <p><strong>Hostel Location:</strong>{selectedHostel.hostelLocation}</p>
              <label>
                <input
                  type="radio"
                  name="hostelLocation"
                  value="yes"
                  checked={verification.hostelLocation === 'yes'}
                  onChange={() => handleRadioChange('hostelLocation', 'yes')}
                  disabled={!isEditable}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="hostelLocation"
                  value="no"
                  checked={verification.hostelLocation === 'no'}
                  onChange={() => handleRadioChange('hostelLocation', 'no')}
                  disabled={!isEditable}
                />
                No
              </label>
              {validationErrors.hostelLocation === '' && <span className="error-text">Please select an option.</span>}
            </div>
            <div className="modal-section">
              <p><strong>Contact Number:</strong>{selectedHostel.hostelOwnerContact}</p>
              <label>
                <input
                  type="radio"
                  name="contactNumber"
                  value="yes"
                  checked={verification.contactNumber === 'yes'}
                  onChange={() => handleRadioChange('contactNumber', 'yes')}
                  disabled={!isEditable}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="contactNumber"
                  value="no"
                  checked={verification.contactNumber === 'no'}
                  onChange={() => handleRadioChange('contactNumber', 'no')}
                  disabled={!isEditable}
                />
                No
              </label>
              {validationErrors.contactNumber === '' && <span className="error-text">Please select an option.</span>}
            </div>
            <div className="modal-section">
              <p><strong>Boarding Type:</strong>{selectedHostel.boardingType}</p>
              <label>
                <input
                  type="radio"
                  name="boardingType"
                  value="yes"
                  checked={verification.boardingType === 'yes'}
                  onChange={() => handleRadioChange('boardingType', 'yes')}
                  disabled={!isEditable}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="boardingType"
                  value="no"
                  checked={verification.boardingType === 'no'}
                  onChange={() => handleRadioChange('boardingType', 'no')}
                  disabled={!isEditable}
                />
                No
              </label>
              {validationErrors.boardingType === '' && <span className="error-text">Please select an option.</span>}
            </div>
            <div className="modal-section">
              <p><strong>Boarding Date:</strong>{selectedHostel.boardingDate}</p>
              <label>
                <input
                  type="radio"
                  name="boardingDate"
                  value="yes"
                  checked={verification.boardingDate === 'yes'}
                  onChange={() => handleRadioChange('boardingDate', 'yes')}
                  disabled={!isEditable}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="boardingDate"
                  value="no"
                  checked={verification.boardingDate === 'no'}
                  onChange={() => handleRadioChange('boardingDate', 'no')}
                  disabled={!isEditable}
                />
                No
              </label>
              {validationErrors.boardingDate === '' && <span className="error-text">Please select an option.</span>}
            </div>
            <div className="modal-section">
              <p><strong>Marketing Person:</strong>{selectedHostel.marketingPerson}</p>
              <label>
                <input
                  type="radio"
                  name="marketingPerson"
                  value="yes"
                  checked={verification.marketingPerson === 'yes'}
                  onChange={() => handleRadioChange('marketingPerson', 'yes')}
                  disabled={!isEditable}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="marketingPerson"
                  value="no"
                  checked={verification.marketingPerson === 'no'}
                  onChange={() => handleRadioChange('marketingPerson', 'no')}
                  disabled={!isEditable}
                />
                No
              </label>
              {validationErrors.marketingPerson === '' && <span className="error-text">Please select an option.</span>}
            </div>
           
            <div className="modal-section">
               <p><strong>Hostel Images:</strong></p>
               {selectedHostel.hostelImages ? (
                 <img src={selectedHostel.hostelImages} alt={selectedHostel.hostelName} className="hostel-image" />
               ) : (
                'No Image'
               )}
              <label>
                <input
                  type="radio"
                  name="hostelImages"
                  value="yes"
                  checked={verification.hostelImages === 'yes'}
                  onChange={() => handleRadioChange('hostelImages', 'yes')}
                  disabled={!isEditable}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="hostelImages"
                  value="no"
                  checked={verification.hostelImages === 'no'}
                  onChange={() => handleRadioChange('hostelImages', 'no')}
                  disabled={!isEditable}
                />
                No
              </label>
              {validationErrors.hostelImages === '' && <span className="error-text">Please select an option.</span>}
            </div>

            {showReasonInput && (
              <div className="modal-section">
                <p><strong>Reason:</strong></p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason here"
                  disabled={!isEditable}
                />
                 {validationErrors.reason === '' && <span className="error-text">Please select an option.</span>}
              </div>
            )}

            <div className="modal-section">
            {selectedHostel && selectedHostel.verification?.verificationStatus !== 'completed' && (
              <button
                className="modal-submit-button"
                onClick={handleSubmit}
                disabled={!isEditable}
              >
                Submit
              </button>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mainadmin;
