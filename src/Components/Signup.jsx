import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get, push, set } from "firebase/database";
import { database } from "../Firebase";
import "./Signup.css";

const Signup = () => {
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmpassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isAdmin, setIsAdmin] = useState(false); // State for admin checkbox
  const navigate = useNavigate();

  const handleSignup = () => {
    const { firstName, lastName, email, password, confirmpassword } = signupData;
    let formErrors = {};

    if (!firstName) formErrors.firstName = "First Name is required";
    if (!lastName) formErrors.lastName = "Last Name is required";
    if (!email) formErrors.email = "Email is required";
    if (!password) formErrors.password = "Password is required";
    if (!confirmpassword) formErrors.confirmpassword = "Confirm Password is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) formErrors.email = "Invalid email format";

    if (password && password.length < 6) formErrors.password = "Password must be at least 6 characters";

    if (password !== confirmpassword) formErrors.confirmpassword = "Passwords do not match";

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const userRef = ref(database, "signupdata");

    get(userRef)
      .then((snapshot) => {
        const userData = snapshot.val();
        const userExists = Object.values(userData || {}).some(
          (user) => user.signupData && user.signupData.email === email
        );

        if (userExists) {
          setErrors({ email: "User already exists" });
        } else {
          const newUserRef = push(userRef);
          set(newUserRef, {
            signupData: { firstName, lastName, email, password, isAdmin }, // Save isAdmin status
          })
            .then(() => {
              localStorage.setItem("firstName", firstName); // Save first name to localStorage
              setSignupData({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                confirmpassword: "",
              });
              
            })
            .catch((error) => {
              console.error("Error adding user data:", error);
              setErrors({ general: "Error adding user data" });
            });
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setErrors({ general: "Error fetching user data" });
      });
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleAdminChange = (e) => {
    setIsAdmin(e.target.checked); // Update isAdmin based on checkbox
  };

  return (
    <div className="signup-background">
      <div className="signup-container">
        <div className="input-container">
          <input
            type="text"
            placeholder="First Name"
            className="input"
            name="firstName"
            value={signupData.firstName}
            onChange={handleSignupChange}
          />
          {errors.firstName && <div className="error-text">{errors.firstName}</div>}
          
          <input
            type="text"
            placeholder="Last Name"
            className="input"
            name="lastName"
            value={signupData.lastName}
            onChange={handleSignupChange}
          />
          {errors.lastName && <div className="error-text">{errors.lastName}</div>}
          
          <input
            type="email"
            placeholder="Email"
            className="input"
            name="email"
            value={signupData.email}
            onChange={handleSignupChange}
          />
          {errors.email && <div className="error-text">{errors.email}</div>}
          
          <input
            type="password"
            placeholder="Password"
            className="input"
            name="password"
            autoComplete="current-password"
            onChange={handleSignupChange}
          />
          {errors.password && <div className="error-text">{errors.password}</div>}
          
          <input
            type="password"
            placeholder="Confirm Password"
            className="input"
            name="confirmpassword"
            value={signupData.confirmpassword}
            autoComplete="current-password"
            onChange={handleSignupChange}
          />
          {errors.confirmpassword && <div className="error-text">{errors.confirmpassword}</div>}
          
          {errors.general && <div className="error-text">{errors.general}</div>}
          
          <div className="admin-checkbox">
            <label>
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={handleAdminChange}
              />
              Admin
            </label>
          </div>

          <button className="button" onClick={handleSignup}>
            Signup
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
