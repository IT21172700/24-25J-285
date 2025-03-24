import React, { useState , useEffect} from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
const API_URL = "http://192.168.43.229:8000/predict"; // Change to your local API URL

export default function UploadScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<
  | {
      class: string;
      confidence: number;
      gradcam_image?: string;
      treatment?: {
        english?: string[];
        sinhala?: string[];
      };
    }
  | null
>(null);
  //const [showTreatment, setShowTreatment] = useState(false);
// ✅ Load last saved prediction when app starts
useEffect(() => {
  const fetchLastPrediction = async () => {
    const lastPrediction = await loadPrediction();
    if (lastPrediction) {
      setPrediction(lastPrediction);
    }
  };
  fetchLastPrediction();
}, []);

// ✅ Save the last prediction to AsyncStorage
const savePrediction = async (prediction: any) => {
  await AsyncStorage.setItem('lastPrediction', JSON.stringify(prediction));
};

// ✅ Load last prediction from AsyncStorage
const loadPrediction = async () => {
  const storedPrediction = await AsyncStorage.getItem('lastPrediction');
  return storedPrediction ? JSON.parse(storedPrediction) : null;
};
  // Function to choose between Gallery or Camera
  const selectImageSource = () => {
    Alert.alert(
      "Select Image Source",
      "Choose an option",
      [
        { text: "Camera", onPress: () => pickImage("camera") },
        { text: "Gallery", onPress: () => pickImage("gallery") },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  // Function to pick an image from Camera or Gallery
  const pickImage = async (source: "camera" | "gallery") => {
    let result;
    if (source === "camera") {
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    }
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
      savePrediction(result); // ✅ Save the prediction for offline use
    } catch (error) {
      Alert.alert("Prediction Error", "Something went wrong with the API.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
   // Function for Sinhala Text-to-Speech
  const speakSinhala = (textArray?: string[]) => {
    if (textArray && textArray.length > 0) {
      const fullText = textArray.join(". "); // Join array into a single sentence
      Speech.stop();
      Speech.speak(fullText, { language: 'si-LK' });

    } else {
      Alert.alert("No Sinhala Treatment Available", "There is no treatment information to read.");
    }
  };

// Open WhatsApp with the disease information
const openWhatsApp = (disease: string) => {
  const phoneNumber = "+94771234567"; // Example agricultural officer
  const message = `Hello, I detected ${disease} on my banana plant. What should I do?`;
  Linking.openURL(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`);
};
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.mainTitle}>🍌 Banana Leaf Disease Diagnosis</Text>

      {selectedImage ? (
        <Image source={{ uri: selectedImage }} style={styles.previewImage} />
      ) : (
        <Image source={require('@/assets/images/banana-leaf.jpg')} style={styles.previewImage} />
      )}

<TouchableOpacity style={styles.button} onPress={() => selectImageSource()}>

        <Text style={styles.buttonText}>📷 Select an Image</Text>
      </TouchableOpacity>

      {selectedImage && (
        <TouchableOpacity style={styles.predictButton} onPress={predictImage} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>🔍 Analyze Disease</Text>}
        </TouchableOpacity>
      )}

{prediction && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>🔬 Prediction Result</Text>
          <Text style={styles.diseaseName}>{prediction.class}</Text>
          <Text style={styles.confidence}>Confidence: {(prediction.confidence * 100).toFixed(2)}%</Text>

          <Text style={styles.treatmentTitle}>🩺 Treatment Plan</Text>

          {prediction?.treatment?.english?.map((step: string, index: number) => (
            <Text key={index} style={styles.treatmentText}>• {step}</Text>

            
          ))}
         <Text style={styles.treatmentTitle}>🩺 චිකිත්සා පියවර</Text>
          {prediction?.treatment?.sinhala?.map((step: string, index: number) => (
            <Text key={index} style={styles.treatmentText}>• {step}</Text>
          ))}
        {/* ✅ Fix: Text-to-Speech Button for Sinhala */}
        <TouchableOpacity style={styles.speakButton} onPress={() => speakSinhala(prediction?.treatment?.sinhala)}>
            <Text style={styles.speakButtonText}>🔊 Listen to Sinhala Treatment</Text>
          </TouchableOpacity>
       {/* WhatsApp Contact Button */}
       <TouchableOpacity style={styles.whatsappButton} onPress={() => openWhatsApp(prediction.class)}>
            <Text style={styles.whatsappText}>📩 Contact an Expert</Text>
          </TouchableOpacity>

           {/* Display Grad-CAM Heatmap */}
           {prediction.gradcam_image && (
          <Image 
          source={{ uri: prediction.gradcam_image + '?t=' + new Date().getTime() }} 
          style={{ width: 300, height: 300 }} 
          onError={(e) => console.log("Error loading image:", e.nativeEvent)}
        />
        
         
         
         
         
         

          )}
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
  heatmapImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginTop: 12,
  },
  
  previewImage: {
    width: '100%',
    height: 240,
    marginVertical: 12,
    borderRadius: 10,
  },
  predictButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  button: {
    backgroundColor: '#228B22',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultContainer: {
    padding: 18,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    marginTop: 24,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#228B22',
    textAlign: 'center',
    marginBottom: 10,
  },
  diseaseName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D32F2F',
    textAlign: 'center',
    marginVertical: 5,
  },
  confidence: {
    fontSize: 18,
    color: '#555',
    marginTop: 8,
    textAlign: 'center',
  },
  treatmentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#228B22',
    marginTop: 12,
  },
  treatmentText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'left',
    lineHeight: 24, // ✅ Increased readability
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 26,  // ✅ Increased size
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#228B22',
    marginVertical: 15,
  },
  speakButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  speakButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  speakText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  whatsappText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
