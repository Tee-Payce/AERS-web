import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Video } from 'expo-av';

const VideoReceiver = () => {
  const [videoUri, setVideoUri] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch('http://localhost:8085/upload');
        const data = await response.json();

        if (data.video) {
          setVideoUri(`data:video/mp4;base64,${data.video}`);
        }
      } catch (error) {
        console.error('Error fetching video:', error);
      }
    };

    fetchVideo();
  }, []);

  return (
    <View>
      <Text>Received Video:</Text>
      {videoUri ? (
        <Video
          source={{ uri: videoUri }}
          useNativeControls
          style={{ width: 300, height: 200 }}
        />
      ) : (
        <Text>No video received yet</Text>
      )}
    </View>
  );
};

export default VideoReceiver;
