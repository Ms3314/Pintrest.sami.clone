const {storage , ref , uploadBytes , getDownloadURL} = require('./firebase.js')

async function uploadToFirebase(file) {
  const fileName = Date.now() + '-' + file.originalname;
  const storageRef = ref(storage, 'images/' + fileName);
//   upload the file to firebase storage
  try {
    const snapshot = await uploadBytes(storageRef, file.buffer, {
      contentType: file.mimetype,
    });
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading to Firebase:', error);
    throw error;
  }
  }

module.exports = {uploadToFirebase}