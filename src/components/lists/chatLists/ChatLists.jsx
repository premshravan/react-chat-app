import React, { useEffect, useState } from "react";
import "./chatLists.css";
import AddUser from "../../addUser/AddUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";

const ChatLists = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddmode] = useState(false);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    if (!currentUser?.id) {
      console.warn("No current user ID available");
      return;
    }
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data().chats;
        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();
          return { ...item, user };
        });
        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );
    return () => {
      unSub();
    };
  }, [currentUser?.id]);

  // Function to handle removing a user from the chat list
  const handleRemoveChat = async (chatToRemove) => {
    try {
      // Reference the current user's chats document
      const userChatsRef = doc(db, "userchats", currentUser.id);

      // Get the current data from Firestore
      const userChatsSnapshot = await getDoc(userChatsRef);
      if (userChatsSnapshot.exists()) {
        const userChatsData = userChatsSnapshot.data();

        // Filter out the chat to be removed
        const updatedChats = userChatsData.chats.filter(
          (chat) => chat.chatId !== chatToRemove.chatId
        );

        // Update Firestore with the filtered chats
        await updateDoc(userChatsRef, { chats: updatedChats });

        // Update local state to reflect changes
        setChats((prevChats) =>
          prevChats.filter((chat) => chat.chatId !== chatToRemove.chatId)
        );
      }
    } catch (err) {
      console.error("Error removing chat:", err.message);
      alert("Failed to remove chat. Please try again.");
    }
  };

  // Callback function to reset Add Mode when AddUser is closed
  const handleAddUserClose = () => {
    setAddmode(false);
  };

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );
    userChats[chatIndex].isSeen = true;
    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.log(err);
    }
  };
  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="chatLists">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt=""
          className="add"
          onClick={() => setAddmode((prev) => !prev)}
        />
      </div>
      {filteredChats.map((chat) => (
        <div
          key={chat.chatId}
          className="item"
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat?.isSeen ? "transparent" : "#9137fe",
          }}
        >
          <img
            src={
              chat.user.blocked.includes(currentUser.id)
                ? "./avatar.png"
                : chat.user.avatar || "./avatar.png"
            }
            alt=""
          />
          <div className="texts">
            <span>
              {chat.user.blocked.includes(currentUser.id)
                ? "User"
                : chat.user.username}
            </span>
            <p>{chat.lastMessage}</p>
          </div>
          <button
            className="closebutton"
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the parent click handler
              handleRemoveChat(chat);
            }}
          >
            Close
          </button>
        </div>
      ))}
      {addMode && <AddUser onClose={handleAddUserClose} />}{" "}
      {/* Pass Callback */}
    </div>
  );
};

export default ChatLists;
