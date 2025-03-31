# from fastapi import FastAPI, File, UploadFile
# from fastapi.middleware.cors import CORSMiddleware
# import uvicorn
# import numpy as np
# from io import BytesIO
# from PIL import Image
# import tensorflow as tf

# # Initialize FastAPI app
# app = FastAPI()

# # CORS settings
# origins = [
#     "http://localhost",
#     "http://localhost:3000",
# ]
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Load the model
# MODEL = tf.keras.models.load_model("../saved_models/1/banana.keras")  # Update model path

# # Define class names
# class_names = [
#     "Banana Black Sigatoka Disease",
#     "Banana Healthy Leaf",
#     "Banana Panama Disease",
# ]

# @app.get("/ping")
# async def ping():
#     return {"message": "Hello, I am alive"}

# # Function to process uploaded image
# def read_file_as_image(data) -> np.ndarray:
#     image = np.array(Image.open(BytesIO(data)).convert("RGB"))
#     image = tf.image.resize(image, (256, 256))  # Resize to match model input size
#     image = image / 255.0  # Normalize pixel values
#     # Save after normalization
#     np.save("debug_normalized.npy", image.numpy())
#     return image

# @app.post("/predict")
# async def predict(file: UploadFile = File(...)):
#     # Read and preprocess the image
#     image = read_file_as_image(await file.read())
#     img_batch = np.expand_dims(image, axis=0)  # Add batch dimension

#     # Make predictions
#     predictions = MODEL.predict(img_batch)
#     print("Raw predictions:", predictions)  # Debugging line

#     predicted_class_index = np.argmax(predictions[0])
#     predicted_class = class_names[predicted_class_index]
#     confidence = np.max(predictions[0])

#     # Print class probabilities for debugging
#     for idx, class_name in enumerate(class_names):
#         print(f"{class_names}: {predictions[0][idx]:.4f}")

#     return {
#         "class": predicted_class,
#         "confidence": float(confidence),
#     }

# if __name__ == "__main__":
#     uvicorn.run(app, host="localhost", port=8000)

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
import cv2
import matplotlib.pyplot as plt
import os

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8081",  # ✅ Allow web frontend
    "http://192.168.1.10:8081",  # ✅ Allow frontend via IP
    "http://192.168.1.10:8000"  # ✅ Allow self-access
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure the correct model path
MODEL_PATH = "C:/Users/ACER/OneDrive/Documents/banana/saved_models/12/banana_model.keras"

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found at path: {MODEL_PATH}")

# Load the model
MODEL = tf.keras.models.load_model(MODEL_PATH, compile=False)

class_names = ["Banana Black Sigatoka Disease", "Banana Healthy Leaf", "Banana Panama Disease"]


@app.get("/ping")
async def ping():
    return "Hello, I am alive"



def read_file_as_image(data) -> np.ndarray:
    image = Image.open(BytesIO(data)).convert("RGB")  # Open and convert to RGB
    image = image.resize((256, 256))  # ✅ Resize image to match model input shape
    image = np.array(image)   # Normalize pixel values (0-1)
    return image


# Disease treatment dictionary
disease_treatments = {
    "Banana Black Sigatoka Disease": {
        "english": [
            "1. Remove infected leaves and destroy them to reduce spore sources.",
            "2. Apply fungicides like mancozeb or propiconazole on a regular schedule, alternating between different fungicide groups to prevent resistance.",
            "3. Improve air circulation through proper plant spacing and reduce leaf wetness with improved drainage.",
            "4. Use resistant banana varieties like FHIA-17 or FHIA-23 when possible.",
            "5. Maintain weed-free areas around plants to improve air flow.",
            "6. Implement early warning systems to detect disease before widespread infection occurs.",
            "7. Ensure proper plant nutrition with balanced fertilization to increase plant resistance."
        ],
        "sinhala": [
            "1. ආසාදිත කොළ ඉවත් කර විනාශ කරන්න, එමඟින් බීජාණු ප්‍රභවයන් අඩු කරන්න.",
            "2. Mancozeb හෝ Propiconazole වැනි දිලීර නාශක නිතිපතා යෙදීම, ප්‍රතිරෝධතාවය වැළැක්වීමට විවිධ දිලීර නාශක කණ්ඩායම් මාරුවෙන් මාරුවට යොදන්න.",
            "3. නිසි පැළ පරතරය තුළින් වාතය හොඳින් ගලා යාමට සහ වැඩිදියුණු කළ ජලාපවහනය සමඟ කොළ තෙතමනය අඩු කරන්න.",
            "4. FHIA-17 හෝ FHIA-23 වැනි ප්‍රතිරෝධී කෙසෙල් වර්ග හැකි විට භාවිතා කරන්න.",
            "5. වාතය ගලා යාම වැඩිදියුණු කිරීමට පැළ වටා වල් පැළෑටි නොමැති ප්‍රදේශ පවත්වාගෙන යන්න.",
            "6. පුළුල් ලෙස ආසාදනය වීමට පෙර රෝගය හඳුනා ගැනීමට පූර්ව අනතුරු ඇඟවීමේ පද්ධති ක්‍රියාත්මක කරන්න.",
            "7. පැළවල ප්‍රතිරෝධක හැකියාව වැඩි කිරීමට සමතුලිත පොහොර යෙදීම සමඟ නිසි පැළ පෝෂණය සහතික කරන්න."
        ]
    },
    "Banana Panama Disease": {
        "english": [
            "1. Use certified disease-free planting materials from trusted agricultural authorities.",
            "2. Implement strict quarantine measures - avoid moving soil or plants from infected areas and disinfect tools, equipment, and footwear.",
            "3. Maintain proper drainage and soil management to prevent waterlogging and raise soil pH where appropriate.",
            "4. Apply biological control methods like Trichoderma spp. and organic amendments that promote beneficial soil microbes.",
            "5. For severe infections, consider leaving land fallow or planting non-host crops for several years.",
            "6. Plant resistant varieties (particularly against Tropical Race 4) where available.",
            "7. Avoid wounding plants during cultivation to prevent entry points for the pathogen."
        ],
        "sinhala": [
            "1. විශ්වාසදායක කෘෂිකාර්මික අධිකාරීන්ගෙන් සහතික කළ රෝග රහිත පැළ ද්‍රව්‍ය භාවිතා කරන්න.",
            "2. දැඩි නිරෝධායන පියවර ක්‍රියාත්මක කරන්න - ආසාදිත ප්‍රදේශවලින් පස හෝ පැළ ගෙන යාමෙන් වළකින්න, මෙවලම්, උපකරණ සහ පාවහන් විෂබීජහරණය කරන්න.",
            "3. ජල ගැලීම වැළැක්වීමට නිසි ජලාපවහනය සහ පස කළමනාකරණය පවත්වා ගෙන යන්න, සුදුසු තැන්වල පසේ pH අගය ඉහළ නැංවීමට හුණු යොදන්න.",
            "4. Trichoderma spp. වැනි ජීව විද්‍යාත්මක පාලන ක්‍රම සහ ප්‍රයෝජනවත් පාංශු ක්ෂුද්‍ර ජීවීන් ප්‍රවර්ධනය කරන කාබනික සංයෝජන යොදන්න.",
            "5. දරුණු ආසාදන සඳහා, වසර කිහිපයක් සඳහා ඉඩම් හිස්ව තැබීම හෝ ආශ්‍රිත නොවන බෝග වගා කිරීම සලකා බලන්න.",
            "6. ලබා ගත හැකි තැන්වල ප්‍රතිරෝධී ප්‍රභේද (විශේෂයෙන් ට්‍රොපිකල් රේස් 4 වලට එරෙහිව) සිටුවන්න.",
            "7. රෝග කාරකයට ඇතුළු වීමේ ස්ථාන වැළැක්වීම සඳහා වගාව අතරතුර පැළ තුවාල කිරීමෙන් වළකින්න."
        ]
    },
    "Banana Healthy Leaf": {
        "english": [
            "Your banana plant appears healthy! Continue these practices to maintain health:",
            "1. Maintain proper irrigation schedules - water deeply but infrequently to encourage deep root growth.",
            "2. Apply balanced fertilization with appropriate N-P-K ratios for each growth stage.",
            "3. Implement regular pest monitoring and integrated pest management practices.",
            "4. Prune excess suckers, leaving only 1-2 strong followers per mat.",
            "5. Remove old, dead leaves and maintain good field sanitation.",
            "6. Apply mulch to conserve moisture and suppress weeds.",
            "7. Conduct regular visual inspections for early disease detection."
        ],
        "sinhala": [
            "ඔබේ කෙසෙල් පැළ සෞඛ්‍ය සම්පන්නයි! සෞඛ්‍ය තත්ත්වය පවත්වා ගැනීම සඳහා මෙම භාවිතයන් දිගටම කරගෙන යන්න:",
            "1. නිසි වාරි ජල කාලසටහන් පවත්වා ගන්න - ගැඹුරු මුල් වර්ධනය දිරිමත් කිරීම සඳහා ගැඹුරින් නමුත් කලාතුරකින් ජලය දෙන්න.",
            "2. එක් එක් වර්ධන අදියර සඳහා සුදුසු N-P-K අනුපාත සහිත සමතුලිත පොහොර යෙදීම සිදු කරන්න.",
            "3. නිතිපතා පළිබෝධ නිරීක්ෂණය සහ සමන්විත පළිබෝධ කළමනාකරණ භාවිතයන් ක්‍රියාත්මක කරන්න.",
            "4. අතිරික්ත පැළ ඉවත් කරන්න, එක් පැළයක ශක්තිමත් අනුගාමිකයින් 1-2 ක් පමණක් තබා ගන්න.",
            "5. පැරණි, මළ කොළ ඉවත් කර හොඳ ක්ෂේත්‍ර සනීපාරක්ෂාව පවත්වා ගන්න.",
            "6. තෙතමනය සංරක්ෂණය කිරීමට සහ වල් පැළෑටි මැඩපැවැත්වීමට වසුන් යොදන්න.",
            "7. රෝග කල් තියා හඳුනා ගැනීම සඳහා නියමිත කාලීනව දෘශ්‍ය පරීක්ෂා සිදු කරන්න."
        ]
    },
}
# Function to generate Grad-CAM heatmap
# Function to generate Grad-CAM heatmap
def generate_gradcam(model, img_array, last_conv_layer_name=None):
    """
    Generates a Grad-CAM heatmap.
    
    :param model: Trained TensorFlow/Keras model
    :param img_array: Preprocessed input image
    :param last_conv_layer_name: Name of the last convolutional layer
    :return: heatmap (numpy array), predicted_class_index (int)
    """
    if last_conv_layer_name is None:
        # Automatically detect the last convolutional layer
        for layer in reversed(model.layers):
            if isinstance(layer, tf.keras.layers.Conv2D):
                last_conv_layer_name = layer.name
                break

    grad_model = tf.keras.models.Model(
        inputs=[model.input],
        outputs=[model.get_layer(last_conv_layer_name).output, model.output]
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(np.expand_dims(img_array, axis=0))
        predicted_class_index = np.argmax(predictions[0])
        loss = predictions[:, predicted_class_index]
        tape.watch(conv_outputs)

    grads = tape.gradient(loss, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0].numpy()  # Convert tensor to NumPy array
    pooled_grads = pooled_grads.numpy()  # Convert tensor to NumPy array

    # Apply pooled grads to conv outputs
    for i in range(pooled_grads.shape[-1]):
        conv_outputs[:, :, i] *= pooled_grads[i]

    heatmap = np.mean(conv_outputs, axis=-1)
    heatmap = np.maximum(heatmap, 0)  # ReLU activation
    heatmap /= np.max(heatmap)  # Normalize between 0 and 1

    return heatmap, predicted_class_index


# Function to overlay Grad-CAM heatmap on input image
def apply_heatmap(image, heatmap, alpha=0.4):
    heatmap = cv2.resize(heatmap, (image.shape[1], image.shape[0]))  # Resize to match input image
    heatmap = np.uint8(255 * heatmap)  # Scale heatmap to 0-255
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)  # Apply colormap

    # Overlay heatmap on the original image
    superimposed_img = cv2.addWeighted(image, 1 - alpha, heatmap, alpha, 0)
    return superimposed_img

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_data = await file.read()
    
    # Debugging: Save received image with a timestamp
    import time
    timestamp = int(time.time())  # Unique timestamp
    received_image_filename = f"received_image_{timestamp}.jpg"
    with open(received_image_filename, "wb") as f:
        f.write(image_data)

    print(f"✅ New Image Received: {received_image_filename}")

    image = read_file_as_image(image_data)
    img_batch = np.expand_dims(image, axis=0)

    predictions = MODEL.predict(img_batch)
    predicted_class_index = np.argmax(predictions[0])
    predicted_class = class_names[predicted_class_index]
    confidence = np.max(predictions[0])
# Get treatment based on prediction
    treatment = disease_treatments.get(predicted_class, {})
    print(f"🔍 Prediction: {predicted_class} (Confidence: {confidence:.2f})")
    # Convert input image back to uint8 (0-255) for heatmap overlay
    input_image_uint8 = (image * 255).astype(np.uint8)

    # Generate Grad-CAM heatmap
    heatmap, _ = generate_gradcam(MODEL, image)

    # Apply Grad-CAM overlay
    gradcam_image = apply_heatmap(input_image_uint8, heatmap)

    # Save Grad-CAM image
    import time
    timestamp = int(time.time())  # Unique timestamp
    gradcam_filename = f"gradcam_result_{timestamp}.jpg"
    cv2.imwrite(gradcam_filename, cv2.cvtColor(gradcam_image, cv2.COLOR_RGB2BGR))


    print(f"✅ New Grad-CAM Image Saved: {gradcam_filename}")
    return {
        'class': predicted_class,
        'confidence': float(confidence),
        "gradcam_image": f"http://192.168.1.10:8000/gradcam/{gradcam_filename}",
        "treatment": disease_treatments.get(predicted_class, {"english": ["No treatment available"], "sinhala": ["චිකිත්සා ලබා නොමැත"]})
    }

# Endpoint to Serve Grad-CAM Images
@app.get("/gradcam/{filename}")
async def get_gradcam_image(filename: str):
    file_path = f"./{filename}"  # Ensure this matches where the image is saved
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="image/jpeg")
    return {"error": "File not found"}

if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)