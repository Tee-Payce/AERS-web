import { StyleSheet, Text, View, FlatList, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../../context/GlobalProvider';
import {  Query } from 'react-native-appwrite';
import { config, client, databases } from '../../lib/appwrite';
import { TouchableOpacity } from 'react-native-web';
import { useRouter } from 'expo-router';


const Messages = () => {
  const { user } = useGlobalContext();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
   if (!user?.$id) return;
 
    const fetchMessages = async () => {
      try {
        const response = await databases.listDocuments(
          config.databaseId,
          config.messageCollectionId,
          [Query.equal('responderId', user.$id)]
        );
        setMessages(response.documents);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user]);

  // Function to process messages: keeps latest & counts per sender
  const processMessages = (messages) => {
    const senderMap = new Map();

    messages.forEach((message) => {
      const senderId = message.userId.$id;

      if (!senderMap.has(senderId)) {
        senderMap.set(senderId, {
          ...message,
          count: 1,
        });
      } else {
        const existing = senderMap.get(senderId);
        senderMap.set(senderId, {
          ...message,
          count: existing.count + 1,
        });
      }
    });

    return Array.from(senderMap.values());
  };

  // Renders each sender's latest message with count
  const renderItem = ({ item }) => (
    <TouchableOpacity
     style={styles.messageContainer}
     onPress={() => {
            if (!user) {
              Alert.alert('Error', 'User not logged in. Please log in to continue.');
              return;
            }
            console.log('responder', user.$id);
            console.log('sender',item.userId.$id)
            const chatId = `${user.$id}_${item.userId.$id}`;
            router.push({
              pathname: `/${chatId}`,
              params: { responderId: user.$id, senderId: item.userId.$id},
            });
            console.log('chat',chatId)
          }}
     >
      <Text style={styles.sender}>From: {item.userId.fullName}</Text>
      <Text style={styles.message}>{item.messageBody}</Text>
      <Text style={styles.timestamp}>Sent at: {new Date(item.timestamp).toLocaleString()}</Text>
      <Text style={styles.count}>Messages Received: {item.count}</Text>
    </TouchableOpacity>
  );


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#ff8c00" />
      ) : messages.length === 0 ? (
        <Text style={styles.noMessages}>No messages found.</Text>
      ) : (
        <FlatList
        data={processMessages(messages)}
        renderItem={renderItem}
        keyExtractor={(item) => item.userId.$id}
      />
      )}
    </View>
  );
};

export default Messages;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#ff8c00',
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sender: {
    fontWeight: 'bold',
    color: '#333',
  },
  message: {
    fontSize: 16,
    marginVertical: 5,
  },
  timestamp: {
    fontSize: 12,
    color: 'gray',
  },
  noMessages: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  count: {
    fontSize: 14,
    color: '#ff4500',
    fontWeight: 'bold',
    marginTop: 5,
  },
});
