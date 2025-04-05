from flask import Flask, request, jsonify, render_template, send_from_directory
import os
from werkzeug.utils import secure_filename
import numpy as np
from PIL import Image
import tensorflow as tf  # Or other library depending on your model type
import time
from tensorflow.keras.applications.efficientnet import preprocess_input
import requests
import traceback
import pandas as pd


app = Flask(__name__, static_folder='static')

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
MODEL_PATH = 'model/model.h5'  # Update this path to your model
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limit upload size to 16MB

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load the pretrained model
def load_model():
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        print("Model loaded successfully")
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

# Initialize model
model = load_model()

# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Preprocess image for the model
def preprocess_image(image_path):
    img = Image.open(image_path).convert('RGB')  # Ensure it's RGB
    img = img.resize((224, 224))
    img_array = np.array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)  # EfficientNet preprocessing
    return img_array

# Predict function
def predict_skin_condition(image_path):
    if model is None:
        return {"error": "Model not loaded"}
    
    try:
        # Preprocess the image
        processed_image = preprocess_image(image_path)
        
        # Get prediction
        prediction = model.predict(processed_image)
        
        # Example: Convert predictions to class names
        # Adjust this part based on your model's output format
        skin_conditions = [
    'Apple___Apple_scab',
    'Apple___Black_rot',
    'Apple___Cedar_apple_rust',
    'Apple___healthy',
    'Pepper__bell___Bacterial_spot',
    'Pepper__bell___healthy',
    'Potato___Early_blight',
    'Potato___Late_blight',
    'Potato___healthy',
    'Rice_Bacterial_blight',
    'Rice_Brown_spot',
    'Rice_Healthy',
    'Rice_Leaf_smut',
    'Tomato_Bacterial_spot',
    'Tomato_Early_blight',
    'Tomato_Late_blight',
    'Tomato_Leaf_Mold',
    'Tomato_Septoria_leaf_spot',
    'Tomato_Spider_mites_Two_spotted_spider_mite',
    'Tomato__Target_Spot',
    'Tomato__Tomato_YellowLeaf__Curl_Virus',
    'Tomato__Tomato_mosaic_virus',
    'Tomato_healthy'
]
        prediction_idx = np.argmax(prediction, axis=1)[0]
        confidence = float(prediction[0][prediction_idx] * 100)
        
        result = {
            "condition": skin_conditions[prediction_idx],
            "confidence": confidence,
            "all_probabilities": {cond: float(pred * 100) for cond, pred in zip(skin_conditions, prediction[0])}
        }
        
        return result
    except Exception as e:
        return {"error": str(e)} 
# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload.html')
def upload_page():
    return render_template('upload.html')

@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    # Check if a file was included in the request
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    # Check if file is empty
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    # Check file type
    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400
    
    try:
        # Save the file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Process with model
        result = predict_skin_condition(filepath)
        
        # Add image URL to result
        result["image_url"] = f"/uploads/{filename}"
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/weather.html')
def weather_page():
    return render_template('weather.html')

@app.route('/get_weather', methods=['POST'])
def get_weather():
    data = request.get_json()
    location = data.get('location')
    api_key = 'b5a508cec9e12e084b379b3cc64c83c1'  # Replace with your actual OpenWeatherMap API key

    if not location:
        return jsonify({'error': 'Location is required'}), 400

    try:
        # Step 1: Get latitude and longitude from city name
        geo_url = f'http://api.openweathermap.org/geo/1.0/direct?q={location}&limit=1&appid={api_key}'
        geo_response = requests.get(geo_url)
        geo_data = geo_response.json()

        if not geo_data:
            return jsonify({'error': 'City not found'}), 404

        lat = geo_data[0]['lat']
        lon = geo_data[0]['lon']

        # Step 2: Get climate forecast using lat/lon
        climate_url = f'https://pro.openweathermap.org/data/2.5/forecast/climate?lat={lat}&lon={lon}&appid={api_key}'
        climate_response = requests.get(climate_url)
        climate_data = climate_response.json()

        return jsonify(climate_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    



if __name__ == '__main__':
    app.run(debug=True)