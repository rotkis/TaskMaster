import firebase from "firebase";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyBP1gsltvP54Uknk_dUJ5VfJfHEcDSAjhg",

  authDomain: "taskmaster-295b9.firebaseapp.com",

  projectId: "taskmaster-295b9",

  storageBucket: "taskmaster-295b9.firebasestorage.app",

  messagingSenderId: "853186176315",

  appId: "1:853186176315:web:5b9db222a965daee12031e",

  measurementId: "G-3C1EEW2X0P",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
