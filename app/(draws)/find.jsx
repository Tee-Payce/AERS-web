import { StyleSheet, Text, View } from 'react-native'
import React from 'react';
import {Link} from 'expo-router';

const Find = () => {
  return (
    <View>
    <Link href='/modal' >go to modal</Link>
      <Text>Find</Text>
    </View>
  )
}

export default Find;

const styles = StyleSheet.create({})