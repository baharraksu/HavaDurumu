// API Configuration - Çift API Desteği
// Config dosyasından API bilgilerini al
const OPENWEATHER_API_KEY = config.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = config.OPENWEATHER_BASE_URL;
const OPENMETEO_BASE_URL = config.OPENMETEO_BASE_URL;

// API seçimi için flag
let useOpenWeather = false;

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// Weather Display Elements
const cityName = document.getElementById('cityName');
const countryName = document.getElementById('countryName');
const temperature = document.getElementById('temperature');
const weatherIcon = document.getElementById('weatherIcon');
const weatherDesc = document.getElementById('weatherDesc');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const visibility = document.getElementById('visibility');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');
const pressure = document.getElementById('pressure');
const uvIndex = document.getElementById('uvIndex');

// Container Elements
const hourlyContainer = document.getElementById('hourlyContainer');
const dailyContainer = document.getElementById('dailyContainer');

// Event Listeners
searchBtn.addEventListener('click', () => {
    console.log('Search button clicked');
    handleSearch();
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        console.log('Enter key pressed');
        handleSearch();
    }
});

// Debug: Check if elements exist
console.log('Search button:', searchBtn);
console.log('City input:', cityInput);

// Initialize with default city
document.addEventListener('DOMContentLoaded', () => {
    // Test OpenWeatherMap API first
    testOpenWeatherAPI();
    getWeatherData('Istanbul');
});

// Test OpenWeatherMap API
async function testOpenWeatherAPI() {
    try {
        const testUrl = `${OPENWEATHER_BASE_URL}/weather?q=Istanbul&appid=${OPENWEATHER_API_KEY}&units=metric&lang=tr`;
        const response = await fetch(testUrl);
        
        if (response.ok) {
            useOpenWeather = true;
            console.log('✅ OpenWeatherMap API aktif - kullanılıyor');
        } else {
            useOpenWeather = false;
            console.log('⚠️ OpenWeatherMap API henüz aktif değil - Open-Meteo kullanılıyor');
        }
    } catch (error) {
        useOpenWeather = false;
        console.log('⚠️ OpenWeatherMap API hatası - Open-Meteo kullanılıyor');
    }
}

// Search Handler
async function handleSearch() {
    const city = cityInput.value.trim();
    console.log('Searching for city:', city);
    
    if (city) {
        console.log('Starting weather data fetch...');
        await getWeatherData(city);
    } else {
        console.log('City input is empty');
    }
}

// Main Weather Data Function
async function getWeatherData(city) {
    try {
        console.log('getWeatherData called with city:', city);
        showLoading();
        hideError();
        
        let weatherData;
        
        if (useOpenWeather) {
            console.log('🌤️ OpenWeatherMap API kullanılıyor');
            weatherData = await getOpenWeatherData(city);
        } else {
            console.log('🌤️ Open-Meteo API kullanılıyor');
            weatherData = await getOpenMeteoData(city);
        }
        
        // Update UI with all data
        updateCurrentWeather(weatherData, city);
        updateHourlyForecast(weatherData);
        updateDailyForecast(weatherData);
        
        hideLoading();
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError('Hava durumu bilgileri alınamadı. Lütfen şehir adını kontrol edin.');
        hideLoading();
    }
}

// OpenWeatherMap API Functions
async function getOpenWeatherData(city) {
    try {
        // Get current weather
        const currentWeather = await fetch(`${OPENWEATHER_BASE_URL}/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=tr`);
        
        if (!currentWeather.ok) {
            throw new Error(`OpenWeatherMap error: ${currentWeather.status}`);
        }
        
        const currentData = await currentWeather.json();
        const { lat, lon } = currentData.coord;
        
        // Get forecast
        const forecast = await fetch(`${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=tr`);
        
        if (!forecast.ok) {
            throw new Error(`Forecast error: ${forecast.status}`);
        }
        
        const forecastData = await forecast.json();
        
        // Combine data in Open-Meteo format for compatibility
        return {
            current: {
                temperature_2m: currentData.main.temp,
                apparent_temperature: currentData.main.feels_like,
                relative_humidity_2m: currentData.main.humidity,
                pressure_msl: currentData.main.pressure,
                wind_speed_10m: currentData.wind.speed,
                weather_code: convertOpenWeatherToCode(currentData.weather[0].id)
            },
            daily: {
                time: [new Date().toISOString()],
                sunrise: [new Date(currentData.sys.sunrise * 1000).toISOString()],
                sunset: [new Date(currentData.sys.sunset * 1000).toISOString()],
                temperature_2m_max: [currentData.main.temp_max],
                temperature_2m_min: [currentData.main.temp_min],
                weather_code: [convertOpenWeatherToCode(currentData.weather[0].id)]
            },
            hourly: {
                time: forecastData.list.slice(0, 8).map(item => new Date(item.dt * 1000).toISOString()),
                temperature_2m: forecastData.list.slice(0, 8).map(item => item.main.temp),
                weather_code: forecastData.list.slice(0, 8).map(item => convertOpenWeatherToCode(item.weather[0].id)),
                relative_humidity_2m: forecastData.list.slice(0, 8).map(item => item.main.humidity),
                wind_speed_10m: forecastData.list.slice(0, 8).map(item => item.wind.speed)
            }
        };
        
    } catch (error) {
        console.error('OpenWeatherMap error:', error);
        throw error;
    }
}

// Open-Meteo API Functions
async function getOpenMeteoData(city) {
    try {
        // Get coordinates
        const coordinates = await getCityCoordinates(city);
        
        if (!coordinates) {
            throw new Error('Şehir bulunamadı');
        }
        
        console.log('Coordinates received:', coordinates);
        
        // Get weather data
        const weatherData = await fetchWeatherData(coordinates.lat, coordinates.lon);
        return weatherData;
        
    } catch (error) {
        console.error('Open-Meteo error:', error);
        throw error;
    }
}

// Get city coordinates using Open-Meteo Geocoding
async function getCityCoordinates(city) {
    try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=tr&format=json`;
        console.log('Fetching coordinates from:', url);
        
        const response = await fetch(url);
        console.log('Geocoding response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Geocoding API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Geocoding data received:', data);
        
        if (data.results && data.results.length > 0) {
            const coords = {
                lat: data.results[0].latitude,
                lon: data.results[0].longitude,
                country: data.results[0].country
            };
            console.log('Coordinates found:', coords);
            return coords;
        }
        
        console.log('No coordinates found for city:', city);
        return null;
    } catch (error) {
        console.error('Error getting coordinates:', error);
        return null;
    }
}

// Fetch Weather Data Helper (Open-Meteo)
async function fetchWeatherData(lat, lon) {
    const url = `${OPENMETEO_BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,weather_code,visibility&hourly=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;
    
    console.log('Fetching weather data from:', url);
    
    const response = await fetch(url);
    console.log('Weather API response status:', response.status);
    
    if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Weather data received:', data);
    
    return data;
}

// Convert OpenWeatherMap weather codes to Open-Meteo format
function convertOpenWeatherToCode(openWeatherId) {
    const codeMap = {
        200: 95, // thunderstorm
        201: 95, // thunderstorm
        202: 95, // thunderstorm
        210: 95, // thunderstorm
        211: 95, // thunderstorm
        212: 95, // thunderstorm
        221: 95, // thunderstorm
        230: 95, // thunderstorm
        231: 95, // thunderstorm
        232: 95, // thunderstorm
        300: 51, // drizzle
        301: 51, // drizzle
        302: 53, // drizzle
        310: 51, // drizzle
        311: 51, // drizzle
        312: 53, // drizzle
        313: 51, // drizzle
        314: 53, // drizzle
        321: 51, // drizzle
        500: 61, // rain
        501: 61, // rain
        502: 63, // rain
        503: 65, // rain
        504: 65, // rain
        511: 71, // snow
        520: 80, // shower rain
        521: 81, // shower rain
        522: 82, // shower rain
        531: 82, // shower rain
        600: 71, // snow
        601: 73, // snow
        602: 75, // snow
        611: 77, // snow
        612: 77, // snow
        613: 77, // snow
        615: 71, // snow
        616: 71, // snow
        620: 85, // snow
        621: 86, // snow
        622: 86, // snow
        701: 45, // mist
        711: 45, // smoke
        721: 45, // haze
        731: 45, // dust
        741: 45, // fog
        751: 45, // sand
        761: 45, // dust
        762: 45, // ash
        771: 45, // squall
        781: 45, // tornado
        800: 0,  // clear
        801: 1,  // few clouds
        802: 2,  // scattered clouds
        803: 3,  // broken clouds
        804: 3   // overcast clouds
    };
    
    return codeMap[openWeatherId] || 3; // default to cloudy
}

// Update Current Weather
function updateCurrentWeather(data, city) {
    cityName.textContent = city;
    countryName.textContent = 'Türkiye';
    
    // Current weather data
    const current = data.current;
    temperature.textContent = Math.round(current.temperature_2m);
    feelsLike.textContent = `${Math.round(current.apparent_temperature)}°C`;
    humidity.textContent = `${current.relative_humidity_2m}%`;
    windSpeed.textContent = `${Math.round(current.wind_speed_10m * 3.6)} km/h`;
    pressure.textContent = `${Math.round(current.pressure_msl)} hPa`;
    
    // Weather description and icon
    const weatherCode = current.weather_code;
    const weatherInfo = getWeatherInfo(weatherCode);
    weatherDesc.textContent = weatherInfo.description;
    weatherIcon.className = weatherInfo.icon;
    
    // Additional info
    const daily = data.daily;
    if (daily && daily.sunrise && daily.sunrise.length > 0) {
        const sunriseTime = new Date(daily.sunrise[0]);
        const sunsetTime = new Date(daily.sunset[0]);
        sunrise.textContent = sunriseTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        sunset.textContent = sunsetTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Set default values for unavailable data
    visibility.textContent = '10 km';
    uvIndex.textContent = '5';
}

// Update Hourly Forecast
function updateHourlyForecast(data) {
    hourlyContainer.innerHTML = '';
    
    if (!data.hourly || !data.hourly.time) return;
    
    // Get next 24 hours
    const hourlyData = data.hourly;
    const currentHour = new Date().getHours();
    
    for (let i = 0; i < 8; i++) {
        const hourIndex = currentHour + i * 3;
        if (hourIndex < hourlyData.time.length) {
            const time = new Date(hourlyData.time[hourIndex]);
            const temp = Math.round(hourlyData.temperature_2m[hourIndex]);
            const weatherCode = hourlyData.weather_code[hourIndex];
            const weatherInfo = getWeatherInfo(weatherCode);
            
            const hourlyItem = document.createElement('div');
            hourlyItem.className = 'hourly-item';
            hourlyItem.innerHTML = `
                <div class="time">${time.getHours()}:00</div>
                <i class="${weatherInfo.icon} icon"></i>
                <div class="temp">${temp}°C</div>
            `;
            
            hourlyContainer.appendChild(hourlyItem);
        }
    }
}

// Update Daily Forecast
function updateDailyForecast(data) {
    dailyContainer.innerHTML = '';
    
    if (!data.daily || !data.daily.time) return;
    
    const dailyData = data.daily;
    
    for (let i = 0; i < 5; i++) {
        if (i < dailyData.time.length) {
            const day = new Date(dailyData.time[i]);
            const dayName = getDayName(day.getDay());
            const maxTemp = Math.round(dailyData.temperature_2m_max[i]);
            const minTemp = Math.round(dailyData.temperature_2m_min[i]);
            const weatherCode = dailyData.weather_code[i];
            const weatherInfo = getWeatherInfo(weatherCode);
            
            const dailyItem = document.createElement('div');
            dailyItem.className = 'daily-item';
            dailyItem.innerHTML = `
                <div class="day">${dayName}</div>
                <div class="weather">
                    <i class="${weatherInfo.icon} icon"></i>
                    <span class="description">${weatherInfo.description}</span>
                </div>
                <div class="temp-range">
                    <span class="max-temp">${maxTemp}°C</span>
                    <span class="min-temp">${minTemp}°C</span>
                </div>
            `;
            
            dailyContainer.appendChild(dailyItem);
        }
    }
}

// Helper Functions
function getDayName(dayIndex) {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return days[dayIndex];
}

function getWeatherInfo(weatherCode) {
    const weatherMap = {
        0: { icon: 'fas fa-sun', description: 'Açık' },
        1: { icon: 'fas fa-cloud-sun', description: 'Az Bulutlu' },
        2: { icon: 'fas fa-cloud-sun', description: 'Parçalı Bulutlu' },
        3: { icon: 'fas fa-cloud', description: 'Bulutlu' },
        45: { icon: 'fas fa-smog', description: 'Sisli' },
        48: { icon: 'fas fa-smog', description: 'Sisli' },
        51: { icon: 'fas fa-cloud-rain', description: 'Hafif Yağmurlu' },
        53: { icon: 'fas fa-cloud-rain', description: 'Yağmurlu' },
        55: { icon: 'fas fa-cloud-rain', description: 'Şiddetli Yağmurlu' },
        61: { icon: 'fas fa-cloud-rain', description: 'Yağmurlu' },
        63: { icon: 'fas fa-cloud-rain', description: 'Şiddetli Yağmurlu' },
        65: { icon: 'fas fa-cloud-showers-heavy', description: 'Çok Şiddetli Yağmurlu' },
        71: { icon: 'fas fa-snowflake', description: 'Karlı' },
        73: { icon: 'fas fa-snowflake', description: 'Şiddetli Karlı' },
        75: { icon: 'fas fa-snowflake', description: 'Çok Şiddetli Karlı' },
        77: { icon: 'fas fa-snowflake', description: 'Kar Taneleri' },
        80: { icon: 'fas fa-cloud-rain', description: 'Hafif Sağanak' },
        81: { icon: 'fas fa-cloud-rain', description: 'Sağanak' },
        82: { icon: 'fas fa-cloud-showers-heavy', description: 'Şiddetli Sağanak' },
        85: { icon: 'fas fa-snowflake', description: 'Hafif Kar Sağanağı' },
        86: { icon: 'fas fa-snowflake', description: 'Kar Sağanağı' },
        95: { icon: 'fas fa-bolt', description: 'Gök Gürültülü' },
        96: { icon: 'fas fa-bolt', description: 'Gök Gürültülü Dolu' },
        99: { icon: 'fas fa-bolt', description: 'Şiddetli Gök Gürültülü Dolu' }
    };
    
    return weatherMap[weatherCode] || { icon: 'fas fa-cloud', description: 'Bilinmeyen' };
}

// UI Helper Functions
function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.add('show');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    errorMessage.classList.remove('show');
}

// Geolocation Support
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Get city name from coordinates using reverse geocoding
                    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=tr`);
                    const data = await response.json();
                    if (data.name) {
                        await getWeatherData(data.name);
                    }
                } catch (error) {
                    console.error('Error getting city from coordinates:', error);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
            }
        );
    }
}

// Add location button to header
function addLocationButton() {
    const locationBtn = document.createElement('button');
    locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
    locationBtn.className = 'location-btn';
    locationBtn.title = 'Konumumu kullan';
    locationBtn.addEventListener('click', getCurrentLocation);
    
    // Add to header
    const header = document.querySelector('.header');
    header.appendChild(locationBtn);
}

// Initialize location button
document.addEventListener('DOMContentLoaded', () => {
    addLocationButton();
});
