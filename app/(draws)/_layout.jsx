
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Stack } from 'expo-router';
import { ScreenStackHeaderConfig } from 'react-native-screens';

export default function Layout() {
  return (
  
      <Stack
      screenOptions={
        {
          headerShown: true,
          headerTitle: 'AERS Emergency',
         
          headerBackImageSource: require('../../assets/images/logo.png'),
          headerTitleStyle:{
           fontSize: 24,
           fontFamily: 'comic sans ms'
          },
          headerStyle:{
            backgroundColor:'#161622',
            
                     
           
          },
          headerTintColor: '#ff8c00',
          headerTitleAlign:'left',
          

        }
       
      }
     >
        
        <Stack.Screen
          name="messages" 
          options={{
           
            headerShown: true
            
          
          }}
        />
         <Stack.Screen
          name="find" 
          options={{
          
           headerShown: false
            
          }}
        />
        <Stack.Screen
          name="analysis" 
          options={{
        
           headerShown: false
                      }}
        />
        <Stack.Screen
          name="settings" 
          options={{
            
           headerShown: false
                   }}
        />
        
        
       
       
      </Stack>
 
  );
}
