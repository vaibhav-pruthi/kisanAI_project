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
import json


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

# Load plant data
def load_plant_data():
    # This would typically be loaded from a database or file
    # For now, we'll use the same data as in the HTML file
    plant_data = {
      "tomato": {
        "name": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "water_needs": "medium-high",
        "water_frequency": {
          "seedling": {"days": 1, "amount_ml": 200},
          "vegetative": {"days": 2, "amount_ml": 400},
          "flowering": {"days": 2, "amount_ml": 600},
          "fruiting": {"days": 1, "amount_ml": 800}
        },
        "temperature_factor": {
          "low": 0.7,    
          "optimal": 1,  
          "high": 1.5    
        },
        "humidity_factor": {
          "low": 1.3,    
          "medium": 1,   
          "high": 0.7    
        },
        "soil_type_factor": {
          "sandy": 1.3,
          "loamy": 1.0,
          "clay": 0.8
        },
        "growth_info": {
          "days_to_maturity": 70,
          "ideal_temp_range": "18-29°C",
          "ideal_soil_ph": "6.0-6.8"
        }
      },
      "potato": {
        "name": "Potato",
        "scientific_name": "Solanum tuberosum",
        "water_needs": "medium",
        "water_frequency": {
          "seedling": {"days": 2, "amount_ml": 200},
          "vegetative": {"days": 3, "amount_ml": 300},
          "flowering": {"days": 2, "amount_ml": 500},
          "tuber_formation": {"days": 3, "amount_ml": 400}
        },
        "temperature_factor": {
          "low": 0.6,
          "optimal": 1,
          "high": 1.4
        },
        "humidity_factor": {
          "low": 1.2,
          "medium": 1,
          "high": 0.8
        },
        "soil_type_factor": {
          "sandy": 1.2,
          "loamy": 1.0,
          "clay": 0.7
        },
        "growth_info": {
          "days_to_maturity": 90,
          "ideal_temp_range": "15-20°C",
          "ideal_soil_ph": "5.0-6.0"
        }
      },
      "bell_pepper": {
        "name": "Bell Pepper",
        "scientific_name": "Capsicum annuum",
        "water_needs": "medium",
        "water_frequency": {
          "seedling": {"days": 1, "amount_ml": 200},
          "vegetative": {"days": 2, "amount_ml": 350},
          "flowering": {"days": 2, "amount_ml": 500},
          "fruiting": {"days": 2, "amount_ml": 600}
        },
        "temperature_factor": {
          "low": 0.6,
          "optimal": 1,
          "high": 1.4
        },
        "humidity_factor": {
          "low": 1.3,
          "medium": 1,
          "high": 0.7
        },
        "soil_type_factor": {
          "sandy": 1.2,
          "loamy": 1.0,
          "clay": 0.9
        },
        "growth_info": {
          "days_to_maturity": 90,
          "ideal_temp_range": "20-30°C",
          "ideal_soil_ph": "5.5-7.0"
        }
      },
      "spinach": {
        "name": "Spinach",
        "scientific_name": "Spinacia oleracea",
        "water_needs": "medium",
        "water_frequency": {
          "seedling": {"days": 1, "amount_ml": 150},
          "vegetative": {"days": 2, "amount_ml": 250},
          "mature": {"days": 2, "amount_ml": 300}
        },
        "temperature_factor": {
          "low": 0.9,
          "optimal": 1,
          "high": 1.7
        },
        "humidity_factor": {
          "low": 1.3,
          "medium": 1,
          "high": 0.7
        },
        "soil_type_factor": {
          "sandy": 1.3,
          "loamy": 1.0,
          "clay": 0.9
        },
        "growth_info": {
          "days_to_maturity": 40,
          "ideal_temp_range": "10-20°C",
          "ideal_soil_ph": "6.0-7.5"
        }
      },
      "strawberry": {
        "name": "Strawberry",
        "scientific_name": "Fragaria × ananassa",
        "water_needs": "medium",
        "water_frequency": {
          "vegetative": {"days": 2, "amount_ml": 300},
          "flowering": {"days": 1, "amount_ml": 400},
          "fruiting": {"days": 1, "amount_ml": 500}
        },
        "temperature_factor": {
          "low": 0.7,
          "optimal": 1,
          "high": 1.5
        },
        "humidity_factor": {
          "low": 1.2,
          "medium": 1,
          "high": 0.8
        },
        "soil_type_factor": {
          "sandy": 1.2,
          "loamy": 1.0,
          "clay": 1.1
        },
        "growth_info": {
          "days_to_maturity": 60,
          "ideal_temp_range": "15-26°C",
          "ideal_soil_ph": "5.5-6.5"
        }
      },
      "basil": {
        "name": "Basil",
        "scientific_name": "Ocimum basilicum",
        "water_needs": "medium",
        "water_frequency": {
          "seedling": {"days": 1, "amount_ml": 150},
          "vegetative": {"days": 2, "amount_ml": 250},
          "mature": {"days": 2, "amount_ml": 300}
        },
        "temperature_factor": {
          "low": 0.7,
          "optimal": 1,
          "high": 1.4
        },
        "humidity_factor": {
          "low": 1.3,
          "medium": 1,
          "high": 0.7
        },
        "soil_type_factor": {
          "sandy": 1.2,
          "loamy": 1.0,
          "clay": 1.1
        },
        "growth_info": {
          "days_to_maturity": 30,
          "ideal_temp_range": "18-30°C",
          "ideal_soil_ph": "6.0-7.5"
        }
      },
      "coriander": {
        "name": "Coriander",
        "scientific_name": "Coriandrum sativum",
        "water_needs": "medium",
        "water_frequency": {
          "seedling": {"days": 1, "amount_ml": 150},
          "vegetative": {"days": 2, "amount_ml": 250},
          "mature": {"days": 3, "amount_ml": 300}
        },
        "temperature_factor": {
          "low": 0.8,
          "optimal": 1,
          "high": 1.5
        },
        "humidity_factor": {
          "low": 1.2,
          "medium": 1,
          "high": 0.8
        },
        "soil_type_factor": {
          "sandy": 1.2,
          "loamy": 1.0,
          "clay": 1.1
        },
        "growth_info": {
          "days_to_maturity": 45,
          "ideal_temp_range": "10-24°C",
          "ideal_soil_ph": "6.0-7.5"
        }
      }
    }
    return plant_data

# Calculate irrigation needs
def calculate_irrigation(plant_key, growth_stage, soil_type, soil_moisture, temperature, humidity):
    plant_data = load_plant_data()
    
    if plant_key not in plant_data or growth_stage not in plant_data[plant_key]["water_frequency"]:
        return {"error": "Invalid plant or growth stage"}
    
    plant = plant_data[plant_key]
    
    # Get base watering information
    base_water_freq = plant["water_frequency"][growth_stage]["days"]
    base_water_amount = plant["water_frequency"][growth_stage]["amount_ml"]
    
    # Apply environmental factors
    temp_factor = 1
    if temperature < 10:
        temp_factor = plant["temperature_factor"]["low"]
    elif temperature > 30:
        temp_factor = plant["temperature_factor"]["high"]
    else:
        temp_factor = plant["temperature_factor"]["optimal"]
    
    humidity_factor = 1
    if humidity < 30:
        humidity_factor = plant["humidity_factor"]["low"]
    elif humidity > 70:
        humidity_factor = plant["humidity_factor"]["high"]
    else:
        humidity_factor = plant["humidity_factor"]["medium"]
    
    soil_factor = plant["soil_type_factor"][soil_type]
    
    # Calculate adjusted watering frequency based on soil moisture
    adjusted_days = base_water_freq * temp_factor * humidity_factor * soil_factor
    
    # Soil moisture adjustment (lower moisture means water sooner)
    moisture_adjustment = 1 - ((100 - soil_moisture) / 100)
    adjusted_days = adjusted_days * moisture_adjustment
    
    # Make sure days is at least 0.5 (same day) and round to half days
    adjusted_days = max(0.5, adjusted_days)
    adjusted_days = round(adjusted_days * 2) / 2
    
    # Adjust water amount based on factors
    adjusted_amount = base_water_amount * (1/temp_factor) * (1/humidity_factor) * (1/soil_factor)
    adjusted_amount = round(adjusted_amount)
    
    # Create recommendation text
    if adjusted_days <= 0.5:
        next_watering = "later today"
    elif adjusted_days <= 1:
        next_watering = "tomorrow"
    elif adjusted_days <= 1.5:
        next_watering = "tomorrow afternoon"
    else:
        next_watering = f"{int(adjusted_days)} day{'s' if int(adjusted_days) != 1 else ''}"
    
    recommendation = f"Based on current conditions ({temperature}°C, {humidity}% humidity, {soil_moisture}% soil moisture), "
    
    if adjusted_days <= 0.5:
        recommendation += f"your {plant['name']} plants need water today. "
    elif adjusted_days <= 1:
        recommendation += f"your {plant['name']} plants need water tomorrow. "
    else:
        recommendation += f"your {plant['name']} plants need water in {next_watering}. "
    
    # Add ideal conditions
    recommendation += f"For optimal growth, maintain temperatures between {plant['growth_info']['ideal_temp_range']} and soil pH of {plant['growth_info']['ideal_soil_ph']}."
    
    result = {
        "plant_name": plant["name"],
        "scientific_name": plant["scientific_name"],
        "next_watering": next_watering,
        "water_amount": f"{adjusted_amount}ml",
        "growth_stage": growth_stage.capitalize(),
        "soil_type": soil_type.capitalize(),
        "recommendation": recommendation,
        "ideal_temp_range": plant["growth_info"]["ideal_temp_range"],
        "ideal_soil_ph": plant["growth_info"]["ideal_soil_ph"],
        "days_to_maturity": plant["growth_info"]["days_to_maturity"]
    }
    
    return result

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
@app.route('/aboutus.html')
def about():
    return render_template('aboutus.html')

# New route for the irrigation page
@app.route('/irrigation.html')
def irrigation_page():
    return render_template('irrigation.html')

# New API endpoint for plant data
@app.route('/api/plants', methods=['GET'])
def get_plant_data():
    try:
        plant_data = load_plant_data()
        return jsonify(plant_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# New API endpoint for irrigation prediction
@app.route('/api/predict_irrigation', methods=['POST'])
def predict_irrigation():
    try:
        data = request.get_json()
        
        # Get form values
        plant_key = data.get('plantType')
        growth_stage = data.get('growthStage')
        soil_type = data.get('soilType')
        soil_moisture = int(data.get('soilMoisture'))
        temperature = int(data.get('temperature'))
        humidity = int(data.get('humidity'))
        
        # Validate input
        if not plant_key or not growth_stage:
            return jsonify({"error": "Please provide plant type and growth stage"}), 400
        
        # Calculate irrigation needs
        result = calculate_irrigation(plant_key, growth_stage, soil_type, soil_moisture, temperature, humidity)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e), "traceback": traceback.format_exc()}), 500


if __name__ == '__main__':
    app.run(debug=True)