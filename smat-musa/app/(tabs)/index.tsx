import React from 'react';
import { Image, StyleSheet, View, TouchableOpacity, Text, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C5E1A" />

      {/* Green Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>SMART MUSA</Text>
      </View>

      {/* Banana Leaf Image */}
      <Image source={require('@/assets/images/banana-leaf.jpg')} style={styles.heroImage} />

      {/* Title & Description */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Banana Leaf Disease</Text>
        <Text style={styles.subtitle}>

          You can upload your image and check whether the banana leaf is infected or not.
        </Text>
        <Text style={styles.sinhalaSubtitle}>
        කෙසෙල් කොළ රෝග හඳුනා ගැනීමේ මාර්ගය - ඔබේ කෙසෙල් කොළ රෝග හඳුනා ගැනීමට මෙම යෙදුම භාවිතා කරන්න.
      </Text>
      </View>

      {/* Upload Image Button */}
      <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/upload')}>
        <Text style={styles.buttonText}>Upload the Image</Text>
      </TouchableOpacity>

      {/* Description Section */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionTitle}>Description</Text>
        <Text style={styles.descriptionText}>
          Banana plants can suffer from various diseases such as **Black Sigatoka**, **Panama Disease**, 
          and **Yellow Leaf Spot**. Early detection is crucial to prevent significant crop loss.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    backgroundColor: '#2C5E1A',
    paddingVertical: 15,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  heroImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  textContainer: {
    padding: 15,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  button: {
    backgroundColor: '#2C5E1A',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'justify',
  },
});

export { HomeScreen };

