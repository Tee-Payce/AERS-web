import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import GlobalProvider from '../context/GlobalProvider';
import { StatusBar } from 'expo-status-bar';
import "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  // const [fontsLoaded] = useFonts({
  //   DMBold: require('../assets/fonts/DMSans-Bold.ttf'),
  //   DMMedium: require('../assets/fonts/DMSans-Medium.ttf'),
  //   DMRegular: require('../assets/fonts/DMSans-Regular.ttf'),
  // });

  // useEffect(() => {
  //   if (fontsLoaded) {
  //     SplashScreen.hideAsync();
  //   }
  // }, [fontsLoaded]);

  // if (!fontsLoaded) {
  //   return null;
  // }

  return (
    <GlobalProvider>
    <Stack
    screenOptions={
        {
          headerShown: true,
          headerTitle: 'AERS Emergency',
         
          headerBackImageSource: require('../assets/images/logo.png'),
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
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ headerShown: true }} />

      <Stack.Screen name='(draws)' options={{headerShown: false}}/>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen
          name="modal" 
          options={{
            presentation: 'transparentModal',
          animation: 'fade',
          headerShown: false,
            title: 'Video Playback',
            
          }}
        />
    </Stack>
    <StatusBar style='dark'/>
    </GlobalProvider>
  );
};

export default RootLayout;
