# Setup Instructions

## Environment Variables Setup

This application requires environment variables to be configured for API access.

### 1. Create Environment File

Create a `.env.local` file in the project root directory:

```bash
# In the project root directory
touch .env.local
```

### 2. Configure API Settings

Add the following variables to your `.env.local` file:

```env
# Hugging Face API Configuration
VITE_API_BASE_URL=https://your-space.hf.space
VITE_API_KEY=your-super-secret-key-here
```

**Replace the placeholder values:**
- `your-space.hf.space` - Your actual Hugging Face Space URL
- `your-super-secret-key-here` - Your actual API key from Hugging Face

### 3. Important Notes

- **File name**: Must be `.env.local` (not `.env`)
- **VITE_ prefix**: Required for Vite to expose variables to the client
- **Security**: Never commit `.env.local` to version control
- **Restart**: Restart your development server after creating/modifying the file

### 4. Verification

After setup, check the browser console for:
- `API Base URL: [your-url]`
- `API Key available: true`

### 5. Troubleshooting

**API Key not loading:**
- Ensure file is named `.env.local`
- Check for typos in variable names
- Restart development server
- Verify file is in project root directory

**Authorization errors:**
- Verify API key is correct
- Check that `VITE_API_KEY` is set
- Ensure API key has proper permissions

## Example .env.local

```env
VITE_API_BASE_URL=https://my-clothing-detector.hf.space
VITE_API_KEY=hf_abc123def456ghi789
```
