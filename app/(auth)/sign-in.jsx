import { Alert, ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { signIn } from '../../lib/appwrite'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FontAwesome } from '@expo/vector-icons'
import FormField from '../../components/FormField'
import CustomButton from '../../components/CustomButton'
import { Link, router } from 'expo-router'
import { useGlobalContext } from '../../context/GlobalProvider'



const SignIn = () => {
  const [form, setForm] = useState({
    email: '',
   
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { setEmail } = useGlobalContext();
  const submit = async () => {
    if (!form.email) {
      Alert.alert('Error', 'Please fill in all the fields!!')
      return; // Stop execution
    }
    setIsSubmitting(true)
    console.log("Submitting Sign-In with credentials:", form.email)

    try {
      await signIn(form.email)
      setEmail(form.email)
      console.log("Navigating to App")
      router.push('/dashboard')
      console.log("Navigation complete")
      // Navigate to the home page
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to sign in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
    <ImageBackground  style={styles.container} source={require('../../assets/images/background-mobile.png')} resizeMode="cover" >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>
            Sign In <FontAwesome size={28} name="sign-in" color="#FF9001" />
          </Text>

          <FormField
                      title="Email"
                      value={form.email}
                      handleChangeText={(e) => setForm({ ...form, email: e })}
                      otherStyles={styles.inputField}
                      keyboardType="email-address" placeholder={undefined}  />
         

          <CustomButton
                      title="Sign In"
                      handlePress={submit}
                      containerStyles={styles.button}
                      isLoading={isSubmitting} textStyles={undefined}/>
          <Link href="/sign-up" style={styles.link}>
            Don't have an account? Sign Up
          </Link>
          <Link href="/messages" style={styles.link}>
            HOME
          </Link>
        </View>
      </ImageBackground>
    </SafeAreaView>
  )
}

export default SignIn

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    height: 'auto'
   
  
  },
  contentContainer: {
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    height: '-50%',
    paddingHorizontal: 16,
    marginTop: 15,
    marginLeft:250,
    backgroundColor: '#161622',
    borderRadius:20,
    shadowColor: '#000',
    shadowOpacity: 0.7,
    shadowOffset: { width: 3, height: 7 },
    shadowRadius: 20,
    elevation: 13,
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    marginTop: 20,
  },
  inputField: {
    marginTop: 28,
    width: '100%',
  },
  button: {
    marginTop: 28,
    width: '100%',
  },
  link: {
    fontSize: 18,
    color: '#FF9001',
    marginTop: 12,
    textAlign: 'center',
  },
})
