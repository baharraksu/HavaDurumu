# 🌤️ HavaDurumu - Profesyonel Hava Durumu Uygulaması

Modern ve kullanıcı dostu hava durumu uygulaması. Ücretsiz API'ler kullanarak gerçek zamanlı hava durumu bilgileri sunar.

## ✨ Özellikler

- 🌍 **Çoklu API Desteği**: OpenWeatherMap + Open-Meteo (fallback)
- 📍 **Konum Tespiti**: Otomatik mevcut konum algılama
- 🔍 **Şehir Arama**: Dünya çapında şehir arama
- 📊 **Detaylı Bilgiler**: Sıcaklık, nem, rüzgar, basınç, UV indeksi
- ⏰ **Saatlik Tahmin**: 8 saatlik detaylı tahmin
- 📅 **5 Günlük Tahmin**: Haftalık hava durumu özeti
- 🌅 **Güneş Bilgileri**: Gün doğumu ve gün batımı saatleri
- 📱 **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm
- 🎨 **Modern UI**: Glassmorphism ve animasyonlu tasarım

## 🚀 Kurulum

### 1. Projeyi İndirin
```bash
git clone https://github.com/kullaniciadi/HavaDurumu.git
cd HavaDurumu
```

### 2. API Key Kurulumu

#### OpenWeatherMap API Key (İsteğe Bağlı)
1. [OpenWeatherMap](https://openweathermap.org/api) adresine gidin
2. Ücretsiz hesap oluşturun
3. API key alın
4. `config.example.js` dosyasını `config.js` olarak kopyalayın
5. `config.js` dosyasında `YOUR_OPENWEATHER_API_KEY_HERE` yerine kendi API key'inizi yazın

```javascript
// config.js
const config = {
    OPENWEATHER_API_KEY: 'sizin_api_keyiniz_buraya',
    // ... diğer ayarlar
};
```

#### Open-Meteo (Varsayılan - API Key Gerektirmez)
- Open-Meteo API key gerektirmez ve ücretsizdir
- Eğer OpenWeatherMap API key'iniz yoksa, uygulama otomatik olarak Open-Meteo kullanır

### 3. Çalıştırın
```bash
# Basit HTTP sunucusu başlatın (Python 3)
python -m http.server 8000

# Veya Node.js ile
npx http-server

# Veya doğrudan tarayıcıda index.html'i açın
```

## 🔧 Konfigürasyon

### config.js Dosyası
```javascript
const config = {
    OPENWEATHER_API_KEY: 'your_api_key_here',
    OPENWEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
    OPENMETEO_BASE_URL: 'https://api.open-meteo.com/v1',
    DEFAULT_CITY: 'Istanbul',
    LANGUAGE: 'tr'
};
```

### Güvenlik
- `config.js` dosyası `.gitignore` ile korunur
- API key'leriniz GitHub'a yüklenmez
- `config.example.js` dosyasını kullanarak kendi config'inizi oluşturun

## 🎨 Tasarım Özellikleri

- **Glassmorphism**: Modern cam efekti tasarım
- **Animasyonlu Gradient**: Hareketli arka plan
- **Hover Efektleri**: Etkileşimli kartlar
- **Responsive Grid**: Esnek düzen sistemi
- **Modern Typography**: Inter font ailesi
- **Smooth Transitions**: Yumuşak geçişler

## 🌐 API Endpoints

### OpenWeatherMap
- Current Weather: `/weather`
- 5-Day Forecast: `/forecast`
- Geocoding: `/geo/1.0/direct`

### Open-Meteo
- Weather Forecast: `/forecast`
- Geocoding: `/geocoding/v1/search`
tır. Detaylar için `LICENSE` dosyasına bakın.

## 📞 İletişim
- baharraksuu@gmail.com

- API key'lerinizi asla GitHub'a yüklemeyin
- `config.js` dosyasını `.gitignore` ile koruyun
- Production ortamında environment variables kullanın
- API rate limitlerine dikkat edin

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
