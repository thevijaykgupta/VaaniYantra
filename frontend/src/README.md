# VaaniYantra Frontend

A modern React-based frontend for the VaaniYantra multilingual transcription system.

## Features

- **Real-time Transcription**: Live speech-to-text conversion
- **Multilingual Translation**: Support for multiple Indian languages
- **WebSocket Integration**: Real-time communication with backend
- **Responsive Design**: Mobile and desktop optimized
- **Modern UI**: Cinematic design with smooth animations

## Project Structure

```
src/
├── main.jsx                 # React entry point
├── App.jsx                  # Root controller (layout + global state)
├── components/              # Reusable UI components
│   ├── Header/
│   │   ├── Header.jsx
│   │   └── Header.css
│   ├── Sidebar/
│   │   ├── Sidebar.jsx
│   │   └── Sidebar.css
│   ├── Chakra/
│   │   ├── Chakra.jsx
│   │   ├── Chakra.css
│   │   └── ChakraMobile.jsx
│   ├── Transcription/
│   │   ├── OriginalTranscription.jsx
│   │   ├── LiveTranslation.jsx
│   │   └── Transcription.css
│   ├── Status/
│   │   ├── ConnectionStatus.jsx
│   │   ├── SystemMode.jsx
│   │   └── StatusFooter.jsx
│   └── common/
│       ├── IconButton.jsx
│       └── Tooltip.jsx
├── hooks/                   # Logic-only reusable hooks
│   ├── useWebSocket.js
│   └── useResponsive.js
├── assets/                  # Static assets
│   ├── videos/
│   ├── images/
│   ├── icons/
│   └── textures/
├── styles/                  # Global styles
│   ├── variables.css        # CSS variables
│   ├── base.css             # Reset + base styles
│   ├── layout.css           # Layout styles
│   └── responsive.css       # Media queries
├── utils/                   # Utility functions
│   ├── constants.js
│   └── formatters.js
└── README.md
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Key Components

- **App.jsx**: Main application component managing global state
- **Chakra.jsx**: Central processing visualization with audio wave animations
- **Transcription Components**: Handle real-time transcription display
- **WebSocket Hook**: Manages backend communication
- **Responsive Hook**: Handles responsive design logic

## Technologies Used

- React 18
- Vite
- CSS Modules
- WebSocket API
- Modern CSS (Grid, Flexbox, Animations)

