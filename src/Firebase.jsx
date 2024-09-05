// Firebase.jsx
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, onValue,update } from "firebase/database";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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

export { database, ref, set, push, onValue, firestore, collection, addDoc,update };
