import { StyleSheet, Text, View, Platform, ActivityIndicator, ImageBackground } from 'react-native';
import React, { useState,useEffect } from 'react';
import { Link } from 'expo-router';
import Sidebar from '../../components/Sidebar';

// import MapContainer from '../../components/Map';

const Find = ({ children }) => {
    const [isWeb, setIsWeb] = useState(false);

    useEffect(() => {
        // Check if we're on web platform after component mounts
        setIsWeb(Platform.OS === 'web');
    }, []);

    const MapComponent = React.useMemo(() => {
        if (isWeb) {
            return React.lazy(() => import('../../components/Map'));
        }
        return () => null;
    }, [isWeb]);


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
                    {isWeb ? (
                        <React.Suspense fallback={<ActivityIndicator size="large" color="#ff8c00" />}>
                            <View style={styles.mapContainer}>
                                <MapComponent />
                            </View>
                        </React.Suspense>
                    ) : (
                        <View style={styles.mapContainer}>
                            <Text>Map not available on this platform</Text>
                        </View>
                    )}
                </ImageBackground>
            </View>
        </View>
    );
};

export default Find;

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
        shadowColor: '#ff8c00',
        shadowOpacity: 0.7,
        shadowOffset: { width: 4, height: 2 },
        shadowRadius: 4,
        elevation: 3,
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
    mapContainer: {
        width: '100%',
        height: 550, // Adjust map height as needed
    }
});
