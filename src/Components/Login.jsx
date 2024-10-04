// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { ref, get } from "firebase/database";
// import { database } from "../Firebase";
// import "./Login.css";

// const Login = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [signinData, setSigninData] = useState({
//     email: "",
//     password: "",
//   });
//   const [errors, setErrors] = useState({});
//   const navigate = useNavigate();

//   const handleSignIn = () => {
//     const { email, password } = signinData;
//     let formErrors = {};

//     if (!email) formErrors.email = "Email is required";
//     if (!password) formErrors.password = "Password is required";

//     if (Object.keys(formErrors).length > 0) {
//       setErrors(formErrors);
//       return;
//     }

//     const userRef = ref(database, "signupdata");

//     get(userRef)
//       .then((snapshot) => {
//         const userData = snapshot.val();
//         const user = Object.values(userData || {}).find(
//           (user) => user.signupData && user.signupData.email === email
//         );

//         if (user) {
//           const singleUserData = user.signupData;

//           if (singleUserData.password === password) {
//             localStorage.setItem("email", signinData.email);
//             localStorage.setItem("firstName", singleUserData.firstName); // Save first name to localStorage

//             // Navigate based on user role
//             if (singleUserData.isSuperAdmin) {
//               navigate("/MainAdmin"); // Navigate to main admin page if SuperAdmin
//             } else if (singleUserData.isAdmin) {
//               navigate("/AllHostelsData"); // Navigate to all hostels data if admin
//             } else {
//               navigate("/Dashboardpage"); // Navigate to dashboard if not admin
//             }
//           } else {
//             setErrors({ password: "Password incorrect" });
//           }
//         } else {
//           setErrors({ email: "User does not exist" });
//         }
//       })
//       .catch((error) => {
//         console.error("Error fetching user data:", error);
//         setErrors({ general: "Error fetching user data" });
//       });
//   };

//   const handleSigninChange = (e) => {
//     const { name, value } = e.target;
//     setSigninData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//     setErrors((prevErrors) => ({
//       ...prevErrors,
//       [name]: "",
//     }));
//   };

//   return (
//     <div className="background">
//       <div className="login-container">
//         <div className="input-container">
//           <input
//             type="email"
//             placeholder="Email"
//             className="input"
//             name="email"
//             value={signinData.email}
//             onChange={handleSigninChange}
//           />
//           {errors.email && <div className="error-text">{errors.email}</div>}
          
//           <input
//             type={showPassword ? "text" : "password"}
//             placeholder="Password"
//             className="input"
//             name="password"
//             autoComplete="current-password"
//             value={signinData.password}
//             onChange={handleSigninChange}
//           />
//           {errors.password && <div className="error-text">{errors.password}</div>}
          
//           <div className="show-password-container">
//             <input
//               type="checkbox"
//               checked={showPassword}
//               onChange={() => setShowPassword(!showPassword)}
//             />
//             <label>Show Password</label>
//           </div>
          
//           {errors.general && <div className="error-text">{errors.general}</div>}
          
//           <button className="button" onClick={handleSignIn}>
//             Login
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;
















import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get, set } from "firebase/database";
import { database } from "../Firebase";
import "./Login.css";

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("email");
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("userRole");

    if (isLoggedIn === "true" && email) {
      // Redirect based on the user role
      if (role === "superAdmin") {
        navigate("/Mainadmin");
      } else if (role === "admin") {
        navigate("/allhostelsdata");
      } else {
        navigate("/Dashboardpage");
      }
    }
  }, [navigate]);

  const handleLogin = () => {
    const { email, password } = loginData;
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
            // Successful login
            localStorage.setItem("email", singleUserData.email);
            localStorage.setItem("firstName", singleUserData.firstName);
            localStorage.setItem("userRole", singleUserData.isSuperAdmin ? "superAdmin" : singleUserData.isAdmin ? "admin" : "user");
            localStorage.setItem("isLoggedIn", "true"); // Set login status to true
  
            // Update user login status in Firebase
            const userKey = Object.keys(userData).find(
              (key) => userData[key].signupData.email === email
            );
  
            // Determine the login state based on user role
            let loginState = '';
            if (singleUserData.isSuperAdmin) {
              loginState = 'loggedSuperAdmin';
            } else if (singleUserData.isAdmin) {
              loginState = 'loggedAdmin';
            } else {
              loginState = 'loggedDashboard';
            }
  
            // Set the user's login state in Firebase
            set(ref(database, `signupdata/${userKey}/signupData`), {
              ...singleUserData,
              isLoggedIn: true,
              loginState: loginState, // Store the login state
            });
  
            // Navigate based on user role
            if (singleUserData.isSuperAdmin) {
              navigate("/Mainadmin");
            } else if (singleUserData.isAdmin) {
              navigate("/allhostelsdata");
            } else {
              navigate("/Dashboardpage");
            }
          } else {
            setErrors({ password: "Incorrect password" });
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
  

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
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
            value={loginData.email}
            onChange={handleLoginChange}
          />
          {errors.email && <div className="error-text">{errors.email}</div>}
          
          <input
            type="password"
            placeholder="Password"
            className="input"
            name="password"
            autoComplete="current-password"
            value={loginData.password}
            onChange={handleLoginChange}
          />
          {errors.password && <div className="error-text">{errors.password}</div>}
          
          {errors.general && <div className="error-text">{errors.general}</div>}
          
          <button className="button" onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
