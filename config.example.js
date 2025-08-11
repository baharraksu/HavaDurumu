// Example Configuration File
// Bu dosyayı config.js olarak kopyalayın ve kendi API key'inizi ekleyin

const config = {
    // OpenWeatherMap API Key - Kendi API key'inizi buraya ekleyin
    // https://openweathermap.org/api adresinden ücretsiz API key alabilirsiniz
    OPENWEATHER_API_KEY: 'YOUR_OPENWEATHER_API_KEY_HERE',
    
    // API URLs
    OPENWEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
    OPENMETEO_BASE_URL: 'https://api.open-meteo.com/v1',
    
    // Default city
    DEFAULT_CITY: 'Istanbul',
    
    // Language
    LANGUAGE: 'tr'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} else {
    // Browser environment
    window.config = config;
}
