# Stellar Web - Project Specification

## Overview
An interactive particle animation system where nodes move around the canvas and form dynamic connections based on proximity, creating constellation-like patterns.

## Core Requirements

### Node/Particle System
- **Node Properties:**
  - Position (x, y)
  - Velocity (dx, dy) for movement
  - Size (visual radius)

- **Node Behavior:**
  - Nodes spawn randomly from edges of the canvas (top, right, bottom, left)
  - Each node has a random direction of movement
  - Nodes move continuously at a speed determined by the speed slider
  - Nodes exit and are removed when they leave the canvas bounds
  - New nodes spawn to maintain the target node count

### Connection System
- **Proximity-Based Connections:**
  - Draw a line between ANY two nodes that are within the connectivity radius
  - Each node connects to ALL nearby nodes (not just one)
  - Connections are purely visual (no physics effects)
  - Connections update dynamically every frame as nodes move

- **Distance Calculation:**
  - For each frame, check every pair of nodes (nested loop)
  - Calculate Euclidean distance: `sqrt((x2-x1)² + (y2-y1)²)`
  - If distance <= connectivity radius, draw a line between them

### Canvas & Animation
- Full-screen or large canvas area
- Continuous animation loop using requestAnimationFrame
- Dark background (black or dark blue) for space theme
- White or light-colored nodes and connections

## User Controls (Sliders)

### Required Sliders:
1. **Node Speed** - Controls velocity magnitude of particles
2. **Connectivity Radius** - Distance threshold for drawing connections
3. **Node Count** - Target number of active nodes on screen
4. **Node Size** - Visual radius of particles
5. **Edge Thickness** - Line width for connections

### Control Panel Design:
- All sliders grouped in a collapsible panel
- Toggle button to show/hide controls (similar to previous starfield assignment)
- Panel should not interfere with statistics display when expanded
- Sliders should have clear labels and show current values

## Stretch Goals

### 1. Collapsible Controls Panel
- Implement toggle mechanism to hide/show sliders
- Maximize canvas viewing area when controls are hidden
- Smooth transition animation for panel (optional but nice)
- Remember panel state (open/closed) during session

### 2. Network Statistics Panel
- **Location:** Small panel fixed in a corner (suggest top-left or top-right)
- **Always Visible:** Does not collapse or hide
- **Update Frequency:** Every 5-10 frames (~100-200ms) to avoid performance issues

- **Required Metrics:**
  1. **Total Edges** - Current number of active connections
  2. **Average Connections per Node** - `(Total Edges × 2) / Node Count`
  3. **Network Density** - `Total Edges / (Node Count × (Node Count - 1) / 2)`
     - This represents the ratio of actual connections to possible connections
     - Value between 0 (no connections) and 1 (fully connected)

- **Display Format:**
  - Clear labels for each metric
  - Format numbers appropriately (e.g., density as percentage or decimal to 2-3 places)
  - Compact layout to minimize screen space

## Technical Considerations

### Performance
- **Distance Calculations:** O(N²) complexity for N nodes
  - Acceptable for typical node counts (50-100 nodes)
  - May need optimization if node count exceeds 200

- **Spawning Logic:**
  - Maintain target node count by spawning new nodes when old ones exit
  - Spawn from just outside visible canvas (margin of ~10-20px)
  - Random edge selection for natural appearance

- **Offscreen Detection:**
  - Use margin buffer so nodes fully exit before removal
  - Check bounds after position update each frame

### Visual Design Suggestions
- **Nodes:** White or light blue circles
- **Connections:** Semi-transparent lines (lower opacity for less visual clutter)
- **Background:** Black or dark navy for space theme
- **Line opacity:** Consider fading based on distance (closer = more opaque) for extra polish

### Code Structure Recommendations
- `Node` class with constructor, update(), draw(), and isOffScreen() methods
- `spawnNode()` function to create nodes at random edges
- Main animation loop handling:
  - Node updates and spawning
  - Connection detection and drawing
  - Statistics calculation (every frame)
  - Statistics display update (every N frames)
- Event listeners for sliders
- Frame counter for throttled statistics updates

## Implementation Notes
- Calculate statistics every frame (needed for visualization)
- Update statistics DISPLAY less frequently (every 10 frames)
- Use frame counter: `if (frameCount % 10 === 0) updateStatsDisplay()`
- For average connections: Each edge connects two nodes, so multiply total edges by 2 then divide by node count

## Default Starting Values (Suggestions)
- Node Count: 50
- Node Speed: 1-2 pixels per frame
- Connectivity Radius: 100-150 pixels
- Node Size: 2-4 pixels
- Edge Thickness: 1 pixel
- Statistics update interval: Every 10 frames

## Success Criteria
- Nodes move smoothly across canvas
- Connections appear/disappear dynamically as nodes move
- All sliders affect their respective parameters in real-time
- Controls can be hidden to maximize viewing area
- Statistics panel displays accurate metrics
- No performance issues with typical node counts
