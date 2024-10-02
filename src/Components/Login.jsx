import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { database } from "../Firebase";
import "./Login.css";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [signinData, setSigninData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSignIn = () => {
    const { email, password } = signinData;
    let formErrors = {};

    if (!email) formErrors.email = "Email is required";
    if (!password) formErrors.password = "Password is required";

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const userRef = ref(database, "signupdata");

    get(userRef)
      .then((snapshot) => {
        const userData = snapshot.val();
        const user = Object.values(userData || {}).find(
          (user) => user.signupData && user.signupData.email === email
        );

        if (user) {
          const singleUserData = user.signupData;

          if (singleUserData.password === password) {
            localStorage.setItem("email", signinData.email);
            localStorage.setItem("firstName", singleUserData.firstName); // Save first name to localStorage

            // Navigate based on user role
            if (singleUserData.isSuperAdmin) {
              navigate("/MainAdmin"); // Navigate to main admin page if SuperAdmin
            } else if (singleUserData.isAdmin) {
              navigate("/AllHostelsData"); // Navigate to all hostels data if admin
            } else {
              navigate("/Dashboardpage"); // Navigate to dashboard if not admin
            }
          } else {
            setErrors({ password: "Password incorrect" });
          }
        } else {
          setErrors({ email: "User does not exist" });
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setErrors({ general: "Error fetching user data" });
      });
  };

  const handleSigninChange = (e) => {
    const { name, value } = e.target;
    setSigninData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  return (
    <div className="background">
      <div className="login-container">
        <div className="input-container">
          <input
            type="email"
            placeholder="Email"
            className="input"
            name="email"
            value={signinData.email}
            onChange={handleSigninChange}
          />
          {errors.email && <div className="error-text">{errors.email}</div>}
          
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="input"
            name="password"
            autoComplete="current-password"
            value={signinData.password}
            onChange={handleSigninChange}
          />
          {errors.password && <div className="error-text">{errors.password}</div>}
          
          <div className="show-password-container">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label>Show Password</label>
          </div>
          
          {errors.general && <div className="error-text">{errors.general}</div>}
          
          <button className="button" onClick={handleSignIn}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

