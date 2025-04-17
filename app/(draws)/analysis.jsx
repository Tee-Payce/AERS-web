import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Sidebar from '../../components/Sidebar'
import { ImageBackground } from 'react-native-web'

const Analysis = () => {
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
      <Text>analysis</Text>
      </ImageBackground>
    </View>
    </View>
  )
}

export default Analysis

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
    alignItems: 'center',
    width: '100%',
    height: 'auto',
},
})