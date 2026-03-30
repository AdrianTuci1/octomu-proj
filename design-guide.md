# AI Control Dock – Design Guidelines (Pixel-Perfect Spec)

## 🧠 Overview
This component is a **floating command dock** that acts as a central control hub for:
- AI interaction (text + voice)
- System commands
- Contextual tools (files, images, actions)

It should feel like a **native OS-level command bar**, similar to:
- Raycast
- Spotlight
- ChatGPT / Claude desktop UI

---

# 📐 Layout Architecture

## 1. Root Container (Dock)

### Positioning
- position: fixed
- bottom: 24px
- left: 50%
- transform: translateX(-50%)
- z-index: 1000+

### Dimensions
- Height: 56px – 72px
- Width:
  - Default: 640px
  - Min: 480px
  - Max: 900px
- Padding: 8px 12px

### Shape
- border-radius: 999px (pill)

---

## 2. Visual Styling

### Background
background: rgba(30, 30, 30, 0.85);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);

### Border
border: 1px solid rgba(255, 255, 255, 0.08);

### Shadow
box-shadow: 
  0 8px 30px rgba(0, 0, 0, 0.4),
  inset 0 1px 0 rgba(255,255,255,0.05);

---

## 3. Internal Layout (Flex)

display: flex;
align-items: center;
gap: 12px;

### Structure
[ Input Field (flex-grow) ]   [ Mic Button ]

---

# ✏️ Input Field

## Behavior
- Primary interaction point
- Accepts natural language commands
- Supports autocomplete (optional)

## Styling

flex: 1;
background: transparent;
border: none;
outline: none;

font-family: Inter, SF Pro, sans-serif;
font-size: 15px;
font-weight: 400;

color: rgba(255,255,255,0.9);

### Placeholder
color: rgba(255,255,255,0.4);

### Focus State
.dock:focus-within {
  box-shadow: 
    0 0 0 2px rgba(255,255,255,0.08),
    0 8px 30px rgba(0,0,0,0.4);
}

---

# 🎤 Right Action Button (Microphone)

## Container
- Shape: circle
- Size: 40px

display: flex;
align-items: center;
justify-content: center;

width: 40px;
height: 40px;

border-radius: 50%;
background: rgba(255,255,255,0.06);

## Hover
:hover {
  background: rgba(255,255,255,0.1);
  transform: scale(1.05);
}

## Active (Listening)
.active {
  background: rgba(0, 150, 255, 0.2);
  box-shadow: 0 0 10px rgba(0,150,255,0.4);
}

---

# 🧩 Left Floating Tools (Orbit Actions)

## Concept
These are NOT inside the dock.

They float slightly to the left, forming a vertical cluster:
- AI mode / palette
- Camera (image input)
- File upload

---

## Positioning

position: fixed;
bottom: 32px;
left: calc(50% - 380px);

---

## Layout

display: flex;
flex-direction: column;
gap: 10px;

---

## Button Style

width: 44px;
height: 44px;

border-radius: 50%;
background: #1f1f1f;

display: flex;
align-items: center;
justify-content: center;

box-shadow: 0 6px 20px rgba(0,0,0,0.4);

### Hover
:hover {
  transform: translateY(-2px);
  background: rgba(255,255,255,0.1);
}

---

# 🧠 Interaction States

## 1. Idle
- Dock visible
- No glow
- Minimal UI

---

## 2. Focus
Triggered when input is active

Changes:
- subtle outline
- slight brightness increase

---

## 3. Expanded (Main Mode)

When user submits a command:
- A panel appears above dock
- Dock remains anchored

### Panel
- position: bottom anchored
- max height: 70% of screen
- scrollable

---

## 4. Context Mode

Icons change depending on context:
- image → active when uploading
- mic → active when listening
- attach → active when file selected

---

# 🧱 Layering System

Layer 1: Background app  
Layer 2: Floating tools (left icons)  
Layer 3: Dock (main input)  
Layer 4: Expanded panel (results / chat)  

---

# 🎯 UX Principles

## 1. Single Entry Point
Everything starts from the dock.

---

## 2. Minimal Cognitive Load
- No sidebars
- No clutter
- Only relevant actions visible

---

## 3. Predictable Positioning
- Always bottom center
- Never moves

---

## 4. Progressive Disclosure
- Advanced UI appears only after interaction

---

## 5. Fast Access
- Designed for keyboard-first usage

---

# 🎨 Design Tokens

## Colors

--dock-bg: rgba(30,30,30,0.85);  
--dock-border: rgba(255,255,255,0.08);  
--text-primary: rgba(255,255,255,0.9);  
--text-secondary: rgba(255,255,255,0.4);  
--hover-bg: rgba(255,255,255,0.1);  

---

## Spacing

--dock-padding: 8px 12px;  
--icon-gap: 10px;  
--inner-gap: 12px;  

---

## Radius

--radius-pill: 999px;  
--radius-circle: 50%;  

---

# ⚠️ Common Mistakes

❌ Making the dock too tall  
❌ Adding too many buttons inside  
❌ Removing blur (critical for premium feel)  
❌ Using strong colors (breaks minimalism)  
❌ Misplacing floating tools (must feel “detached but related”)  

---

# 🚀 Extensions (Optional)

## Autocomplete
- suggestions dropdown above dock

## Command parsing
- highlight detected entities

## Voice waveform
- animate mic button

## Multi-session tabs
- floating tabs above dock

---

# 🧩 Summary

This dock is:
- minimal
- centered
- AI-first
- context-aware

It replaces:
❌ menus  
❌ navigation bars  
❌ dashboards  

with:
✅ one intelligent input surface