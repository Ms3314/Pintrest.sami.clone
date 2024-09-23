const { getFirestore, collection , getDocs , addDoc , doc , getMetadata } = require('firebase/firestore');
const {storage , ref , uploadBytes , getDownloadURL , listAll , getStorage } = require('./firebase.js')
// const { getStorage} = require('./firebase/storage')
const { setLogLevel } = require('firebase/app');
setLogLevel('debug');

const db = getFirestore();

async function uploadToFirebase(file , userid ) {
  const fileName = Date.now() + '-' + file.originalname;
  const storageRef = ref(storage, 'images/' + fileName);
  console.log(file , file.buffer , "file data ")
//   upload the file to firebase storage
  const metadata = {
  contentType: file.mimetype,  // Set the correct MIME type
  };
  try {
    const snapshot = await uploadBytes(storageRef, file.buffer , metadata);

    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL
    // firestore mein data save karre appan 
  
  } catch (error) {
    console.error('Error uploading to Firebase:', error);
    throw error;
  }
  }



  // async function listAllImagesWithMetadata(directoryPath = 'images/') {
  //   const directoryRef = ref(storage, directoryPath);
  //   console.log("Directory reference created:", directoryRef);

  //   try {
  //     // Get all the files from the directory
  //     const result = await listAll(directoryRef).catch(err=>console.log(err));

  //     // Check if items exist in the result
  //   console.log("List All Result:", result);
  //   console.log("Number of items found:", result.items.length);

  //   if (result.items.length === 0) {
  //     console.log("No files found in the specified directory.");
  //     return [];  // Return an empty array if no files are found
  //   }

  //     // Map through the items and get URLs and metadata
  //     const fileData = await Promise.all(
  //       result.items.map(async (itemRef) => {
  //         try {
  //           // Get the download URL for each item
  //           const url = await getDownloadURL(itemRef);
  
  //           // Get the metadata for each item
  //           const metadata = await getMetadata(itemRef);
  
  //           // Extract custom metadata (like userid and uploadedAt)
  //           const { userid, uploadedAt } = metadata.customMetadata || {};
  
  //           return {
  //             name: itemRef.name,        // File name
  //             url,                       // Download URL
  //             userid,                    // User who uploaded the image
  //             uploadedAt,                // Date of upload
  //           };
  //         } catch (error) {
  //           console.error("Error retrieving data for:", itemRef.name, error);
  //           return null;  // Handle failed items gracefully
  //         }
  //       })
  //     );
  
  //     // Filter out any null results due to errors
  //     return fileData.filter((data) => data !== null);
  
  //   } catch (error) {
  //     console.error("Error fetching files:", error);
  //     throw error;
  //   }
  // }
  
  

   module.exports = {uploadToFirebase }