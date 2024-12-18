
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-3b219.firebaseapp.com",
  projectId: "reactchat-3b219",
  storageBucket: "reactchat-3b219.firebasestorage.app",
  messagingSenderId: "559702993900",
  appId: "1:559702993900:web:bdf6ceabd3ec20be1a2ec9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth() //firebase authentication login and registration
export const db=getFirestore() //fire base store user inforamtion
export const storage=getStorage() //storage of images
