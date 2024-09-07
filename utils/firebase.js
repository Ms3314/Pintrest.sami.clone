const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL , listAll  } = require("firebase/storage");

// Replace with your app's Firebase project configuration
const firebaseConfig = {
  // Your config here
  apiKey: "AIzaSyC-bOg9o6SQOr0fj_KTfitKT7BK-nhUn60",
  authDomain: "pintres-project.firebaseapp.com",
  projectId: "pintres-project",
  storageBucket: "pintres-project.appspot.com",
  messagingSenderId: "1019736564439",
  appId: "1:1019736564439:web:64caba5277bc2614984692",
  measurementId: "G-X7D5C7M6Z5"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);




module.exports = { storage, ref, uploadBytes, getDownloadURL , listAll};