# Setup Instructions

## Environment Variables Setup

This application requires environment variables to be configured for API access.

### 1. Local Development (.env.local)

Create a `.env.local` file in the project root directory:

```bash
# In the project root directory
touch .env.local
```

Add the following variables:

```env
# Hugging Face API Configuration
VITE_API_BASE_URL=https://your-space.hf.space
VITE_API_KEY=your-super-secret-key-here
```

### 2. Production (Vercel)

In Vercel dashboard, add these environment variables:

```env
# Hugging Face API Configuration
API_BASE_URL=https://your-space.hf.space
API_KEY=your-super-secret-key-here
```

**Important:** Use `API_` prefix (not `VITE_`) for production environment variables.

### 3. Variable Naming Convention

- **Local Development**: `VITE_API_KEY` and `VITE_API_BASE_URL`
- **Production (Vercel)**: `API_KEY` and `API_BASE_URL`

The application automatically detects and uses the appropriate variables based on the environment.

**Replace the placeholder values:**
- `your-space.hf.space` - Your actual Hugging Face Space URL
- `your-super-secret-key-here` - Your actual API key from Hugging Face

### 4. Important Notes

- **File name**: Must be `.env.local` (not `.env`) for local development
- **VITE_ prefix**: Required for Vite to expose variables to the client in development
- **Production prefix**: Use `API_` prefix in Vercel (without VITE_)
- **Security**: Never commit `.env.local` to version control
- **Restart**: Restart your development server after creating/modifying the file

### 5. Verification

After setup, check the browser console for:
- `API Base URL: [your-url]`
- `API Key available (VITE): true/false` (local development)
- `API Key available (production): true/false` (production)
- `API Key available (any): true/false` (overall availability)

### 6. Troubleshooting

**API Key not loading:**
- Ensure file is named `.env.local` for local development
- Check for typos in variable names
- Restart development server
- Verify file is in project root directory
- In Vercel, ensure variables are set without `VITE_` prefix

**Authorization errors:**
- Verify API key is correct
- Check that appropriate environment variables are set
- Ensure API key has proper permissions
- Verify variable names match the environment (dev vs production)

## Example Configuration

### Local Development (.env.local)
```env
VITE_API_BASE_URL=https://my-clothing-detector.hf.space
VITE_API_KEY=hf_abc123def456ghi789
```

### Production (Vercel)
```env
API_BASE_URL=https://my-clothing-detector.hf.space
API_KEY=hf_abc123def456ghi789
```
