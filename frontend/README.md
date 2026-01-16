# VAANIYANTRA Frontend - Enhanced Cinematic UI

## 📁 Project Structure

```
frontend/
├── assets/
│   ├── favicon.svg              # Tab favicon
│   ├── images/                  # Static images (logo, icons)
│   └── textures/                # Background layers & effects
│       ├── bg_space_texture.svg # Main space background
│       ├── dust_overlay.svg     # Micro-particle dust
│       └── panel_noise.svg      # Panel inner texture
├── index.html                   # Main HTML structure
├── styles.css                   # Enhanced cinematic styles
└── script.js                    # Interactive functionality
<TopBar>
 ├─ Left: Logo + VAANIYANTRA
 ├─ Center: Session → Language → Latency
 └─ Right: Language dropdown + Profile
</TopBar>

```

## 🎨 Visual Enhancements

### ✨ Cinematic Background System
- **Space Layer**: Dark radial gradient with golden dust particles
- **Dust Overlay**: Micro-particle effects for depth
- **Slow Drift**: 180s background position animation

### 🌟 Enhanced Chakra
- **Ambient Glow**: Radial gradient behind entire chakra
- **Layered Opacities**: Different transparency levels per ring type
- **Phase Offsets**: Staggered starting rotations for complexity
- **Inner Glow**: Soft drop-shadow on all rings

### 🎭 Premium Panels
- **Space Integration**: Semi-transparent backgrounds
- **Inner Texture**: Subtle noise overlay
- **Soft Shadows**: Deeper, more cinematic shadows
- **Backdrop Blur**: Glass-morphism effect

### 🎨 Typography & Colors
- **Softer Gold**: #d8b76a instead of harsh yellow
- **Better Spacing**: letter-spacing: 0.02em
- **Smaller Base**: font-size: 13px

## 🚀 Running the Application

```bash
# Frontend (Port 3000)
cd frontend
python -m http.server 3000

# Backend (Port 8000)
cd ../Vaani_Yantra/backend
python run.py
```

Open `http://localhost:3000` for the enhanced UI.

## 🎮 Interactive Features

- **C** - Cycle connection states
- **S** - Simulate speech detection
- Chakra pulses and rotates during speech
- Rings pause when disconnected

## 🎯 Design Philosophy

The UI now embodies a **silent, intelligent system** with:
- Motion that maps directly to system state
- Never moves without reason
- Feels embedded in cinematic space
- Calm intelligence rather than flashy effects