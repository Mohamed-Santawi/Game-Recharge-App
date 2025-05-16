import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCr6pSac7RCfOYu4eCyfBZDWeDAxAiCrzA",
  authDomain: "game-recharge-store.firebaseapp.com",
  projectId: "game-recharge-store",
  storageBucket: "game-recharge-store.appspot.com",
  messagingSenderId: "515781944019",
  appId: "1:515781944019:web:6569fcc90eb407fcebea26",
  measurementId: "G-XCKQ5E2FZQ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Set persistence to LOCAL
setPersistence(auth, browserLocalPersistence).catch((error) => {
  // Keep this error log as it's important for debugging persistence issues
  console.error("Error setting auth persistence:", error);
});

export { auth, db, storage };
