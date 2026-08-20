import {
  onAuthStateChanged,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { auth } from "./firebase";

export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export function isSignInLink(url) {
  return isSignInWithEmailLink(auth, url);
}

export function completeSignIn(email, url) {
  return signInWithEmailLink(auth, email, url);
}