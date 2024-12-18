import React, { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";

const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const [loading, setLoading] = useState(false);

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  // SIGNUP - REGISTRATION

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    try {
      // Create a new user
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // Save user details to Firestore
      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        id: res.user.uid,
        blocked: [],
      });

      // Initialize user's chat collection
      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      // Force sign-out to avoid auto-login
      await signOut(auth);

      toast.success("Account created successfully! Please log in.");
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  //LOGIN

  const handleLogin = async (e) => {
    e.preventDefault(); //prevent from refreshing page from form submit
    setLoading(true);
    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Successfully LoggedIn.");
    } catch (err) {
      console.log(err);
      toast.error(err.message); // toast.error('Heloowww') //call the notification
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="item">
        <h2>Create an Account</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
            <img src={avatar.url || "./avatar.png"} alt="" />
            Upload an image
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />
          <input type="text" placeholder="Username" name="username" />
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="password" name="password" />
          <button disabled={loading}>{loading ? "loading" : "Sign Up"} </button>
        </form>
      </div>
      <div className="seperator"></div>
      <div className="item">
        <h2 className="smiley"> Log In here...!</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="password" name="password" />
          <button disabled={loading}>Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
