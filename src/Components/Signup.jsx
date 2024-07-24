import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get, push, set } from "firebase/database";
import { database } from "../Firebase";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Signup.css";

const Signup = () => {
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmpassword: "",
  });
  const navigate = useNavigate();

  const handleSignup = () => {
    const { firstName, lastName, email, password, confirmpassword } = signupData;

    if (!firstName || !lastName || !email || !password || !confirmpassword) {
      toast.error("Please fill in all fields", {
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

    if (password !== confirmpassword) {
      toast.error("Passwords do not match", {
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

    const userRef = ref(database, "signupdata");

    get(userRef)
      .then((snapshot) => {
        const userData = snapshot.val();
        const userExists = Object.values(userData || {}).some(
          (user) => user.signupData && user.signupData.email === email
        );

        if (userExists) {
          toast.error("User already exists", {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } else {
          const newUserRef = push(userRef);
          set(newUserRef, {
            signupData: { firstName, lastName, email, password },
          })
            .then(() => {
              toast.success("You are signed up successfully.", {
                position: "bottom-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });

              // Clear the form after successful signup
              setSignupData({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                confirmpassword: "",
              });

              // Optionally, you can navigate to another page after successful signup
              // navigate("/somepage");
            })
            .catch((error) => {
              console.error("Error adding user data:", error);
              toast.error("Error adding user data", {
                position: "bottom-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
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

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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
          <input
            type="text"
            placeholder="Last Name"
            className="input"
            name="lastName"
            value={signupData.lastName}
            onChange={handleSignupChange}
          />
          <input
            type="email"
            placeholder="Email"
            className="input"
            name="email"
            value={signupData.email}
            onChange={handleSignupChange}
          />
          <input
            type="password"
            placeholder="Password"
            className="input"
            name="password"
            value={signupData.password}
            autoComplete="current-password"
            onChange={handleSignupChange}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="input"
            name="confirmpassword"
            value={signupData.confirmpassword}
            autoComplete="current-password"
            onChange={handleSignupChange}
          />
          <button className="button" onClick={handleSignup}>
            Signup
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
