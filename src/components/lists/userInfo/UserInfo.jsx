import React from "react";
import "./userInfo.css";
import { useUserStore } from "../../../lib/userStore";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../../lib/firebase";

const UserInfo = () => {
  const { currentUser } = useUserStore();

  const navigate = useNavigate(); // Initialize the navigate function

  const handleLogout = async () => {
    try {
      await signOut(auth); // Log out the user from Firebase
      navigate("/login"); // Redirect to the login page
    } catch (error) {
      console.log("Logout Error:", error.message);
    }
  };

  return (
    <div className="userInfo">
      <div className="user">
        <img src={currentUser.avatar || "./avatar.png"} alt="" />
        <h3>{currentUser.username}</h3>
      </div>
      <div className="icons">
        <img src="./more.png" alt="" />
        <img src="./video.png" alt="" />
        <img src="./edit.png" alt="" />
        <img className="logout" src="./logout.png" alt="logout" onClick={handleLogout} />
        <span className="tooltip">Logout</span> {/* Tooltip text */}
      </div>
    </div>
  );
};

export default UserInfo;
