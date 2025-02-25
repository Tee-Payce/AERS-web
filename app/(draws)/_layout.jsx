import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { cloneElement } from 'react';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer  
      screenOptions={{
        drawerStyle:{
            backgroundColor:'#161622',
            borderTopWidth: 1,
          borderTopColor: '#232533',
          marginBottom:10,
          padding: 20,
          justifyContent: 'center',
          alignContent: 'center'
        },
        drawerActiveBackgroundColor:'#ff8c00',
        drawerInactiveTintColor:'#fffe',
        drawerInactiveBackgroundColor:'#161630',
        drawerActiveTintColor:'#fff',
        drawerLabelStyle: {
          fontSize: 14,
          alignItems:'center',
          justifyContent:'center',
         
        },
       headerStyle:{
        backgroundColor:'#161622',
       

       },
       headerTintColor: '#ff8c00'
      }}
      >
        
        <Drawer.Screen
          name="messages" 
          options={{
            drawerLabel: 'Messages',
            title: 'Messages',
            drawerIcon: ({ color }) => (
            <FontAwesome size={28} name="comments-o" color={color} />
          ),
          
          }}
        />
         <Drawer.Screen
          name="find" 
          options={{
            drawerLabel: 'Find',
            title: 'Find',
            drawerIcon: ({ color }) => (
            <FontAwesome size={34} name="map-marker" color={color} />
          ),
          }}
        />
        <Drawer.Screen
          name="settings" 
          options={{
            drawerLabel: 'Settings',
            title: 'Settings',
            drawerIcon: ({ color }) => (
            <FontAwesome size={28} name="wrench" color={color} />
          ),
          }}
        />
        <Drawer.Screen
          name="[chatId]" 
          options={{
            drawerLabel: '',
            title: 'Chat',
            
          }}
        />
        <Drawer.Screen
          name="modal" 
          options={{
            presentation: 'transparentModal',
          animation: 'fade',
          headerShown: false,
            title: 'Video Playback',
            
          }}
        />
       
      </Drawer>
    </GestureHandlerRootView>
  );
}
