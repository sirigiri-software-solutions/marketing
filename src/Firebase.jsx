
// Firebase.jsx
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, onValue, update } from "firebase/database";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getStorage, ref as storageRef } from "firebase/storage"; // Correct import for Firebase storage
 
 
const firebaseConfig = {
  apiKey: "AIzaSyAdXYPseeNz6MH_1sDzELmvqOE5zCV2-sM",
  authDomain: "marketing-82d52.firebaseapp.com",
  databaseURL: "https://marketing-82d52-default-rtdb.firebaseio.com",
  projectId: "marketing-82d52",
  storageBucket: "marketing-82d52.appspot.com",
  messagingSenderId: "373681777541",
  appId: "1:373681777541:web:ab3ad866ad21265f2772ec",
  measurementId: "G-K9WMKTRLJY"
};
 
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
 
export { database, ref, set, push, onValue, firestore, collection, addDoc,update,storage,storageRef };



// Firebase.jsx
// import { initializeApp } from "firebase/app";
// import { getDatabase, ref, set, push, onValue, update } from "firebase/database";
// import { getFirestore, collection, addDoc } from "firebase/firestore";
// import { getStorage, ref as storageRef } from "firebase/storage"; // Correct import for Firebase storage
 
 
// const firebaseConfig = {
//   apiKey: "AIzaSyAzNXYh7MHZABbF8AeE7ZnNK_YromMZxYs",
//   authDomain: "marketing-97e0f.firebaseapp.com",
//   databaseURL: "https://marketing-97e0f-default-rtdb.firebaseio.com",
//   projectId: "marketing-97e0f",
//   storageBucket: "marketing-97e0f.appspot.com",
//   messagingSenderId: "484848822935",
//   appId: "1:484848822935:web:1e34bdd36089312a7797d2",
//   measurementId: "G-SNHC4DPM1F"
// };
 
// const app = initializeApp(firebaseConfig);
// const database = getDatabase(app);
// const firestore = getFirestore(app);
// const storage = getStorage(app);
 
// export { database, ref, set, push, onValue, firestore, collection, addDoc,update,storage,storageRef };