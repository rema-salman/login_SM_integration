import React, { useEffect, useContext, useState } from "react";
import { auth, googleProvider, twitterProvider } from "../firebase";
const AuthContext = React.createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  function signup(email, password) {
    //using firebase to set the value of the current user
    // returns a promise to be used for alert messages
    return auth.createUserWithEmailAndPassword(email, password);
  }
  function login(email, password) {
    //using firebase to set the value of the current user
    // returns a promise to be used for alert messages
    return auth.signInWithEmailAndPassword(email, password);
  }

  function logout() {
    //using firebase to set the value of the current user
    // returns a promise to be used for alert messages
    return auth.signOut();
  }

  function resetPassword(email) {
    return auth.sendPasswordResetEmail(email);
  }
  function updateEmail(email) {
    return currentUser.updateEmail(email);
  }
  function updatePassword(password) {
    return currentUser.updatePassword(password);
  }

  ///////// External providers login //////////
  function signinWithGoogle() {
    return auth.signInWithPopup(googleProvider);
  }

  function signinWithTwitter() {
    // return auth.signInWithPopup(twitterProvider);
    return auth.signInWithPopup(twitterProvider);
  }

  //  set the user when mounting this context then unsubscribe it
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // passing(exporting) these to other components
  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    updateEmail,
    updatePassword,
    signinWithGoogle,
    signinWithTwitter,
  };

  // Making sure we set user then load
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
