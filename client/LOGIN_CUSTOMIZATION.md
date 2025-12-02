# Login Page Customization Guide

## How to Replace the Background Image

1. **Prepare your image:**
   - Recommended resolution: 1920x1080 or higher
   - Supported formats: JPG, PNG, WebP
   - Keep file size under 500KB for best performance

2. **Add your image:**
   - Place your image in `client/public/` folder
   - Name it `login-bg.jpg` (or any name you prefer)

3. **Update the code (if using a different name):**
   - Open `client/src/pages/Login.jsx`
   - Find line with `backgroundImage: 'url(/login-bg.jpg)'`
   - Change `login-bg.jpg` to your image filename

## How to Replace the Logo

1. **Option 1: Use an image**
   - Place your logo in `client/public/` folder (e.g., `logo.png`)
   - In `Login.jsx`, replace the logo section with:
   ```jsx
   <img src="/logo.png" alt="Logo" className="w-20 h-20 mx-auto" />
   ```

2. **Option 2: Keep the text logo**
   - The current placeholder shows "M" for Morgen
   - Simply change the letter inside the `<span>` tag

## Color Customization

To match your brand colors, update these classes in `Login.jsx`:

- **Background overlay:** `from-[#0a4d5c]/90` - Change the hex color
- **Card background:** `from-[#1a5f7a]/40` - Change the hex color
- **Button colors:** `from-[#1a5f7a] to-[#0d4a5f]` - Change both hex colors
- **Accent colors:** `text-cyan-300` - Change to your brand color

## Tips

- Use a high-quality image with good contrast for text readability
- The dark overlay helps ensure text remains visible
- Test on different screen sizes to ensure responsiveness
