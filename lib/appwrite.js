import { Client, Account, ID, Avatars, Databases, Query, Storage } from 'react-native-appwrite';


export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: 'com.dcnolie.aers',
  projectId: '67766a4d002a66df4038',
  databaseId: '677673cd0024e2b733a9',
  userCollectionId:'67767427000827d546ae',
  videoCollectionId: '67767469002a1b3429d9',
  classCollectionId: '6788e8630018c8251328',
  reportCollectonId:'6788f2e3001dbc0f7244',
  responderCollectionId:'6788f1e80021e8e1aba8',
  storageId:'6777baa3000d500c3519',
   messageCollectionId: '678e22870025c397abf1',
   endpointRealtime: 'wss://cloud.appwrite.io/v1/realtime'
}


// Init your React Native SDK
export const client = new Client();

client
  .setEndpoint(config.endpoint) // Your Appwrite Endpoint
  .setProject(config.projectId) // Your project ID
  .setPlatform(config.platform) // Your application ID or bundle ID.
  .setEndpointRealtime(config.endpointRealtime)
;

export const account = new Account(client);
export const avatars = new Avatars(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const createUser = async (username, fullName, email, password) => {
  try {
      const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
      if (!isValidEmail(email)) {
          throw new Error('Please enter a valid email address.');
      }

      console.log('Creating user with email:', email);

      const newAccount = await account.create(
          ID.unique(),
          email,       // Correct order: Email
          password,    // Password
           fullName  // Optional Name
      );

      if (!newAccount) throw new Error('Failed to create account');

      const avatarUrl = avatars.getInitials(username);

      const newUser = await databases.createDocument(
          config.databaseId,
          config.userCollectionId,
          ID.unique(),
          {
              accountId: newAccount.$id,
              email,
              username,
              fullName,
              avatar: avatarUrl
          }
      );

      await signIn(email, password);
      // Fetch the current user and update the global context state
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return newUser;
  } catch (error) {
      console.error('Error in createUser:', error.message || error);
      throw new Error(error.message || 'Something went wrong.');
  }
};

// Register User
export const signIn = async (email) => {
  try {
    // Check if there is an active session before attempting to delete it
    try {
      await account.deleteSession('current'); // This will log out the current user
    } catch (error) {
      if (error.code !== 401) {
        console.error('Error clearing session:', error.message || error);
      }
    }

    // Check if the email exists in the responder collection
    const response = await databases.listDocuments(
      config.databaseId,
      config.responderCollectionId,
      [Query.equal('email', email)] // Adjust the field name if necessary
    );

    if (response.documents.length === 0) {
      throw new Error('Email not found in responder collection.');
    }

    // If the email is found, create a session or perform any other action you need
    // For example, log the user in or set a state
    console.log('User found, session can be created or user logged in.');

    return { message: 'Sign-in successful', email }; // Return success message or user data
  } catch (error) {
    console.error('Sign-in failed:', error.message || error);
    throw error; // Re-throw the error for further handling
  }
};

export const getCurrentUser = async (email) => {
  try {
    if (!email) {
      throw new Error('Email is required to retrieve user details.');
    }

    // Check for the user in the responder collection using the provided email
    const response = await databases.listDocuments(
      config.databaseId,
      config.responderCollectionId,
      [Query.equal('email', email)] // Query by the provided email
    );

    if (response.documents.length === 0) {
      throw new Error('User not found in responder collection.'); // Improved error message
    }

    return response.documents[0]; // Return the first matching document
  } catch (error) {
    console.error('Error retrieving current user:', error.message || error);
    throw error; // Re-throw the error for further handling
  }
};


  export const sendResponse = async (messageBody, urlSenderId, urlResponderId) =>{
    
    try {
      const newMessage = await databases.createDocument(
        config.databaseId,
        config.messageCollectionId,
        ID.unique(),{
          messageBody,
          userId:urlSenderId,
          responderId: urlResponderId,
          isResponderSender: true
        }
      );
      console.log('new message created',messageBody);

     return newMessage;
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }
  export const uploadVideo = async (firstVideo) => {
    try {
      const file1 = {
        uri: firstVideo,
        name: `video_${Date.now()}_1.mp4`,
        type: 'video/mp4',
      };

      // const file2 = {
      //   uri : secondVideoUri,
      //   name: `video_${Date.now()}_2.mp4`,
      //   type: 'video/mp4',
      // };

      // Upload the video files
      const response1 = await storage.createFile(config.storageId, ID.unique(), file1);
      // const response2 = await storage.createFile(config.storageId, ID.unique(), file2);

      console.log('Videos uploaded successfully:', response1, response2);
      Alert.alert('Upload Complete', 'Your videos have been uploaded successfully.');
    } catch (error) {
      console.error('Video upload failed:', error);
      Alert.alert('Upload Error', 'Failed to upload videos. Please try again.');
    }
  };