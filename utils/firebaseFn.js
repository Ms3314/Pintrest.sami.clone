const { getFirestore, collection , getDocs , addDoc , doc } = require('firebase/firestore');
const {storage , ref , uploadBytes , getDownloadURL , listAll} = require('./firebase.js')
const db = getFirestore();

async function uploadToFirebase(file , userid ) {
  const fileName = Date.now() + '-' + file.originalname;
  const storageRef = ref(storage, 'images/' + fileName);
  
//   upload the file to firebase storage
  try {
    const snapshot = await uploadBytes(storageRef, file.buffer, {
      contentType: file.mimetype,
    });
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log()
    // firestore mein data save karre appan 
    

  } catch (error) {
    console.error('Error uploading to Firebase:', error);
    throw error;
  }
  }


   async function listAllFiles(directoryPath) {
    try {
      const directoryRef = ref(storage, directoryPath);
      const result = await listAll(directoryRef);
      console.log(result , "this is the result of the list all files ")
      const fileUrls = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return { 
            name: itemRef.name,
            url ,
            };
        })
      );
  
      return fileUrls;
    } catch (error) {
      console.error("Error listing files: ", error);
      throw error;
    }
  }

module.exports = {uploadToFirebase , listAllFiles}