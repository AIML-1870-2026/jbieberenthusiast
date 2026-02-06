# Turing Patterns Explorer - Project Specification

## Project Overview
A minimalist, visually-focused web application for exploring reaction-diffusion systems (Turing patterns) using the Gray-Scott model. The application features side-by-side simulation comparison, interactive brush tools, and an intuitive parameter exploration interface.

## Core Design Philosophy
- **Minimalist interface**: Clean, uncluttered design that puts the visual simulation front and center
- **Visual exploration**: Emphasis on beautiful, dynamic patterns with easy-to-use controls
- **Interactive experimentation**: Users can paint, adjust, and compare patterns in real-time

---

## Feature Requirements

### 1. Dual Simulation Display (Stretch Challenge #2)
**Main Simulation Canvas**
- Large, prominent canvas taking up majority of screen space (left side)
- Real-time reaction-diffusion simulation display
- Responsive to user interactions (clicking, drawing)

**Comparison Simulation Canvas**
- Secondary canvas (right side) for side-by-side comparison
- Runs independently with its own parameters
- Slightly smaller than main canvas but still clearly visible
- Can be toggled on/off to maximize main canvas when not needed

### 2. Interactive Brush Tools (Stretch Challenge #1)
**Brush Controls**
- **Chemical Selection**: Toggle between Chemical A and Chemical B
  - Visual indicator showing which chemical is selected
  - Simple button or radio button interface
  
- **Brush Size Control**: Three preset sizes
  - Small: Fine detail work
  - Medium: General painting
  - Large: Broad strokes
  - Clean button interface for size selection

- **Drawing Interaction**
  - Click and drag on canvas to paint selected chemical
  - Visual feedback showing brush cursor
  - Works on both main and comparison canvases

- **Clear Canvas Button**
  - Reset chemical concentrations to initial state
  - Separate clear buttons for main and comparison canvases

### 3. Color Palette System
**Four Color Schemes**
1. **Classic**: Grayscale or black/white traditional look
2. **Vibrant**: Bright, saturated colors (neon/electric feel)
3. **Cool-Toned**: Blues, teals, purples
4. **Warm-Toned**: Oranges, reds, yellows

**Palette Selector**
- Simple button interface (4 buttons, one per palette)
- Visual indicator showing active palette
- Applies to main canvas (comparison canvas can have independent palette)

### 4. Pattern Presets
**Six Classic Patterns**
1. **Spots**: Isolated circular formations
2. **Stripes**: Parallel linear patterns
3. **Maze**: Complex interconnected pathways
4. **Spirals**: Rotating wave patterns
5. **Waves**: Traveling wave formations
6. **Mitosis**: Cell-division-like patterns

**Preset Interface**
- Six clearly labeled buttons
- **Automatic morphing**: When preset is clicked, parameters smoothly animate to new values
- Visual feedback on active preset
- Each preset has predefined F and K values

### 5. Visual Parameter Space Map
**Display**
- Located in a sidebar (collapsible/toggleable recommended)
- 2D grid showing F (feed rate) on X-axis, K (kill rate) on Y-axis
- Visual representation of different pattern regions
- Can be color-coded or labeled by pattern type

**Interaction**
- Clickable: User clicks any point on map
- Main simulation smoothly animates to those F/K values
- Visual indicator showing current position in parameter space

**Parameter Ranges**
- F (feed rate): 0.01 to 0.08
- K (kill rate): 0.045 to 0.065

### 6. Manual Parameter Controls
**Main Simulation**
- F (feed rate) slider with numeric display
- K (kill rate) slider with numeric display
- Diffusion rate controls (if desired for advanced users)
- Reset to default button

**Comparison Simulation**
- Simplified controls (F and K sliders only)
- Independent from main simulation
- Preset selector for comparison canvas

### 7. Animation Controls
**Playback Controls**
- Play/Pause button
- Speed control slider (0.5x, 1x, 2x, 5x simulation speed)
- Step-forward button (advance one frame at a time)

**Morphing Animation**
- Smooth parameter transitions when switching presets
- Duration: 2-3 seconds for parameter interpolation
- Visual indication that morphing is occurring

### 8. Utility Features
**Export/Save**
- "Save Image" button to download current pattern as PNG
- High resolution export option
- Separate save for main and comparison views

**Reset Functions**
- "Reset Parameters" - return to default F/K values
- "Clear Canvas" - reset chemical concentrations
- "Randomize" - inject random noise to start new pattern

**Information Panel**
- Optional toggleable info panel
- Brief explanation of what user is seeing
- Current F/K values displayed
- Pattern type name (if identifiable)

---

## User Interface Layout

### Overall Structure
```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: "Turing Patterns Explorer"                         │
├──────────────┬──────────────────────────┬───────────────────┤
│              │                          │                   │
│  PARAMETER   │   MAIN SIMULATION        │   COMPARISON      │
│  SPACE MAP   │   (Large Canvas)         │   SIMULATION      │
│  (Sidebar)   │                          │   (Medium Canvas) │
│              │                          │                   │
│  - F/K Grid  │   [Interactive Canvas]   │   [Canvas]        │
│  - Clickable │                          │                   │
│              │                          │                   │
├──────────────┴──────────────────────────┴───────────────────┤
│  CONTROL PANEL (Bottom/Below Canvases)                      │
│  ┌──────────────┬────────────────┬──────────────────────┐   │
│  │ PRESETS      │ BRUSH TOOLS    │ COLORS & CONTROLS    │   │
│  │ [6 Buttons]  │ - Chem A/B     │ - Palette Select     │   │
│  │              │ - Size S/M/L   │ - Play/Pause/Speed   │   │
│  │              │ - Clear        │ - Save Image         │   │
│  └──────────────┴────────────────┴──────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Layout Notes
- **Responsive design**: Adapts to different screen sizes
- **Sidebar**: Parameter space map can be collapsed to maximize canvas space
- **Comparison canvas**: Can be toggled off to show only main simulation
- **Control panel**: Organized into logical groups with clear visual separation

---

## Technical Requirements

### Technology Stack
- **HTML5**: Structure and canvas elements
- **CSS3**: Styling, layout, animations
- **JavaScript**: Simulation logic, user interactions, rendering

### Performance Considerations
- Target 30-60 FPS for smooth animation
- Efficient canvas rendering
- RequestAnimationFrame for animation loop
- Optimize grid calculations for real-time performance

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- HTML5 Canvas support required
- ES6+ JavaScript features acceptable

### Code Organization
- Modular JavaScript structure
- Separate files for simulation logic, UI, and rendering (optional but recommended)
- Clear, commented code for educational purposes

---

## Gray-Scott Model Parameters

### Core Equations
The simulation uses the Gray-Scott reaction-diffusion model:
- ∂A/∂t = Da∇²A - AB² + F(1-A)
- ∂B/∂t = Db∇²B + AB² - (K+F)B

### Parameter Definitions
- **F (feed rate)**: Rate at which Chemical A is added (range: 0.01 - 0.08)
- **K (kill rate)**: Rate at which Chemical B is removed (range: 0.045 - 0.065)
- **Da (diffusion A)**: Diffusion rate for Chemical A (typically 1.0)
- **Db (diffusion B)**: Diffusion rate for Chemical B (typically 0.5)

### Preset Pattern Parameters (Example Values)
1. **Spots**: F=0.055, K=0.062
2. **Stripes**: F=0.035, K=0.060
3. **Maze**: F=0.029, K=0.057
4. **Spirals**: F=0.018, K=0.051
5. **Waves**: F=0.014, K=0.045
6. **Mitosis**: F=0.042, K=0.059

*(Note: These are starting values; fine-tune during development for best visual results)*

---

## User Interaction Flows

### Primary Use Case: Exploring Patterns
1. User opens application → sees default pattern forming on main canvas
2. Clicks preset button (e.g., "Stripes") → parameters smoothly morph → new pattern emerges
3. Selects different color palette → visual style updates instantly
4. Uses brush tool to disturb pattern → paints Chemical B with medium brush
5. Observes how pattern self-organizes around disturbance

### Comparison Workflow
1. User toggles on comparison canvas
2. Main canvas shows "Spots" pattern
3. Comparison canvas set to "Maze" pattern
4. User observes both patterns side-by-side
5. Adjusts F/K parameters on comparison to see subtle variations
6. Saves both images for documentation

### Parameter Space Exploration
1. User opens parameter space map sidebar
2. Clicks various regions of F/K grid
3. Main simulation animates to clicked parameters
4. User discovers interesting transitional patterns
5. Fine-tunes with manual sliders
6. Saves favorite combinations as screenshots

---

## Visual Design Guidelines

### Color and Style
- **Clean, modern aesthetic**: Minimal visual clutter
- **High contrast**: Controls easily distinguishable from background
- **Dark theme recommended**: Makes colorful patterns pop
- **Smooth transitions**: All parameter changes and UI updates should feel fluid

### Typography
- Clear, readable fonts
- Adequate font sizes for labels and values
- Consistent hierarchy (headers, labels, values)

### Button and Control Design
- Clear active/inactive states
- Hover effects for interactivity feedback
- Consistent sizing and spacing
- Grouped logically by function

### Canvas Presentation
- Thin border or subtle shadow to define canvas edges
- Black or dark background around canvases
- Smooth rendering without visible artifacts

---

## Accessibility Considerations
- Keyboard navigation support where feasible
- Clear labels for all controls
- Adequate color contrast for UI elements
- Descriptive alt text and ARIA labels for screen readers (if time permits)

---

## Success Criteria
The project will be considered successful when:
1. ✅ Both main and comparison simulations run smoothly side-by-side
2. ✅ All six presets produce visually distinct, recognizable patterns
3. ✅ Brush tools allow intuitive chemical painting on canvas
4. ✅ Color palettes provide variety and visual appeal
5. ✅ Parameter space map enables easy exploration of F/K values
6. ✅ Morphing animation creates smooth, engaging transitions
7. ✅ Application is deployed and accessible via GitHub Pages
8. ✅ Code is clean, organized, and well-commented

---

## Deployment
- Host on **GitHub Pages**
- URL format: `username.github.io/turing-explorer`
- Single-page application (index.html + CSS/JS files)
- All assets self-contained (no external dependencies if possible)

---

## Future Enhancement Ideas (Beyond Current Scope)
- Multiple reaction-diffusion models (Brusselator, Schnakenberg)
- Gallery of saved patterns with community sharing
- Parameter preset saving/loading
- 3D visualization option
- Mobile touch support optimization
- Performance settings for different hardware

---

## Development Notes for Claude Code
- Prioritize getting the core simulation working first
- Implement main canvas before comparison canvas
- Build UI incrementally: presets → brush tools → parameter map
- Test performance with different grid sizes
- Ensure smooth animation before adding complex features
- Comment code thoroughly for educational purposes

---

**End of Specification**

*This spec.md should be shared with Claude Code to begin implementation.*
