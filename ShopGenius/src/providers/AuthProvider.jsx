import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { app } from "../firebase/firebase.config";
import axios from "axios";
import { AuthContext } from "../Contexts/AuthContext";
import toast from "react-hot-toast";

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(null);
  const [toggle, setToggle] = useState(false);

  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signIn = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider);
  };

  const resetPassword = (email) => {
    setLoading(true);
    return sendPasswordResetEmail(auth, email);
  };

  const logOut = async () => {
    setLoading(true);
    await axios.get(`${import.meta.env.VITE_API_URL}/logout`, {
      withCredentials: true,
    });
    return signOut(auth);
  };

  const updateUserProfile = (name, photo) => {
    console.log(name, photo);
    return updateProfile(auth.currentUser, {
      displayName: name,
      photoURL: photo,
    });
  };
  // Get token from server
  const getToken = async (email) => {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/jwt`,
      { email },
      { withCredentials: true }
    );
    return data;
  };

  const saveUser = async (user) => {
    console.log('from save user',user);
    const newUser = {
      email: user?.email,
      name: user?.displayName || null,
      firebaseUid: user?.uid || null,
      status: "verified",
      role: "user",
    };
    console.log(newUser);

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/users`, newUser);
    } catch (err) {
      toast.error(
        "Something went wrong while saving the user information.",
        err.message
      );
    }
  };

  // onAuthStateChange
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      try {
        if (!currentUser) {
          setLoading(false);
          return;
        }

        // If sign-in provider is NOT password (e.g., Google), we can trust it.
        const providerId =
          currentUser.providerData?.[0]?.providerId || "password";
        const isTrustedProvider = providerId !== "password";

        if (currentUser.emailVerified || isTrustedProvider) {
          await getToken(currentUser.email); // sets your HTTP-only cookie
          await saveUser(currentUser); // upsert in DB
        } else {
          // Safety net: users who somehow sneak in are immediately signed out
          toast("Please verify your email first", {
            duration: 3000,
          });
          await signOut(auth);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const authInfo = {
    user,
    loading,
    setLoading,
    createUser,
    signIn,
    signInWithGoogle,
    resetPassword,
    logOut,
    updateUserProfile,
    theme,
    setTheme,
    toggle,
    setToggle,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  // Array of children.
  children: PropTypes.array,
};

export default AuthProvider;
