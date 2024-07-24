import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { database } from "../Firebase";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [signinData, setSigninData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleSignIn = () => {
    const { email, password } = signinData;

    const userRef = ref(database, "signupdata");

    if (!email || !password) {
      toast.error("Please fill in both email and password", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

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

            toast.success("You are logged in successfully.", {
              position: "bottom-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            console.log("sucessfullly loggin")
            
          } else {
            toast.error("Password incorrect", {
              position: "bottom-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          }
        } else {
          toast.error("User does not exist", {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        toast.error("Error fetching user data", {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      });
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
            type="email"
            placeholder="Email"
            className="input"
            name="email"
            onChange={handleSigninChange}
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="input"
            name="password"
            autoComplete="current-password"
            onChange={handleSigninChange}
          />
          <div className="show-password-container">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label>Show Password</label>
          </div>
          <button className="button" onClick={handleSignIn}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
