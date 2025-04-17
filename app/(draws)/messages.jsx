import { StyleSheet, Text, View, FlatList, ActivityIndicator, Alert, ImageBackground } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../../context/GlobalProvider';
import { Query } from 'react-native-appwrite';
import { config, databases } from '../../lib/appwrite';
import { TouchableOpacity } from 'react-native-web';
import { useRouter } from 'expo-router';
import Sidebar from '../../components/Sidebar';


const Messages = ({children}) => {
  const { user } = useGlobalContext();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to fetch messages
  const fetchMessages = async () => {
    if (!user?.$id) return;

    try {
      const response = await databases.listDocuments(
        config.databaseId,
        config.messageCollectionId,
        [Query.equal('responderId', user.$id)]
      );
      setMessages(response.documents);
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    fetchMessages();
  }, [user]);

  // Polling to fetch messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Fetching messages...');
      fetchMessages();
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval); // Cleanup when unmounted
  }, [user]);

  // Process messages to group by sender and count messages
  const processMessages = (messages) => {
    if (!Array.isArray(messages)) return [];
  
    const senderMap = new Map();
  
    messages.forEach((message) => {
      const senderId = message.userId?.$id;
      if (!senderId) return;
  
      const existing = senderMap.get(senderId);
  
      if (existing) {
        existing.count += message.isRead ? 0 : 1;
        if (new Date(message.created) > new Date(existing.latest)) {
          existing.latest = message.created;
          existing.messageBody = message.messageBody;
        }
      } else {
        senderMap.set(senderId, {
          ...message,
          count: message.isRead ? 0 : 1,
          latest: message.created,
        });
      }
    });
  
    return Array.from(senderMap.values()).sort(
      (a, b) => new Date(b.latest) - new Date(a.latest)
    );
  };
  

  // Renders each sender's latest message with count
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.messageContainer}
      onPress={async () => {
        if (!user) {
          Alert.alert('Error', 'User not logged in.');
          return;
        }
      
        const senderId = item.userId.$id;
        const chatId = `${user.$id}_${senderId}`;
      
        // Clear unread messages
        const unreadMessages = messages.filter(
          (msg) => msg.userId?.$id === senderId && !msg.isRead
        );
      
        for (const msg of unreadMessages) {
          try {
            await databases.updateDocument(
              config.databaseId,
              config.messageCollectionId,
              msg.$id,
              { isRead: true }
            );
          } catch (err) {
            console.error('⚠️ Failed to mark message as read:', err);
          }
        }
      
        router.push({
          pathname: `/${chatId}`,
          params: {
            responderId: user.$id,
            senderId,
            senderName: item.userId.fullName || 'Unknown',
          },
        });
      }}
      
    >
     <View style={styles.cardStyle}> 
      <Text style={styles.sender}>From: {item.userId.fullName || 'Unknown'}</Text>
      <Text style={styles.message}>{item.messageBody || 'No message content'}</Text>
      <Text style={styles.timestamp}>Sent at: {new Date(item.created).toLocaleString()}</Text>
      </View>
      {item.count > 0 && (
  <TouchableOpacity style={{ width: 30, marginTop: 5, backgroundColor:'#ff8c00', borderRadius:'50%', height: 30, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={styles.count}>{item.count}</Text>
  </TouchableOpacity>
)}

    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
    {/* Sidebar Section */}
    <View style={styles.sidebarContainer}>
        <Sidebar />
    </View>
         {/* Content Section */}
                      <View style={styles.contentContainer}>
                      <ImageBackground 
                                          style={styles.background} 
                                          source={require('../../assets/images/background-mobile-45.png')} 
                                          resizeMode="cover"
                                      >
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

    </ImageBackground>
    </View>

    </View>
  );
};

export default Messages;

const styles = StyleSheet.create({
 container: {
        flex: 1,
        flexDirection: 'row', // Sidebar & content adjacent
        width: '100%',
        height: '100vh',
    },
    sidebarContainer: {
        width: 250, // Fixed sidebar width
        backgroundColor: '#1E1E2D',
    },
    contentContainer: {
        flex: 1, // Take remaining space
        flexDirection: 'column', 
    },
    background: {
        flex: 1,
        justifyContent: 'center',
        padding:20, 
        width: '100%',
        height: 'auto',
    },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#ff8c00',
  },
  messageContainer: {
    flexDirection: 'row',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'space-between'
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
  cardStyle:{
    flexDirection:'column',
    alignSelf:'flex-start'
  },
  count: {
   marginRight: 2,
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
   
  },
});
