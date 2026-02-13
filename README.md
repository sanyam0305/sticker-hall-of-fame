# Sticker Hall of Fame

An interactive, shareable gallery for your favorite WhatsApp stickers. Anyone with the link can view, add, remove, reorder, and vote on stickers!

## Features

- **Add Stickers** - Upload sticker image URLs with names, categories, and tags
- **Remove Stickers** - Delete unwanted stickers
- **Drag & Drop Reorder** - Manually rank stickers by dragging them
- **Voting/Likes** - Vote for your favorites
- **Categories & Tags** - Filter by category and search by tags
- **Real-time Sync** - Changes sync across all users instantly (with Firebase)
- **Demo Mode** - Works locally without Firebase for testing

## Quick Start (Demo Mode)

1. Open `index.html` in your browser
2. The app works immediately in demo mode (data saved to localStorage)
3. Add, remove, reorder, and like stickers locally

## Setup for Sharing (Firebase)

To enable real-time sync so anyone can edit:

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name (e.g., "sticker-hall-of-fame")
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Enable Realtime Database

1. In Firebase Console, go to **Build > Realtime Database**
2. Click **"Create Database"**
3. Choose a location (closest to your users)
4. Select **"Start in test mode"** (for development)
5. Click **"Enable"**

### Step 3: Get Your Config

1. Go to **Project Settings** (gear icon)
2. Scroll to **"Your apps"** section
3. Click the **Web icon** (`</>`)
4. Register your app with a nickname
5. Copy the `firebaseConfig` object

### Step 4: Update app.js

Replace the config at the top of `app.js`:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

### Step 5: Set Database Rules (Important!)

1. In Firebase Console, go to **Realtime Database > Rules**
2. For public access (anyone can read/write):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

> **Warning**: This allows anyone to edit. For production, consider adding authentication.

## Deploy to GitHub Pages

### Step 1: Create Repository

1. Create a new GitHub repository
2. Push your files:

```bash
cd sticker-hall-of-fame
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sticker-hall-of-fame.git
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Go to repository **Settings**
2. Navigate to **Pages** (in sidebar)
3. Under "Source", select **"Deploy from a branch"**
4. Choose **"main"** branch and **"/ (root)"** folder
5. Click **Save**

### Step 3: Access Your Site

Your site will be live at:
```
https://YOUR_USERNAME.github.io/sticker-hall-of-fame/
```

## File Structure

```
sticker-hall-of-fame/
├── index.html      # Main HTML structure
├── styles.css      # All styling
├── app.js          # Application logic + Firebase
└── README.md       # This file
```

## How to Use

### Adding a Sticker
1. Click **"+ Add New Sticker"**
2. Paste the sticker image URL
3. Enter a name, select category, add tags
4. Click **"Add Sticker"**

### Removing a Sticker
- Hover over a sticker card and click the **×** button

### Reordering
- Drag and drop sticker cards to change their rank

### Liking
- Click the heart button to like/unlike a sticker

### Filtering
- Click category buttons to filter
- Use the search box to find by name or tags

## Tips for Sticker URLs

Get sticker image URLs from:
- [Telegram Emoji/Sticker CDN](https://em-content.zobj.net/)
- Any direct image URL ending in `.png`, `.webp`, `.gif`
- Upload to [Imgur](https://imgur.com/) and use the direct link

## Customization

### Change Categories
Edit the category options in `index.html` (both in form and filters) and update the filter button in the filter section.

### Change Theme Colors
Modify CSS variables at the top of `styles.css`:

```css
:root {
    --primary: #25D366;           /* WhatsApp green */
    --bg-gradient-start: #667eea; /* Background gradient */
    --bg-gradient-end: #764ba2;
}
```

## License

MIT License - Feel free to use and modify!
