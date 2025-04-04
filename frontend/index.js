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
            // Assuming a default location or last used location
            const response = await fetch('/weather_forecast?location=default');
            const data = await response.json();

            weatherDiv.innerHTML = `
                <div class="weather-summary">
                    <p><strong>Temperature:</strong> ${data.temperature}°C</p>
                    <p><strong>Humidity:</strong> ${data.humidity}%</p>
                    <p><strong>Precipitation:</strong> ${data.precipitation} mm</p>
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
            // Endpoint to fetch recent disease detections
            const response = await fetch('/recent_diseases');
            const diseases = await response.json();

            if (diseases.length > 0) {
                cropHealthDiv.innerHTML = `
                    <div class="disease-alert">
                        <p><strong>Recent Detections:</strong></p>
                        ${diseases.map(disease => 
                            `<p>${disease.crop}: ${disease.type}</p>`
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
            const response = await fetch('/irrigation_status');
            const status = await response.json();

            irrigationDiv.innerHTML = `
                <div class="irrigation-status">
                    <p><strong>Status:</strong> ${status.needed ? 'Irrigation Needed' : 'No Immediate Irrigation Required'}</p>
                    ${status.needed ? `<p>Recommended Amount: ${status.amount} liters</p>` : ''}
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
            const response = await fetch('/fertilizer_recommendations');
            const recommendations = await response.json();

            if (recommendations.length > 0) {
                fertilizerDiv.innerHTML = `
                    <div class="fertilizer-recommendations">
                        <p><strong>Recommended Fertilizers:</strong></p>
                        ${recommendations.map(rec => 
                            `<p>${rec.crop}: ${rec.name} (${rec.dosage} kg/hectare)</p>`
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

    // Existing methods for weather, disease, irrigation, and fertilizer remain the same as in the previous implementation
    // (fetchWeatherForecast, detectDisease, irrigation form submission, fertilizer form submission)
});