import { Video } from 'expo-av';
import { Link, router } from 'expo-router';
import { useSearchParams } from 'expo-router/build/hooks';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useRef } from 'react';
import { FontAwesome } from '@expo/vector-icons';

export default function Modal() {
  const isPresented = router.canGoBack();
  const params = useSearchParams();
  const videoUrl = params.get('videoUrl');
  console.log('videoUri:', videoUrl);

  const videoRef = useRef(null);

  return (
    <Animated.View
      entering={FadeIn}
      style={styles.overlay}
    >
      {/* Dismiss modal when pressing outside */}
      <Link href={'../'} asChild>
        <Pressable style={StyleSheet.absoluteFill} pointerEvents="box-none" />
      </Link>

      <Animated.View entering={SlideInDown} style={styles.modal}>
       
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={styles.video}
            useNativeControls
            resizeMode="cover" // Ensure full visibility of video
            shouldPlay
            isLooping
          />
        

        {isPresented && <Link href="../" style={styles.dismiss}>Dismiss Video <FontAwesome name='times' size={16}/></Link>}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000080', // Semi-transparent background
  },
  modal: {
    width: '90%',
    height: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161622',
    borderRadius: 10,
    padding: 10,
  },
  video: {
    width: '95%', // Ensure it fills the modal width
    height: '95%', // Make it fill the height as well
  },
  dismiss: {
    color: '#ff8c00',
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});
