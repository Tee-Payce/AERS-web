import { View, Text, FlatList, TextInput, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'expo-router/build/hooks';
import { client ,databases, config, sendResponse } from '../../lib/appwrite';
import FormField from '../../components/FormField';
import { FontAwesome } from '@expo/vector-icons';
import { Query } from 'react-native-appwrite';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native-web';


const Chat = () => {
    const params = useSearchParams();
  const isSender = true;  
  const chatId = params.get('chatId'); // Use `get` to retrieve query parameters
  const urlSenderId = params.get('senderId');
  const urlResponderId = params.get('responderId');
  const [form, setForm] = useState({
   messageBody:''
  });

  console.log('chat', chatId)
  console.log('responder', urlResponderId)
  console.log('sender',urlSenderId)
  
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState('');
  const [senderName, setSenderName] = useState('');

  useEffect(() => {
    fetchMessages(); // Initial fetch

    // Polling every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval); // Cleanup when component unmounts
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
        config.userCollectionId,  // Use the responder collection ID
        urlSenderId  // This should match the document ID
      );
      setSenderName(response.fullName); // Assuming the responder's name is in the 'name' field
    } catch (error) {
      console.error('Failed to fetch responder name:', error);
      setNotification('Failed to fetch responder details.');
      setTimeout(() => setNotification(''), 5000);
    }
  };

  const send = async () => {
    if (!form.messageBody){
      Alert.alert('Error', 'Please fill in all the fields!');
    return;
    }

    setIsSubmitting(true);
  
    try {
      const newMessage = {
        messageBody: form.messageBody,
        userId: urlSenderId,
        responderId: urlResponderId,
        created: new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]); // Update state immediately

      await sendResponse(form.messageBody, urlSenderId, urlResponderId);
    } catch (error) {
      console.error('Failed to send message:', error);
      setNotification('Failed to send message. Please try again.');
      setTimeout(() => setNotification(''), 5000);
    } finally {
      setIsSubmitting(false);
      setForm({
        messageBody:''
       }); 
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
          <View style={styles.messagesContainer}>
          {messages.map((msg, index) => {
            const isSenderstyle = msg.isResponderSender === isSender;
            return (
              <View key={index} style={[styles.messageContainer, isSenderstyle ? styles.senderMessage : styles.responderMessage]}>
                <Text style={styles.messageText}>{msg.messageBody}</Text>
                <Text style={styles.timestamp}>{new Date(msg.created).toLocaleTimeString()}</Text>
              </View>
            );
          })}
        </View>
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
  )
}

export default Chat;


const styles = StyleSheet.create({
    container: {
      backgroundColor: '#161622',
      flex: 1,
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
    //   marginRight: 20,
    //   marginTop: 25,
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
  });