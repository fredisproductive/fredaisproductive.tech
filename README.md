# fredaisproductive.tech

Personal portfolio website designed and implemented from Figma.

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Google Fonts** - Typography (Manrope, Source Serif 4, PT Serif, Sofadi One)

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

The site will be available at `http://localhost:5173`

### Build

Build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Vercel will automatically detect Vite and configure the build
4. Add your custom domain (`fredaisproductive.tech`) in Vercel project settings
5. Update DNS records at your domain registrar to point to Vercel

### Deploy to GitHub Pages

1. Install `gh-pages` package: `npm install --save-dev gh-pages`
2. Add to `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. Run `npm run deploy`
4. Configure custom domain in GitHub Pages settings
5. Update DNS records at your domain registrar

## Features

- Clean, minimalist design
- Smooth scroll navigation
- Dark mode toggle (UI ready, functionality can be extended)
- Responsive layout
- Social media links (LinkedIn, GitHub)

## Project Structure

```
├── public/
│   └── assets/          # Image assets from Figma
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Additional styles
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles & Tailwind imports
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── postcss.config.js    # PostCSS configuration
```

## License

© 2025 freda zhao

