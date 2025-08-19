# Loomi Clothing Analyzer

Modern React application for clothing analysis using AI API. The app allows you to upload images, automatically detect clothing items, remove backgrounds, and analyze color and category.

## 🚀 Features

- **Image upload** with drag & drop support
- **Automatic detection** of clothing items
- **Item selection** from multiple detected items
- **Background removal** using AI
- **Color analysis** and clothing category
- **Custom zone** for manual area selection
- **Responsive design** for all devices

## 🛠️ Technologies

- **React 18** with modern hooks
- **Vite** for fast building
- **CSS3** with modern capabilities
- **Canvas API** for interactive zone selection

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd loomi-clothing-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file with your API credentials:
```bash
# Create .env.local file in the project root
```

4. Configure API settings in `.env.local` file:
```env
VITE_API_BASE_URL=https://your-space.hf.space
VITE_API_KEY=your-super-secret-key-here
```

**Important:** Replace the placeholder values with your actual Hugging Face API credentials. The `VITE_` prefix is required for Vite to expose these variables to the client.

## 🚀 Running

### Development
```bash
npm run dev
```

### Production build
```bash
npm run build
```

### Preview build
```bash
npm run preview
```

## 🔧 API Configuration

### Authentication
All API requests require authentication using a Bearer token. The token should be configured in your `.env.local` file as `VITE_API_KEY`.

**Headers:**
```
Authorization: Bearer your-super-secret-key-here
```

### Endpoints
The application expects the following API endpoints:

### 1. Clothing Detection (`/clothing`)
**POST** request with image for clothing item detection.

**Response:**
```json
{
  "clothing_types": {
    "shirt": {
      "percentage": 45.2,
      "pixels": 123456
    },
    "pants": {
      "percentage": 32.1,
      "pixels": 87654
    }
  },
  "coordinates": {
    "shirt": {
      "x_min": 100,
      "y_min": 50,
      "width": 300,
      "height": 400
    }
  }
}
```

### 2. Image Analysis (`/analyze`)
**POST** request for full analysis of selected item.

**Response:**
```json
{
  "clothing_only_image": "data:image/jpeg;base64,...",
  "dominant_color": "#ff6b6b",
  "clothing_analysis": {
    "total_detected": 2,
    "main_clothing": ["shirt"],
    "clothing_types": {
      "shirt": {
        "percentage": 45.2,
        "pixels": 123456
      }
    }
  }
}
```

## 📱 Usage

1. **Image upload**: Drag and drop an image or click to select a file
2. **Automatic detection**: The system automatically finds clothing items
3. **Item selection**: If multiple items are found, select the desired one
4. **View results**: Get the image without background and analysis
5. **Custom zone**: Manually select an area if needed

## 🎨 Customization

### Colors and themes
Main colors are defined in CSS variables:
- Primary: `#22c55e` (green)
- Background: `#0a0a0a` (dark)
- Text: `#ffffff` (white)
- Secondary: `#9ca3af` (gray)

### Styles
All components have modular CSS files for easy customization.

## 📱 Responsiveness

The application is fully responsive and supports:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (up to 767px)

## 🐛 Debugging

For debugging API requests:
1. Open DevTools (F12)
2. Go to Console tab to check if API key is loaded
3. Go to Network tab to view requests and headers
4. Verify that `Authorization` header is present in requests

**Console logs:**
- `API Base URL:` - Shows the configured API base URL
- `API Key available:` - Shows whether the API key is loaded (true/false)

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you have questions or issues, create an issue in the repository.
