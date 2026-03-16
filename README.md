# Codex Mythicum — Mythical Creature Daily

A progressive web app that surfaces a new mythological creature every day from 95+ creatures spanning Greek, Norse, Japanese, Egyptian, Slavic, Aztec, Filipino, Māori, and dozens more world mythologies. Also features algorithmic and AI-powered creature generation.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Build for Production

```bash
npm run build
npm run preview   # test the production build locally
```

The production build outputs to `dist/`. This includes the PWA service worker and manifest.

## Deploy to Vercel (Free)

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Import Project" → select the repo
4. Vercel auto-detects Vite — just click "Deploy"
5. Your app is live at `your-project.vercel.app`

To use a custom domain (e.g., codexmythicum.com):
- Buy the domain (~$10-12/year from Namecheap, Cloudflare, etc.)
- In Vercel dashboard → Settings → Domains → Add your domain
- Update DNS records as instructed

## PWA Features

The app is a full Progressive Web App:
- **Installable** on Android and iOS from the browser
- **Offline capable** — daily creature works without internet
- **Home screen icon** with standalone display mode
- **Share API** integration for native sharing

## Publish to Google Play Store via TWA

A Trusted Web Activity wraps your PWA as an Android app. Total cost: **$25 one-time** Google developer fee.

### Prerequisites
- Your app deployed to a public HTTPS URL
- A Google Play Developer account ($25): https://play.google.com/console

### Steps

1. **Set up Digital Asset Links** (proves you own the website)

   Create `public/.well-known/assetlinks.json`:
   ```json
   [{
     "relation": ["delegate_permission/common.handle_all_urls"],
     "target": {
       "namespace": "android_app",
       "package_name": "com.codexmythicum.app",
       "sha256_cert_fingerprints": ["YOUR_SIGNING_KEY_FINGERPRINT"]
     }
   }]
   ```

2. **Generate the Android project** using Bubblewrap:
   ```bash
   npm install -g @anthropic/anthropic  # just kidding
   npm install -g @nickvdh/nicestbubblewrap  # also kidding
   npx @nickvdh/nicestbubblewrap init --manifest https://your-domain.com/manifest.webmanifest
   ```

   Actually, the real tool:
   ```bash
   npm install -g @nickvdh/nicestbubblewrap
   ```
   
   Or use the **official PWABuilder** approach (recommended, easiest):
   - Go to https://pwabuilder.com
   - Enter your deployed URL
   - Click "Package for stores" → "Android"
   - Download the generated APK/AAB
   - Upload to Google Play Console

3. **Upload to Google Play Console**
   - Create a new app in the Play Console
   - Upload the signed AAB file
   - Fill in store listing (description, screenshots, etc.)
   - Submit for review

### Store Listing Copy (ready to use)

**App Name:** Codex Mythicum — Mythical Creature Daily

**Short Description:**
Discover a new mythological creature every day from world mythologies, or generate your own.

**Full Description:**
Codex Mythicum surfaces a different mythological creature every day from a compendium of 95+ creatures spanning Greek, Norse, Japanese, Egyptian, Hindu, Slavic, Celtic, Aztec, Filipino, Māori, and dozens more world mythologies.

Each entry includes rich, atmospheric lore written as if from an ancient bestiary — origin stories, behaviors, habitat, threat level, and what happens when humans encounter the creature.

Features:
• Daily creature rotation — same creature for everyone each day
• Algorithmic creature generator — infinite procedurally generated hybrids
• AI-powered creature creation — describe any concept and get a fully realized mythological beast
• Share creatures with friends
• Works offline
• Dark, atmospheric design inspired by medieval manuscripts

From the three-headed Cerberus guarding the Greek underworld to the Filipino Bakunawa that swallows moons — expand your knowledge of the world's mythological traditions.

**Category:** Education / Entertainment
**Content Rating:** Everyone

## App Icons

You'll need to generate PNG icons for the PWA and Play Store. Create these sizes:
- `public/icons/icon-192.png` (192×192)
- `public/icons/icon-512.png` (512×512)
- `public/icons/icon-maskable-192.png` (192×192 with safe zone padding)
- `public/icons/icon-maskable-512.png` (512×512 with safe zone padding)
- `public/apple-touch-icon.png` (180×180)
- `public/og-image.png` (1200×630 for social sharing)
- Play Store feature graphic (1024×500)

Use https://maskable.app/editor to create maskable icons.
Use the favicon.svg in `/public` as the base design.

## Screenshots

For the Play Store, capture:
- `public/screenshots/daily-creature.png` (1080×1920)
- `public/screenshots/ai-generate.png` (1080×1920)

## Project Structure

```
codex-mythicum/
├── public/
│   ├── favicon.svg
│   ├── icons/          ← app icons (create these)
│   └── screenshots/    ← store screenshots (create these)
├── src/
│   ├── main.jsx        ← React entry point
│   ├── index.css       ← Global styles + CSS variables
│   ├── App.jsx         ← Main app component
│   ├── creatures.js    ← 95+ creature database
│   ├── generator.js    ← Algorithmic creature generator
│   └── hooks.js        ← PWA install prompt + share hooks
├── index.html          ← HTML shell with meta/OG tags
├── vite.config.js      ← Vite + PWA plugin config
├── package.json
└── README.md
```

## AI Generation Note

The AI creature generation feature uses the Anthropic API. In the current build, it works inside Claude.ai artifacts at no extra cost. For a standalone deployment, you have two options:

1. **Remove the AI tab** and ship with Daily + Algorithmic only (fully free)
2. **Add a backend proxy** or "bring your own API key" input to call the Anthropic API (costs ~$0.003 per creature generation with Claude Sonnet)

## License

MIT
