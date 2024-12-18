import React, { useState } from "react";
import "./addUser.css";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";

const AddUser = ({onClose}) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username").trim();

    if (!username) {
      setError("Please enter a username");
      setUser(null);
      return;
    }

    try {
      const userRef = collection(db, "users");

      const q = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data());
        setError(null);
      } else {
        setUser(null);
        setError("User not found.");
      }
    } catch (err) {
      console.log(err);
      setError("An error occurred while searching. Please try again.");
    }
  };
  const handleAdd = async () => {
    if (!user) return;
  
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");
  
    try {
      // Check if chat already exists
      const currentUserChatsSnapshot = await getDoc(doc(userChatsRef, currentUser.id));
      const currentUserChats = currentUserChatsSnapshot.data()?.chats || [];
  
      const existingChat = currentUserChats.find(
        (chat) => chat.receiverId === user.id
      );
  
      if (existingChat) {
        setError("Chat already exists.");
        return;
      }
  
      // Create a new chat
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });
  
      const chatData = {
        chatId: newChatRef.id,
        lastMessage: "",
        receiverId: user.id,
        updatedAt: Date.now(),
      };
  
      // Update Firestore for both users
      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion(chatData),
      });
  
      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          ...chatData,
          receiverId: currentUser.id, // Reverse the receiverId
        }),
      });
  
      setError(null);
      alert("User added successfully!");
    } catch (err) {
      console.log(err);
      setError("An error occurred while adding the user. Please try again. User not found  create the user");
    }
  };
  

  return (
    <div className="adduser">
      
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button type="submit">Search</button>
        <button  type="button" onClick={onClose} className="closeButton">Close</button>
      </form>
      {error && <p className="error">{error}</p>}
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="" />
            
            <span>{user.username}</span>
            
          </div>
          <button onClick={handleAdd}>Add user</button>
         
        </div>
      )}
    </div>
  );
};

export default AddUser;
