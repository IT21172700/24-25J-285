import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';


const API_URL = "http://192.168.1.2:8000/predict"; // Change to your local API URL

export default function UploadScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<{ class: string; confidence: number } | null>(null);

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
      setPrediction(null); // Reset previous predictions
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
   // Function to get treatment recommendations based on prediction result
   const getTreatment = (disease: string) => {
    switch (disease) {
      case "Banana Black Sigatoka Disease":
        return {
          english: "1. Remove infected leaves and destroy them.\n" +
                   "2. Apply fungicides like mancozeb or propiconazole.\n" +
                   "3. Improve air circulation and reduce leaf wetness.\n" +
                   "4. Use resistant banana varieties when possible.",
          sinhala: "1. ආසාදිත කොළ ඉවත් කර විනාශ කරන්න.\n" +
                   "2. Mancozeb හෝ Propiconazole වැනි විෂබීජ නාශක යෙදීම.\n" +
                   "3. වාතය හොඳින් ගලා යාමට සහ කොළ තෙතමනය අඩු කරන්න.\n" +
                   "4. හැකි තරම් ප්‍රතිරෝධී කෙසෙල් වර්ග භාවිතා කරන්න."
        };
      case "Banana Panama Disease":
        return {
          english: "1. Use disease-free planting materials.\n" +
                   "2. Avoid moving infected plants to new areas.\n" +
                   "3. Maintain proper drainage to prevent waterlogging.\n" +
                   "4. Apply biological control methods where available.",
          sinhala: "1. රෝග රහිත පැල වගා කරන්න.\n" +
                   "2. ආසාදිත පැල නව ප්‍රදේශවලට ගෙන යාම වළක්වන්න.\n" +
                   "3. ජල ගැඹුර වැළැක්වීමට නිසි ජල නායාම ක්‍රමවේද පවත්වා ගන්න.\n" +
                   "4. ඇති ස්ථාන වල ජීව විෂබීජ පාලනයේ ක්‍රම යොදන්න."
        };
      case "Banana Healthy Leaf":
        return {
          english: "Your banana plant appears healthy! Keep monitoring and maintain proper irrigation, fertilization, and pest control practices.",
          sinhala: "ඔබේ කෙසෙල් පැල සෞඛ්‍ය සම්පන්නය! නිතර පරීක්ෂා කර නිසි ජලසන්ධානය, පොහොර යෙදීම සහ කෘමීන් පාලනය කරගෙන යන්න."
        };
      default:
        return {
          english: "No treatment information available.",
          sinhala: "චිකිත්සාව පිළිබඳ තොරතුරු ලබා ගැනීමට නොමැත."
        };
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Image */}
      {selectedImage ? (
        <Image source={{ uri: selectedImage }} style={styles.headerImage} />
      ) : (
        <Image source={require('@/assets/images/banana-leaf.jpg')} style={styles.headerImage} />
      )}

      {/* Disease Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>Banana Leaf Disease</Text>
        <Text style={styles.subTitle}>Check if your banana plant is infected</Text>
      </View>

      {/* Upload Button */}
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Select an Image</Text>
      </TouchableOpacity>

      {/* Predict Button */}
      {selectedImage && (
        <TouchableOpacity style={styles.predictButton} onPress={predictImage} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Analyze Disease</Text>}
        </TouchableOpacity>
      )}

      {/* Display Prediction Result */}
      {prediction && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Prediction Result</Text>
          <Text style={styles.diseaseName}>{prediction.class}</Text>
          <Text style={styles.confidence}>Confidence: {(prediction.confidence * 100).toFixed(2)}%</Text>
        </View>
      )}

      {/* Description Section */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionTitle}>Disease Information</Text>
        <Text style={styles.descriptionText}>
          Banana plants are prone to various diseases such as "Black Sigatoka", "Panama Disease" 
          . Early detection and proper management are crucial to prevent 
          significant crop loss and ensure healthy growth.
        </Text>

        {/* Sinhala Section */}
        <Text style={styles.descriptionTitle}>රෝග තොරතුරු</Text>
        <Text style={styles.descriptionText}>
          කෙසෙල් පැලවලට "Black Sigatoka", "Panama Disease" වැනි රෝග 
          දැඩිව බලපායි. ඉක්මන් අනාවරණය සහ නිසි කළමනාකරණය මඟින් විශාල භෝග හානිය අවම කළ හැකිය.
        </Text>
      </View>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  headerImage: {
    width: '100%',
    height: 220,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#228B22',
  },
  subTitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#228B22',
    paddingVertical: 14,
    marginHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  predictButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 14,
    marginHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 5,
  },
  diseaseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  confidence: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  descriptionContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
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


