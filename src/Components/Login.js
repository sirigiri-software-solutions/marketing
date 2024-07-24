import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get, push, set } from "firebase/database";
import { database } from "./Firebase";
import "./Login.css";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [signinData, setSigninData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async () => {
    const { username, password } = signinData;

    if (!username || !password) {
      console.error("Please fill in both username and password");
      return;
    }

    setLoading(true);

    try {
      const userRef = ref(database, "signupdata");
      const snapshot = await get(userRef);
      const userData = snapshot.val();

      const user = Object.values(userData || {}).find(
        (user) => user.signupData && user.signupData.username === username
      );

      if (user) {
        const singleUserData = user.signupData;

        if (singleUserData.password === password) {
          localStorage.setItem("username", signinData.username);
          console.log("You are logged in successfully.");
          navigate("/Dashboardpage");
        } else {
          console.error("Password incorrect");
        }
      } else {
        const newUserRef = push(userRef);
        await set(newUserRef, {
          signupData: { username, password },
        });

        localStorage.setItem("username", username);
        console.log("You are signed up and logged in successfully.");
        navigate("/Dashboardpage");
      }
    } catch (error) {
      console.error("Error fetching user data. Please try again later.", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSigninChange = (e) => {
    const { name, value } = e.target;
    setSigninData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="background">
      <div className="login-container">
        <div className="input-container">
          <input
            type="text"
            placeholder="Username"
            className="input"
            name="username"
            onChange={handleSigninChange}
            value={signinData.username}
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="input"
            name="password"
            autoComplete="current-password"
            onChange={handleSigninChange}
            value={signinData.password}
          />
          <div className="show-password-container">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label>Show Password</label>
          </div>
          <button className="button" onClick={handleSignIn} >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
