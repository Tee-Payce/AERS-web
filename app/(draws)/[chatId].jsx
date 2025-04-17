import { View, Text, FlatList, TextInput, Button, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'expo-router/build/hooks';
import { client ,databases, config, sendResponse } from '../../lib/appwrite';
import FormField from '../../components/FormField';
import { FontAwesome } from '@expo/vector-icons';
import { Query } from 'react-native-appwrite';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video} from 'expo-av'; // Import Video component
import { useEvent } from 'expo';
import { Link, router } from 'expo-router'
import { ImageBackground } from 'react-native-web';
import Sidebar from '../../components/Sidebar';


const Chat = () => {
  const params = useSearchParams();
  const isSender = true;  
  const chatId = params.get('chatId'); 
  const urlSenderId = params.get('senderId');
  const urlResponderId = params.get('responderId');
  

  const [form, setForm] = useState({ messageBody: '' });
  const [messages, setMessages] = useState([]);
  const [notification, setNotification] = useState('');
  const [senderName, setSenderName] = useState('');
  
  
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);
  
 
  useEffect(() => {
    fetchMessages();
    fetchSenderName();

    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await databases.listDocuments(
        config.databaseId,
        config.messageCollectionId,
        [
          Query.and([
            Query.equal('userId', urlSenderId),
            Query.equal('responderId', urlResponderId),
          ])
        ]
      );
      setMessages(response.documents);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setNotification('Failed to fetch messages. Please try again.');
      setTimeout(() => setNotification(''), 5000);
    }
  };

  const fetchSenderName = async () => {
    try {
      const response = await databases.getDocument(
        config.databaseId,
        config.userCollectionId,
        urlSenderId  
      );
      setSenderName(response.fullName);
    } catch (error) {
      console.error('Failed to fetch sender name:', error);
      setNotification('Failed to fetch sender details.');
      setTimeout(() => setNotification(''), 5000);
    }
  };

  const send = async () => {
    if (!form.messageBody) {
      Alert.alert('Error', 'Please fill in all the fields!');
      return;
    }

    try {
      const newMessage = {
        messageBody: form.messageBody,
        userId: urlSenderId,
        responderId: urlResponderId,
        created: new Date().toISOString(),
        isRead: false, 
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);

      await sendResponse(form.messageBody, urlSenderId, urlResponderId);
    } catch (error) {
      console.error('Failed to send message:', error);
      setNotification('Failed to send message. Please try again.');
      setTimeout(() => setNotification(''), 5000);
    } finally {
      setForm({ messageBody: '' });
    }
  };
  const isLinkExpired = (created) => {
    const messageTime = new Date(created);
    const currentTime = new Date();
    const hoursDifference = (currentTime - messageTime) / (1000 * 60 * 60); // Difference in hours
    return hoursDifference > 2; // Check if more than 2 hours have passed
  };
  const SubSidebar = ({ senderName }) => (
    <View style={styles.subSidebar}>
      <Text style={styles.subSidebarTitle}>Chatting with</Text>
      <Text style={styles.subSidebarText}>{senderName}</Text>
    </View>
  );
  {/* Sub Sidebar (Shows Sender Name) */}
    <View style={styles.subSidebarContainer}>
    <SubSidebar senderName={senderName} />
  </View>  

  return (
    <View style={styles.container}>
            {/* Sidebar Section */}
            <View style={styles.sidebarContainer}>
                <Sidebar />
            </View>
            {/* Sub Sidebar (Shows Sender Name) */}
         <View style={styles.subSidebarContainer}>
             <SubSidebar senderName={senderName} />
         </View>

            {/* Content Section */}
            <ImageBackground style={styles.scrollView}  source={require('../../assets/images/background-mobile-15.png')} resizeMode="cover">

            <View style={styles.contentContainer}>
              <View style={{ backgroundColor: '#161626'}}>
      <Text style={styles.title}>
        <FontAwesome size={24} name="comments-o" color='#ff8c00' />
          Chat with Reporter
      </Text>
      <Text style={styles.responderName}>{senderName}</Text>
      
      {notification ? (
        <View style={styles.notification}>
          <Text style={styles.notificationText}>{notification}</Text>
        </View>
      ) : null}
         </View>
      <View style={styles.innerContainer}>

      <ScrollView
           ref={scrollViewRef}
          contentContainerStyle={styles.scrollView2}
           >

          
            {messages.map((msg, index) => {
              const isSenderStyle = msg.isResponderSender === isSender;
               const videoUrl = msg.hasVideoUrl ? `http://192.168.100.20:8085/uploads/${msg.videoUriId}` : null;
              //const videoUrl = 'http://192.168.1.115:8085/uploads/1740200212824-video_1740200211720_678f9ea3003bd9fd96b6_678a1a180014f1a82c72.mp4'; 
              const isLocationMessage = msg.messageBody.startsWith('Live Location:');
              let locationCoords = null;
  if (isLocationMessage) {
    // Extract the URL from the message body
    const urlMatch = msg.messageBody.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      const url = urlMatch[0];
      const urlParams = new URL(url);
      const queryParams = new URLSearchParams(urlParams.search);
      const coordinates = queryParams.get('q');

      // Split coordinates if they are in the form of "lat,lng"
      locationCoords = coordinates ? coordinates.split(',') : null;
    }
  }

              return (
                <View key={index} style={[styles.messageContainer, isSenderStyle ? styles.senderMessage : styles.responderMessage]}>
                {isLocationMessage ? (
                    isLinkExpired(msg.created) ? (
                      <Text style={styles.expiredText}>Link expired</Text>
                    ) : (
                      <TouchableOpacity
                        onPress={() => router.push({
                          pathname: '/find',
                          params: {
                            senderLat: locationCoords[0],
                            senderLng: locationCoords[1],
                            responderId: urlResponderId,
                          },
                        })}
                      >
                        <Text style={styles.locationText}>📍 View Live Location </Text>
                        <Text>{msg.messageBody}</Text>
                      </TouchableOpacity>
                     
                    )
                  
                  ) : (
                  <Text style={styles.messageText}>{msg.messageBody}</Text>
                  )}
                  {msg.hasVideoUrl && videoUrl && (
                    
                    <View style={styles.containers}>
                    <Text onPress={()=>{
                      router.push({
                        pathname :'/modal',
                        params : {videoUrl:videoUrl}
                     } )
                     console.log('passing video', videoUrl)
                    }} >watch full video</Text>
                  <Video
                           source={{ uri: videoUrl }}
           style={styles.video}
           useNativeControls
          resizeMode='potrait'
           isLooping
           
          
           shouldPlay={false} // Set to true if you want autoplay
  />
    
                </View>
                  )}

                  <Text style={styles.timestamp}>{new Date(msg.created).toLocaleTimeString()}</Text>

                </View>

              );
            })}
          
            </ScrollView>

         
       
        <View style={styles.inputContainer}>
          <FormField
            title=""
            value={form.messageBody}
            handleChangeText={(e) => setForm({ ...form, messageBody: e })}
            otherStyles={styles.inputField}
            placeholder="Type your message"
          />
          <Text style={styles.sendButton} onPress={send}>
            <FontAwesome size={36} name='paper-plane' color='#ff8c00' />
          </Text>
        </View>
      </View>
    </View>
    </ImageBackground>
    </View>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: {
        flex: 1,
        flexDirection: 'row', // Sidebar & content adjacent
        width: '100%',
        height: '100vh',
        backgroundColor: '#161626'
    },
    sidebarContainer: {
        width: 250, // Fixed sidebar width
        backgroundColor: '#1E1E2D',
    },
    contentContainer: {
        flex: 1, // Take remaining space
        flexDirection: 'column', 
    },
  containers:{
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 40,
    backgroundColor:'#161626'
  },
  responderName: {
    color: '#ff8c00',
    marginLeft: 70,
    marginBottom: 5,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  scrollView2: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    padding: 10,
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: '#161630',
  },
  messageContainer: {
    maxWidth: '75%',
    padding: 8,
    borderRadius: 10,
    marginVertical: 4,
  },
  senderMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#ff8c00',
    marginRight: 10,
  },
  responderMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#1e90ff',
    marginLeft: 10,
  },
  messageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: '#ddd',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    backgroundColor: '#161626'
  },
  inputField: {
    flex: 1,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  sendButton: {
    justifyContent: 'center',
  },
  notification: {
    backgroundColor: '#ffcc00',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  notificationText: {
    color: '#333',
    textAlign: 'center',
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  video: {
    width: 250,
    height: 200,
    aspectRatio: 16/9,
    marginTop: 5,
    borderRadius: 10,

    alignSelf:'stretch'
  },
  controlsContainer: {
    padding: 10,
  },
  subSidebarContainer: {
    width: 200,
    backgroundColor: '#2E2E40',
    padding: 10,
  },
  subSidebar: {
    alignItems: 'center',
    padding: 10,
  },
  subSidebarTitle: {
    fontSize: 18,
    color: '#ff8c00',
    fontWeight: 'bold',
  },
  subSidebarText: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
});
