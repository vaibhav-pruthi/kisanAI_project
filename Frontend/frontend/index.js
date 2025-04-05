document.addEventListener('DOMContentLoaded', () => {
    // Navigation Interactions
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');

    // Initial dashboard population
    populateDashboard();

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.dataset.section;
            
            // Remove active class from all sections and nav items
            sections.forEach(section => {
                section.classList.remove('active');
            });
            navItems.forEach(navItem => {
                navItem.classList.remove('active');
            });

            // Add active class to selected section and nav item
            document.getElementById(`${sectionId}-section`).classList.add('active');
            item.classList.add('active');
        });
    });

    // Dashboard Population Function
    function populateDashboard() {
        // Weather Summary
        fetchQuickWeather();

        // Crop Health Summary
        checkRecentDiseases();

        // Irrigation Status
        checkIrrigationNeeds();

        // Fertilizer Recommendations
        checkFertilizerRecommendations();
    }

    // Quick Weather Fetch for Dashboard
    async function fetchQuickWeather() {
        const weatherDiv = document.getElementById('dashboard-weather');
        
        try {
            // Fetch from our Flask API endpoint
            const response = await fetch('/api/weather?location=default');
            const data = await response.json();

            weatherDiv.innerHTML = `
                <div class="weather-summary">
                    <p><strong>Temperature:</strong> ${data.current.temp}°C</p>
                    <p><strong>Humidity:</strong> ${data.current.humidity}%</p>
                    <p><strong>Condition:</strong> ${data.current.condition}</p>
                </div>
            `;
        } catch (error) {
            weatherDiv.innerHTML = '<p>Unable to fetch weather data</p>';
            console.error('Weather fetch error:', error);
        }
    }

    // Check Recent Crop Diseases
    async function checkRecentDiseases() {
        const cropHealthDiv = document.getElementById('dashboard-crop-health');
        
        try {
            // Endpoint to fetch recent disease detections from Flask
            const response = await fetch('/api/recent-diseases');
            const diseases = await response.json();

            if (diseases.length > 0) {
                cropHealthDiv.innerHTML = `
                    <div class="disease-alert">
                        <p><strong>Recent Detections:</strong></p>
                        ${diseases.map(disease => 
                            `<p>${disease.crop_type}: ${disease.diagnosis} (${Math.round(disease.confidence * 100)}% confidence)</p>`
                        ).join('')}
                    </div>
                `;
            } else {
                cropHealthDiv.innerHTML = '<p>No recent disease detections</p>';
            }
        } catch (error) {
            cropHealthDiv.innerHTML = '<p>Unable to check crop health</p>';
            console.error('Crop health check error:', error);
        }
    }

    // Irrigation Needs Check
    async function checkIrrigationNeeds() {
        const irrigationDiv = document.getElementById('dashboard-irrigation');
        
        try {
            const response = await fetch('/api/irrigation-status');
            const status = await response.json();

            irrigationDiv.innerHTML = `
                <div class="irrigation-status ${status.needed ? 'irrigation-needed' : ''}">
                    <p><strong>Status:</strong> ${status.needed ? 'Irrigation Needed' : 'No Immediate Irrigation Required'}</p>
                    ${status.needed ? `<p>Recommended Amount: ${status.amount} liters/acre</p>` : ''}
                </div>
            `;
        } catch (error) {
            irrigationDiv.innerHTML = '<p>Unable to check irrigation status</p>';
            console.error('Irrigation status error:', error);
        }
    }

    // Fertilizer Recommendations
    async function checkFertilizerRecommendations() {
        const fertilizerDiv = document.getElementById('dashboard-fertilizer');
        
        try {
            const response = await fetch('/api/fertilizer-recommendations');
            const recommendations = await response.json();

            if (recommendations.length > 0) {
                fertilizerDiv.innerHTML = `
                    <div class="fertilizer-recommendations">
                        <p><strong>Recommended Fertilizers:</strong></p>
                        ${recommendations.map(rec => 
                            `<p>${rec.crop_type}: ${rec.fertilizer_name} (${rec.dosage} kg/hectare)</p>`
                        ).join('')}
                    </div>
                `;
            } else {
                fertilizerDiv.innerHTML = '<p>No current fertilizer recommendations</p>';
            }
        } catch (error) {
            fertilizerDiv.innerHTML = '<p>Unable to fetch fertilizer recommendations</p>';
            console.error('Fertilizer recommendations error:', error);
        }
    }

    // Weather Forecast Handler
    window.fetchWeatherForecast = function() {
        const locationInput = document.getElementById('location-input').value;
        const resultsContainer = document.getElementById('weather-results');
        
        resultsContainer.innerHTML = '<p>Loading weather forecast...</p>';
        
        fetch(`/api/weather?location=${encodeURIComponent(locationInput)}`)
            .then(response => response.json())
            .then(data => {
                let forecastHtml = `
                    <div class="weather-card current-weather">
                        <h3>Current Weather in ${data.location}</h3>
                        <div class="weather-details">
                            <p><i class="fas fa-temperature-high"></i> Temperature: ${data.current.temp}°C</p>
                            <p><i class="fas fa-tint"></i> Humidity: ${data.current.humidity}%</p>
                            <p><i class="fas fa-wind"></i> Wind: ${data.current.wind_speed} km/h</p>
                            <p><i class="fas fa-cloud"></i> Condition: ${data.current.condition}</p>
                        </div>
                    </div>
                    <h3>5-Day Forecast</h3>
                    <div class="forecast-container">
                `;
                
                data.forecast.forEach(day => {
                    forecastHtml += `
                        <div class="forecast-day">
                            <h4>${new Date(day.date).toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})}</h4>
                            <p><i class="fas fa-temperature-high"></i> ${day.temp}°C</p>
                            <p><i class="fas fa-tint"></i> ${day.humidity}%</p>
                            <p><i class="fas fa-cloud"></i> ${day.condition}</p>
                        </div>
                    `;
                });
                
                forecastHtml += '</div>';
                resultsContainer.innerHTML = forecastHtml;
            })
            .catch(error => {
                resultsContainer.innerHTML = '<p class="error">Error fetching weather data. Please try again.</p>';
                console.error('Weather forecast error:', error);
            });
    };

    // Disease Detection Handler - Text-based approach instead of image upload
    window.detectDisease = function() {
        const cropTypeSelect = document.getElementById('disease-crop-type');
        const symptomsInput = document.getElementById('disease-symptoms');
        const resultsContainer = document.getElementById('disease-results');
        
        if (!cropTypeSelect || !symptomsInput) {
            console.error("Crop type select or symptoms input not found");
            return;
        }
        
        const cropType = cropTypeSelect.value;
        const symptoms = symptomsInput.value;
        
        if (!cropType || !symptoms) {
            resultsContainer.innerHTML = '<p class="error">Please select a crop type and describe the symptoms</p>';
            return;
        }
        
        resultsContainer.innerHTML = '<p>Analyzing symptoms...</p>';
        
        // Send data to Flask backend
        fetch('/api/disease-detection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                crop_type: cropType,
                symptoms: symptoms
            })
        })
        .then(response => response.json())
        .then(data => {
            let resultsHtml = `
                <div class="analysis-results">
                    <h3>Analysis Results</h3>
                    <div class="diagnosis">
                        <p><strong>Diagnosis:</strong> ${data.diagnosis}</p>
                        <p><strong>Confidence:</strong> ${Math.round(data.confidence * 100)}%</p>
                    </div>
                    <div class="all-probabilities">
                        <h4>All Possible Diseases:</h4>
                        <ul>
                            ${data.all_probabilities.map(disease => 
                                `<li>${disease.name}: ${Math.round(disease.probability * 100)}%</li>`
                            ).join('')}
                        </ul>
                    </div>
                    <div class="recommendations">
                        <h4>Recommendations:</h4>
                        <ul>
                            ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            resultsContainer.innerHTML = resultsHtml;
        })
        .catch(error => {
            resultsContainer.innerHTML = '<p class="error">Error analyzing disease. Please try again.</p>';
            console.error('Disease detection error:', error);
        });
    };

    // Irrigation Form Handler
    document.getElementById('irrigation-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const resultsContainer = document.getElementById('irrigation-results');
        const formDataObj = {};
        
        formData.forEach((value, key) => {
            formDataObj[key] = value;
        });
        
        resultsContainer.innerHTML = '<p>Calculating irrigation needs...</p>';
        
        fetch('/api/irrigation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formDataObj)
        })
        .then(response => response.json())
        .then(data => {
            let resultsHtml = `
                <div class="irrigation-results">
                    <h3>Irrigation Plan</h3>
                    <p><strong>Water Required:</strong> ${data.water_required} mm/day</p>
                    <p><strong>Schedule:</strong> ${data.schedule}</p>
                    <div class="recommendations">
                        <h4>Recommendations:</h4>
                        <ul>
                            ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            resultsContainer.innerHTML = resultsHtml;
        })
        .catch(error => {
            resultsContainer.innerHTML = '<p class="error">Error calculating irrigation plan. Please try again.</p>';
            console.error('Irrigation calculation error:', error);
        });
    });

    // Fertilizer Form Handler
    document.getElementById('fertilizer-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const resultsContainer = document.getElementById('fertilizer-results');
        const formDataObj = {};
        
        formData.forEach((value, key) => {
            formDataObj[key] = value;
        });
        
        resultsContainer.innerHTML = '<p>Generating fertilizer recommendations...</p>';
        
        fetch('/api/fertilizer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formDataObj)
        })
        .then(response => response.json())
        .then(data => {
            let resultsHtml = `
                <div class="fertilizer-results">
                    <h3>Fertilizer Recommendations</h3>
                    <div class="recommendations">
                        <table class="fertilizer-table">
                            <thead>
                                <tr>
                                    <th>Nutrient</th>
                                    <th>Required Amount</th>
                                    <th>Recommended Product</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.nutrients.map(nutrient => `
                                    <tr>
                                        <td>${nutrient.name}</td>
                                        <td>${nutrient.amount} kg/hectare</td>
                                        <td>${nutrient.product}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <h4>Application Guidelines:</h4>
                        <ul>
                            ${data.guidelines.map(guideline => `<li>${guideline}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            resultsContainer.innerHTML = resultsHtml;
        })
        .catch(error => {
            resultsContainer.innerHTML = '<p class="error">Error generating fertilizer recommendations. Please try again.</p>';
            console.error('Fertilizer recommendation error:', error);
        });
    });
});

    
       
// Add event listener for navigation links in all pages
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-item');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const page = this.getAttribute('data-section');
            window.location.href = page === 'dashboard' ? 'index.html' : `${page}.html`;
        });
    });
}

// Call this function when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupNavigation);
} else {
    setupNavigation();
}