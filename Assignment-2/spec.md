# Starfield Animation - Project Specification

## Project Overview
Create an interactive starfield animation webpage where stars spawn from the center of the screen and shoot outward in all directions. The project includes customizable controls and enhanced visual effects to create a unique, visually appealing experience.

## Core Requirements

### Basic Starfield Mechanics
- Stars spawn from the center point of the canvas
- Stars move outward radially in all directions
- Stars leave trails behind them as they move
- Animation runs continuously using requestAnimationFrame

### Required Controls (Sliders)
1. **Trail Length** - Controls how long the star trails persist
2. **Star Count** - Controls the number of active stars in the animation
3. **Star Speed** - Controls how fast stars move outward from center
4. **Spawn Radius** - Controls the initial distance from center where stars begin

## Unique Features (What Makes This Project Special)

### 1. Rainbow Trail Effect
- Stars leave trails that shift through rainbow colors as they fade
- Each trail segment should transition smoothly through the color spectrum
- Colors should fade/dim as the trail disappears
- Suggested approach: Use HSL color model and shift the hue value over time
- Trail should have a gradient effect from bright/saturated to dim/transparent

### 2. Depth/Parallax Layers
- Implement multiple layers of stars at different depths
- Closer stars should move faster (larger on screen, brighter)
- Farther stars should move slower (smaller on screen, dimmer)
- Suggested: 3 layers with different speed multipliers (e.g., 0.5x, 1x, 1.5x)
- This creates a sense of 3D depth and parallax effect

### 3. Special Effects - Shooting Stars/Comets
- Occasionally spawn special "shooting star" or "comet" particles
- These should be visually distinct from regular stars (longer trails, brighter, different trajectory)
- Should appear randomly at intervals
- Could streak across the screen at an angle rather than radially
- Suggested frequency: 1-3 per every few seconds

### 4. Bottom Drawer UI (Stretch Challenge)
- Move all control sliders to a drawer that slides up from the bottom of the screen
- Drawer should be collapsible/expandable with a toggle button
- When collapsed, shows just a small tab or button to open it
- When expanded, reveals all slider controls
- This prevents controls from covering the animation
- Drawer should have semi-transparent background so animation is still partially visible
- Smooth CSS transitions for slide-up/slide-down animation

## Technical Specifications

### HTML Structure
- Full-screen canvas element for the animation
- Bottom drawer container with:
  - Toggle button (visible when collapsed)
  - Control panel with all sliders
  - Labels for each slider
- Proper semantic HTML structure

### CSS Requirements
- Canvas should fill the entire viewport (100vw × 100vh)
- Black or dark background for space effect
- Bottom drawer styling:
  - Fixed position at bottom
  - Transform transitions for smooth sliding
  - Semi-transparent background (e.g., rgba(0, 0, 0, 0.8))
  - Appropriate padding and spacing for controls
- Responsive design considerations
- Styled sliders with labels

### JavaScript/Canvas Requirements
- Use HTML5 Canvas API
- requestAnimationFrame for smooth animation loop
- Star particle system with properties:
  - Position (x, y)
  - Velocity (speed and direction)
  - Layer/depth value
  - Trail history (array of previous positions)
  - Color information for rainbow effect
- Slider event listeners to update animation parameters in real-time
- Bottom drawer toggle functionality
- Random shooting star generation logic

### Color Implementation (Rainbow Trails)
- Use HSL color space: `hsl(hue, saturation%, lightness%)`
- Hue: 0-360 degrees (shifts through rainbow)
- For each trail point, calculate hue based on:
  - Time/age of the trail point
  - Or position in the trail array
- Fade alpha/opacity as trail gets older
- Example: `hsla(hue, 100%, 50%, alpha)`

### Performance Considerations
- Limit total number of particles to maintain smooth framerate
- Efficiently manage trail arrays (remove old points)
- Use appropriate canvas clearing methods
- Consider using offscreen canvas if performance issues arise

## User Experience Goals
- Smooth, mesmerizing animation at 60fps
- Intuitive controls that respond immediately
- Visually impressive with the rainbow and depth effects
- Clean UI that doesn't obstruct the main attraction (the starfield)
- Easy to experiment with different settings

## Stretch Goals (Optional Enhancements)
- Add mouse interaction (stars repelled/attracted to cursor)
- Add more color scheme options beyond rainbow
- Include preset configurations (calm, intense, cosmic, etc.)
- Add background nebula effect
- Include sound effects or music synchronization
- Save/load user preferences in localStorage

## Submission Requirements
- GitHub repository with deployed GitHub Pages link
- This spec.md file in the repository
- Clean, commented code
- README.md with project description and live demo link

## Design Notes
This project emphasizes visual appeal and smooth animation. The combination of rainbow trails, depth layers, and special effects should create a dynamic, eye-catching experience that stands out from basic starfield implementations. The bottom drawer UI demonstrates attention to user experience by keeping the interface unobtrusive while maintaining full functionality.
