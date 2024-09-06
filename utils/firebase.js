const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");

// Replace with your app's Firebase project configuration
const firebaseConfig = {
  // Your config here
  storageBucket: "gs://pintres-project.appspot.com",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);




module.exports = { storage, ref, uploadBytes, getDownloadURL };