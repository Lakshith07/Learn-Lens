import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBS8e3SO5WlMNgGFvmKoySHG7XeYx9MHDU",
  authDomain: "learnlens-5d200.firebaseapp.com",
  projectId: "learnlens-5d200",
  storageBucket: "learnlens-5d200.firebasestorage.app",
  messagingSenderId: "181965029480",
  appId: "1:181965029480:web:d1adfda2aaa4bc57b93bdd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
