import CustomButton from "@/components/CustomButton";
import { useGlobalContext } from "@/context/GlobalProvider";
import { Link, Redirect, router } from "expo-router";
import React from "react";
import { Text, View, StyleSheet, Image, ImageBackground } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
//import 'react-native-polyfill-globals/auto';
import 'leaflet/dist/leaflet.css';



const App = () => {
  const {isLoading, isLoggedIn } = useGlobalContext();

  if(!isLoading && isLoggedIn) return <Redirect href='/find'/>

  return (
    
    <ImageBackground  style={styles.container} source={require('../assets/images/background-mobile.png')} resizeMode="cover" >

        <View style={styles.contentContainer}>
                  <Image source={require('../assets/images/logo.png')} resizeMode="contain" style={{width: 120, height: 100}}/>

    <CustomButton
          title="continue to App"
          handlePress={() => router.push('/sign-in')}
          containerStyles={styles.customButtonContainer}
          textStyles={styles.customButtonText} isLoading={undefined}          />
          <Link href="/find" style={styles.link}>
            Jump to locate
          </Link>
    </View>
    </ImageBackground>
  
  );
}
export default App

export const styles = StyleSheet.create({
  container: {
  
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    width: '100%',
    height: 'auto'
  },
 
  contentContainer: {
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    height: '90%',
    backgroundColor: '#161622',
    borderCurve:'circular',
    borderRadius: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
        shadowOpacity: 0.7,
        shadowOffset: { width: 3, height: 7 },
        shadowRadius: 20,
        elevation: 13,
  },
  title: {
    fontSize: 36,
    textAlign: 'center',
    color: 'red',
    fontFamily: 'Poppins-ExtraBold',
  },
  customButtonContainer: {
    backgroundColor: '#FF9001',
    borderRadius: 12,
    minHeight: 62,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 28,
  },
  customButtonText: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },
  link: {
    color: 'blue',
    marginTop: 12,
  },
});