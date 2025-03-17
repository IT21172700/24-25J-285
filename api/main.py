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
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8081",  # ✅ Allow web frontend
    "http://192.168.8.174:8081",  # ✅ Allow frontend via IP
    "http://192.168.8.174:8000"  # ✅ Allow self-access
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL = tf.keras.models.load_model("../saved_models/3/banana.keras")


class_names = ["Banana Black Sigatoka Disease", "Banana Healthy Leaf", "Banana Panama Disease"]


@app.get("/ping")
async def ping():
    return "Hello, I am alive"



def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))
    return image

# Disease treatment dictionary
disease_treatments = {
    "Banana Black Sigatoka Disease": {
        "english": [
            "1. Remove infected leaves and destroy them.",
            "2. Apply fungicides like mancozeb or propiconazole.",
            "3. Improve air circulation and reduce leaf wetness.",
            "4. Use resistant banana varieties when possible."
        ],
        "sinhala": [
            "1. ආසාදිත කොළ ඉවත් කර විනාශ කරන්න.",
            "2. Mancozeb හෝ Propiconazole වැනි විෂබීජ නාශක යෙදීම.",
            "3. වාතය හොඳින් ගලා යාමට සහ කොළ තෙතමනය අඩු කරන්න.",
            "4. හැකි තරම් ප්‍රතිරෝධී කෙසෙල් වර්ග භාවිතා කරන්න."
        ]
    },
    "Banana Panama Disease": {
        "english": [
            "1. Use disease-free planting materials.",
            "2. Avoid moving infected plants to new areas.",
            "3. Maintain proper drainage to prevent waterlogging.",
            "4. Apply biological control methods where available."
        ],
        "sinhala": [
            "1. රෝග රහිත පැල වගා කරන්න.",
            "2. ආසාදිත පැල නව ප්‍රදේශවලට ගෙන යාම වළක්වන්න.",
            "3. ජල ගැඹුර වැළැක්වීමට නිසි ජල නායාම ක්‍රමවේද පවත්වා ගන්න.",
            "4. ඇති ස්ථාන වල ජීව විෂබීජ පාලනයේ ක්‍රම යොදන්න."
        ]
    },
    "Banana Healthy Leaf": {
        "english": [
            "Your banana plant appears healthy! Maintain proper irrigation, fertilization, and pest control practices."
        ],
        "sinhala": [
            "ඔබේ කෙසෙල් පැල සෞඛ්‍ය සම්පන්නය! නිතර පරීක්ෂා කර නිසි ජලසන්ධානය, පොහොර යෙදීම සහ කෘමීන් පාලනය කරගෙන යන්න."
        ]
    }
}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_data = await file.read()
    
    # Save the received image for debugging
    with open("received_image.jpg", "wb") as f:
        f.write(image_data)

    image = read_file_as_image(image_data)
    img_batch = np.expand_dims(image, axis=0)

    predictions = MODEL.predict(img_batch)
    predicted_class_index = np.argmax(predictions[0])
    predicted_class = class_names[predicted_class_index]
    confidence = np.max(predictions[0])
# Get treatment based on prediction
    treatment = disease_treatments.get(predicted_class, {})
    return {
        'class': predicted_class,
        'confidence': float(confidence),
        "treatment": disease_treatments.get(predicted_class, {"english": ["No treatment available"], "sinhala": ["චිකිත්සා ලබා නොමැත"]})
    }



if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)