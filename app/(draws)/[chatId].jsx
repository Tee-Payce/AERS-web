import { View, Text, FlatList, TextInput, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'expo-router/build/hooks';
import { client ,databases, config, sendResponse } from '../../lib/appwrite';
import FormField from '../../components/FormField';
import { FontAwesome } from '@expo/vector-icons';
import { Query } from 'react-native-appwrite';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video} from 'expo-av'; // Import Video component
import { useEvent } from 'expo';
import { Link, router } from 'expo-router'

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

  return (
    <SafeAreaView style={styles.container}>
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

      <View style={styles.innerContainer}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.messagesContainer}>
            {messages.map((msg, index) => {
              const isSenderStyle = msg.isResponderSender === isSender;
               const videoUrl = msg.hasVideoUrl ? `http://192.168.1.115:8085/uploads/${msg.videoUriId}` : null;
              //const videoUrl = 'http://192.168.1.115:8085/uploads/1740200212824-video_1740200211720_678f9ea3003bd9fd96b6_678a1a180014f1a82c72.mp4'; 

              return (
                <View key={index} style={[styles.messageContainer, isSenderStyle ? styles.senderMessage : styles.responderMessage]}>
                  <Text style={styles.messageText}>{msg.messageBody}</Text>
                  
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
          </View>
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
    </SafeAreaView>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161622',
    flex: 1,
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
});
