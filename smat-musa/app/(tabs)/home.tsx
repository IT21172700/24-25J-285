import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { NavigationProp } from "@react-navigation/native";

type HomeScreenProps = {
  navigation: NavigationProp<any>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {

  return (
    <LinearGradient colors={['#FDEAB0', '#A6D49F']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* App Logo */}
      <Image source={require('../../assets/images/logo (3).png')} style={styles.logo} />
      
      {/* App Title */}
      <Text style={styles.title}>Smart Musa</Text>
      <Text style={styles.subtitle}>Revolutionizing Banana Leaf Disease Detection</Text>
      
      {/* Illustration Image */}
      <Image source={require('../../assets/images/banana-leaf.jpg')} style={styles.heroImage} />
      
      {/* Get Started Button */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Upload')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C5E1A',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#4A4A4A',
    textAlign: 'center',
    marginBottom: 20,
  },
  heroImage: {
    width: 300,
    height: 200,
    borderRadius: 20,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#2C5E1A',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
