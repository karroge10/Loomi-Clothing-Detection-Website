# 🚀 Loomi Clothing Detection Website

AI-powered clothing analyzer with background removal using optimized API workflows for maximum performance.

## ✨ Features

- **Smart Image Analysis**: Detect and analyze clothing items in images
- **Background Removal**: Extract clothing with clean background separation
- **Color Detection**: Identify dominant colors in detected clothing
- **Optimized Performance**: 48% faster processing with intelligent workflow
- **Responsive Design**: Modern, mobile-friendly interface
- **Real-time Feedback**: Live performance metrics and workflow status

## 🚀 Optimized API Workflow

### Performance Benefits
- **Traditional Workflow**: ~94 seconds total
- **Optimized Workflow**: ~49 seconds total
- **Improvement**: **48% faster** processing

### Workflow Steps

#### Step 1: Quick Clothing Detection (`/clothing/quick`)
- **Duration**: ~47 seconds
- **Purpose**: Initial clothing detection and segmentation
- **Output**: Clothing instances + segmentation data for reuse

#### Step 2: Analysis with Segmentation (`/analyze/with-segmentation`)
- **Duration**: ~2 seconds
- **Purpose**: Detailed analysis using cached segmentation
- **Output**: Final results with background removal and color analysis

### Technical Advantages
- **ML Model Efficiency**: Runs only once per image
- **Segmentation Reuse**: Eliminates redundant processing
- **Resource Optimization**: Reduced CPU and memory usage
- **Better UX**: Faster response times for users

## 🛠️ Technology Stack

- **Frontend**: React 19 + Vite
- **Styling**: Modern CSS with gradients and animations
- **API**: RESTful endpoints with FormData support
- **File Support**: PNG, JPEG, WebP (up to 10MB)
- **Performance**: Optimized workflows with fallback support

## 📁 Project Structure

```
loomi-clothing-analyzer/
├── src/
│   ├── components/          # React components
│   │   ├── UploadSection.jsx
│   │   ├── Results.jsx
│   │   ├── ClothingSelectionModal.jsx
│   │   └── ...
│   ├── config/
│   │   └── api.js          # API configuration & workflows
│   └── App.jsx             # Main application logic
├── public/                  # Static assets
└── package.json            # Dependencies
```

## 🔧 API Endpoints

### Optimized Workflow
- `POST /clothing/quick` - Quick clothing detection
- `POST /analyze/with-segmentation` - Analysis with segmentation reuse
- `GET /performance` - Performance metrics

### Traditional Workflow (Fallback)
- `POST /clothing` - Standard clothing detection
- `POST /analyze` - Full analysis

### Request Format
```javascript
// Step 1: Quick Detection
const formData = new FormData()
formData.append('file', imageFile)

// Step 2: Analysis with Segmentation
const formData = new FormData()
formData.append('file', imageFile)
formData.append('segmentation_data', JSON.stringify(segmentationData))
formData.append('selected_clothing', 'shirt') // Optional
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd loomi-clothing-analyzer

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your API base URL

# Start development server
npm run dev
```

### Environment Variables
```bash
VITE_API_BASE_URL=http://localhost:3000  # Your API server URL
```

## 📊 Performance Monitoring

The application includes built-in performance monitoring:

- **Workflow Type**: Shows whether optimized or traditional workflow is used
- **Step Timing**: Individual step performance metrics
- **Total Time**: Complete processing duration
- **Improvement Metrics**: Performance gains over traditional workflow

## 🔄 Workflow Fallback

The system automatically falls back to traditional workflow if:
- Optimized endpoints are unavailable
- Segmentation data is corrupted
- API errors occur during optimization

This ensures reliability while maintaining performance benefits when possible.

## 🎨 Customization

### Styling
- Modern CSS with CSS variables for easy theming
- Responsive design with mobile-first approach
- Smooth animations and transitions

### API Integration
- Modular API configuration
- Easy endpoint customization
- Support for different API providers

## 🧪 Testing

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📈 Future Enhancements

- **Batch Processing**: Multiple image analysis
- **Advanced Segmentation**: Custom zone selection
- **Caching Layer**: Redis integration for repeated requests
- **Analytics Dashboard**: Detailed performance insights
- **API Versioning**: Support for multiple API versions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Check the documentation
- Review existing issues
- Create a new issue with detailed information

---

**Built with ❤️ using React and modern web technologies**
