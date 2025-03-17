import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';


const API_URL = "http://192.168.8.174:8000/predict"; // Change to your local API URL

export default function UploadScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<
  | {
      class: string;
      confidence: number;
      treatment?: {
        english?: string[];
        sinhala?: string[];
      };
    }
  | null
>(null);
  //const [showTreatment, setShowTreatment] = useState(false);

  // Function to pick an image from the gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setPrediction(null);
      //setShowTreatment(false); // Reset previous predictions
    }
  };

  // Function to send the image to the backend for prediction
  const predictImage = async () => {
    if (!selectedImage) {
      Alert.alert("No Image Selected", "Please select an image first.");
      return;
    }

    setLoading(true);
    
    let formData = new FormData();
    formData.append("file", {
      uri: selectedImage,
      name: "image.jpg",
      type: "image/jpeg",
    } as any);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const result = await response.json();
      setPrediction(result);
    } catch (error) {
      Alert.alert("Prediction Error", "Something went wrong with the API.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
   

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.mainTitle}>Banana Leaf Disease Diagnosis</Text>

      {selectedImage ? (
        <Image source={{ uri: selectedImage }} style={styles.previewImage} />
      ) : (
        <Image source={require('@/assets/images/banana-leaf.jpg')} style={styles.previewImage} />
      )}

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Select an Image</Text>
      </TouchableOpacity>

      {selectedImage && (
        <TouchableOpacity style={styles.predictButton} onPress={predictImage} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Analyze Disease</Text>}
        </TouchableOpacity>
      )}

      {prediction && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Prediction Result</Text>
          <Text style={styles.diseaseName}>{prediction.class}</Text>
          <Text style={styles.confidence}>Confidence: {(prediction.confidence * 100).toFixed(2)}%</Text>

          <Text style={styles.treatmentTitle}>Treatment Plan</Text>
          {prediction?.treatment?.english?.map((step: string, index: number) => (
  <Text key={index} style={styles.treatmentText}>{step}</Text>
))}

          <Text style={styles.treatmentTitle}>චිකිත්සා පියවර</Text>
          {prediction?.treatment && prediction.treatment.sinhala?.map((step: string, index: number) => (

  <Text key={index} style={styles.treatmentText}>{step}</Text>
))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 20,
  },
  previewImage: {
    width: '100%',
    height: 220,
    marginVertical: 10,
  },
  predictButton: {  // ✅ Fix: Add this style
    backgroundColor: '#FF8C00',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#228B22',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#228B22',
    textAlign: 'center',
    marginBottom: 5,
  },
  diseaseName: {  // ✅ Fix: Define this style
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D32F2F',
    textAlign: 'center',
  },
  confidence: {  // ✅ Fix: Define this style
    fontSize: 16,
    color: '#555',
    marginTop: 5,
    textAlign: 'center',
  },
  treatmentTitle: {  // ✅ Fix: Define this style
    fontSize: 18,
    fontWeight: 'bold',
    color: '#228B22',
    marginTop: 10,
  },
  treatmentText: {  // ✅ Fix: Define this style
    fontSize: 14,
    color: '#555',
    textAlign: 'left',
    marginBottom: 5,
  },
  mainTitle: {  // ✅ Fix: Add this style
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#228B22',
    marginVertical: 10,
  },
});
