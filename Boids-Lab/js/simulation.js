// Main Simulation Loop and State Management
import { Boid } from './boid.js';
import { Heatmap } from './heatmap.js';
import { random, distanceSquared } from './utils.js';

// Theme configurations
const THEMES = {
  minimal: {
    background: '#0a0a14',
    boidColor: 'rgba(200, 200, 200, 0.9)',
    boidGlow: 'rgba(255, 255, 255, 0.2)',
    trailColor: 'rgba(150, 150, 150, 0.3)',
    obstacleColor: 'rgba(100, 100, 100, 0.6)',
    obstacleBorder: 'rgba(150, 150, 150, 0.8)',
    mouseAttract: 'rgba(150, 150, 150, 0.3)',
    mouseRepel: 'rgba(150, 150, 150, 0.3)',
    useSpeedColor: false
  },
  neon: {
    background: '#0a0a14',
    boidColor: null, // Uses speed-based color
    boidGlow: null,
    trailColor: 'rgba(0, 255, 255, 0.15)',
    obstacleColor: 'rgba(255, 0, 128, 0.3)',
    obstacleBorder: 'rgba(255, 0, 255, 0.8)',
    mouseAttract: 'rgba(0, 255, 100, 0.3)',
    mouseRepel: 'rgba(255, 100, 100, 0.3)',
    useSpeedColor: true
  },
  nature: {
    background: '#1a2a1a',
    boidColor: null, // Uses speed-based color with nature palette
    boidGlow: null,
    trailColor: 'rgba(100, 180, 100, 0.12)',
    obstacleColor: 'rgba(101, 67, 33, 0.6)',
    obstacleBorder: 'rgba(139, 90, 43, 0.8)',
    mouseAttract: 'rgba(100, 200, 100, 0.3)',
    mouseRepel: 'rgba(200, 100, 50, 0.3)',
    useSpeedColor: true,
    natureColors: true
  }
};

class Simulation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Canvas dimensions
    this.width = 1200;
    this.height = 700;
    canvas.width = this.width;
    canvas.height = this.height;

    // Simulation parameters (defaults)
    this.params = {
      separation: 1.5,
      alignment: 1.0,
      cohesion: 1.0,
      neighborRadius: 50,
      maxSpeed: 4.0,
      maxForce: 0.1
    };

    // State
    this.boids = [];
    this.paused = false;
    this.boundaryMode = 'wrap';

    // Visual options
    this.colorBySpeed = true;
    this.showHeatmap = false;
    this.heatmapIntensity = 0.7;

    // Theme system
    this.currentTheme = 'neon';
    this.theme = THEMES[this.currentTheme];

    // Motion trails
    this.showTrails = false;
    this.trailLength = 15;
    this.trails = []; // Array of trail arrays for each boid

    // Mouse interaction
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseOnCanvas = false;
    this.mouseMode = 'off';
    this.mouseRadius = 150;
    this.mouseStrength = 0.5;

    // Obstacles
    this.obstacles = [];
    this.obstacleAvoidanceStrength = 2.0;

    // Heatmap system
    this.heatmap = new Heatmap(this.width, this.height, 30);

    // Statistics
    this.stats = {
      fps: 0,
      boidCount: 0,
      avgSpeed: 0,
      avgNeighbors: 0
    };

    // FPS calculation
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();

    // Animation frame ID
    this.animationId = null;

    // Initialize
    this.reset();
    this.setupMouseTracking();
  }

  // Setup mouse tracking and obstacle placement
  setupMouseTracking() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left) * (this.width / rect.width);
      this.mouseY = (e.clientY - rect.top) * (this.height / rect.height);
    });

    this.canvas.addEventListener('mouseenter', () => {
      this.mouseOnCanvas = true;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouseOnCanvas = false;
    });

    // Left click to add obstacle
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (this.width / rect.width);
      const y = (e.clientY - rect.top) * (this.height / rect.height);
      this.addObstacle(x, y, 30 + Math.random() * 30); // Random radius 30-60
    });

    // Right click to remove nearest obstacle
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (this.width / rect.width);
      const y = (e.clientY - rect.top) * (this.height / rect.height);
      this.removeNearestObstacle(x, y);
    });
  }

  // Add an obstacle at position
  addObstacle(x, y, radius) {
    this.obstacles.push({ x, y, radius });
  }

  // Remove nearest obstacle
  removeNearestObstacle(x, y) {
    if (this.obstacles.length === 0) return;

    let nearestIndex = 0;
    let nearestDistSq = Infinity;

    for (let i = 0; i < this.obstacles.length; i++) {
      const obs = this.obstacles[i];
      const dSq = distanceSquared(x, y, obs.x, obs.y);
      if (dSq < nearestDistSq) {
        nearestDistSq = dSq;
        nearestIndex = i;
      }
    }

    // Only remove if clicked reasonably close
    if (nearestDistSq < 10000) {
      this.obstacles.splice(nearestIndex, 1);
    }
  }

  // Clear all obstacles
  clearObstacles() {
    this.obstacles = [];
  }

  // Reset simulation
  reset() {
    this.boids = [];
    this.trails = [];
    const boidCount = 150;

    for (let i = 0; i < boidCount; i++) {
      const x = random(0, this.width);
      const y = random(0, this.height);
      this.boids.push(new Boid(x, y, this.width, this.height));
      this.trails.push([]); // Initialize empty trail for each boid
    }

    this.heatmap.reset();
    this.stats.boidCount = this.boids.length;
  }

  // Set theme
  setTheme(themeName) {
    if (THEMES[themeName]) {
      this.currentTheme = themeName;
      this.theme = THEMES[themeName];
      return themeName;
    }
    return this.currentTheme;
  }

  // Cycle through themes
  cycleTheme() {
    const themes = ['minimal', 'neon', 'nature'];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    return this.setTheme(nextTheme);
  }

  // Apply preset
  applyPreset(preset) {
    Object.assign(this.params, preset);
  }

  // Update parameter
  setParam(name, value) {
    if (name in this.params) {
      this.params[name] = value;
    }
  }

  // Toggle pause
  togglePause() {
    this.paused = !this.paused;
    return this.paused;
  }

  // Toggle boundary mode
  toggleBoundaryMode() {
    this.boundaryMode = this.boundaryMode === 'wrap' ? 'bounce' : 'wrap';
    return this.boundaryMode;
  }

  // Cycle mouse modes
  cycleMouseMode() {
    const modes = ['off', 'attract', 'repel'];
    const currentIndex = modes.indexOf(this.mouseMode);
    this.mouseMode = modes[(currentIndex + 1) % modes.length];
    return this.mouseMode;
  }

  // Calculate obstacle avoidance force for a boid
  calculateObstacleAvoidance(boid) {
    let forceX = 0;
    let forceY = 0;

    for (const obs of this.obstacles) {
      const dx = boid.x - obs.x;
      const dy = boid.y - obs.y;
      const distSq = dx * dx + dy * dy;
      const avoidRadius = obs.radius + 40; // Buffer zone around obstacle

      if (distSq < avoidRadius * avoidRadius && distSq > 0) {
        const dist = Math.sqrt(distSq);
        // Stronger force as boid gets closer
        const strength = this.obstacleAvoidanceStrength * (1 - dist / avoidRadius);
        forceX += (dx / dist) * strength;
        forceY += (dy / dist) * strength;
      }
    }

    return { x: forceX, y: forceY };
  }

  // Calculate mouse force
  calculateMouseForce(boid) {
    const dx = this.mouseX - boid.x;
    const dy = this.mouseY - boid.y;
    const distSq = dx * dx + dy * dy;
    const radiusSq = this.mouseRadius * this.mouseRadius;

    if (distSq > radiusSq || distSq < 1) {
      return { x: 0, y: 0 };
    }

    const dist = Math.sqrt(distSq);
    let fx = dx / dist;
    let fy = dy / dist;
    const strength = this.mouseStrength * (1 - dist / this.mouseRadius);

    if (this.mouseMode === 'repel') {
      fx *= -strength;
      fy *= -strength;
    } else {
      fx *= strength;
      fy *= strength;
    }

    return { x: fx, y: fy };
  }

  // Update trail for a boid
  updateTrail(boidIndex, x, y) {
    if (!this.showTrails) return;

    const trail = this.trails[boidIndex];
    trail.unshift({ x, y });

    if (trail.length > this.trailLength) {
      trail.pop();
    }
  }

  // Main update loop
  update() {
    const { separation, alignment, cohesion, neighborRadius, maxSpeed, maxForce } = this.params;

    let totalSpeed = 0;
    let totalNeighbors = 0;

    for (let i = 0; i < this.boids.length; i++) {
      const boid = this.boids[i];

      // Update trail before moving
      this.updateTrail(i, boid.x, boid.y);

      // Find neighbors
      boid.findNeighbors(this.boids, neighborRadius);

      // Calculate flocking forces
      const sepForce = boid.separation(separation);
      const aliForce = boid.alignment(alignment, maxSpeed, maxForce);
      const cohForce = boid.cohesion(cohesion, maxSpeed, maxForce);

      // Apply flocking forces
      boid.applyForce(sepForce.x, sepForce.y);
      boid.applyForce(aliForce.x, aliForce.y);
      boid.applyForce(cohForce.x, cohForce.y);

      // Apply obstacle avoidance
      if (this.obstacles.length > 0) {
        const obsForce = this.calculateObstacleAvoidance(boid);
        boid.applyForce(obsForce.x, obsForce.y);
      }

      // Apply mouse interaction
      if (this.mouseMode !== 'off' && this.mouseOnCanvas) {
        const mouseForce = this.calculateMouseForce(boid);
        boid.applyForce(mouseForce.x, mouseForce.y);
      }

      // Update physics
      boid.update(maxSpeed);
      boid.handleBoundaries(this.boundaryMode);

      // Stats
      totalSpeed += boid.getSpeed();
      totalNeighbors += boid.neighborCount;
    }

    // Update heatmap
    if (this.showHeatmap && this.frameCount % 2 === 0) {
      this.heatmap.update(this.boids);
    }

    // Update stats
    if (this.frameCount % 10 === 0) {
      this.stats.avgSpeed = totalSpeed / this.boids.length;
      this.stats.avgNeighbors = totalNeighbors / this.boids.length;
      this.stats.boidCount = this.boids.length;
    }

    // FPS
    const now = performance.now();
    this.frameCount++;
    if (now - this.lastFpsUpdate >= 1000) {
      this.stats.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  }

  // Draw trails
  drawTrails() {
    if (!this.showTrails) return;

    this.ctx.lineCap = 'round';

    for (let i = 0; i < this.trails.length; i++) {
      const trail = this.trails[i];
      if (trail.length < 2) continue;

      const boid = this.boids[i];

      for (let j = 0; j < trail.length - 1; j++) {
        const p1 = trail[j];
        const p2 = trail[j + 1];

        // Skip if points are too far apart (boid wrapped around screen)
        // Max speed is 8, so normal movement is <10px per frame. Use 20 as threshold.
        const dx = Math.abs(p1.x - p2.x);
        const dy = Math.abs(p1.y - p2.y);
        if (dx > 20 || dy > 20) continue;

        const alpha = (1 - j / trail.length) * 0.5;
        const width = (1 - j / trail.length) * 2.5;

        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);

        if (this.theme.useSpeedColor && this.colorBySpeed) {
          const speed = boid.getSpeed();
          const hue = this.theme.natureColors
            ? 80 + (speed / this.params.maxSpeed) * 40
            : boid.getSpeedHue(this.params.maxSpeed);
          this.ctx.strokeStyle = `hsla(${hue}, 70%, 50%, ${alpha})`;
        } else {
          this.ctx.strokeStyle = this.theme.trailColor.replace('0.', `${alpha * 0.5}.`);
        }

        this.ctx.lineWidth = width;
        this.ctx.stroke();
      }
    }
  }

  // Draw obstacles
  drawObstacles() {
    for (const obs of this.obstacles) {
      // Outer glow
      const gradient = this.ctx.createRadialGradient(
        obs.x, obs.y, obs.radius * 0.8,
        obs.x, obs.y, obs.radius * 1.3
      );
      gradient.addColorStop(0, this.theme.obstacleColor);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      this.ctx.beginPath();
      this.ctx.arc(obs.x, obs.y, obs.radius * 1.3, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();

      // Main circle
      this.ctx.beginPath();
      this.ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = this.theme.obstacleColor;
      this.ctx.fill();
      this.ctx.strokeStyle = this.theme.obstacleBorder;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }

  // Render
  render() {
    // Clear with theme background
    this.ctx.fillStyle = this.theme.background;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Heatmap layer
    if (this.showHeatmap) {
      this.heatmap.draw(this.ctx, this.heatmapIntensity);
    }

    // Trails layer
    this.drawTrails();

    // Obstacles
    this.drawObstacles();

    // Mouse influence radius
    if (this.mouseMode !== 'off' && this.mouseOnCanvas) {
      this.ctx.beginPath();
      this.ctx.arc(this.mouseX, this.mouseY, this.mouseRadius, 0, Math.PI * 2);
      this.ctx.strokeStyle = this.mouseMode === 'attract'
        ? this.theme.mouseAttract
        : this.theme.mouseRepel;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(this.mouseX, this.mouseY, 5, 0, Math.PI * 2);
      this.ctx.fillStyle = this.mouseMode === 'attract'
        ? this.theme.mouseAttract.replace('0.3', '0.6')
        : this.theme.mouseRepel.replace('0.3', '0.6');
      this.ctx.fill();
    }

    // Boids
    const useSpeedColor = this.theme.useSpeedColor && this.colorBySpeed;
    for (const boid of this.boids) {
      boid.draw(this.ctx, useSpeedColor, this.params.maxSpeed, this.theme);
    }
  }

  // Animation loop
  loop() {
    if (!this.paused) {
      this.update();
    }
    this.render();
    this.animationId = requestAnimationFrame(() => this.loop());
  }

  // Start
  start() {
    this.loop();
  }

  // Stop
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // Get stats
  getStats() {
    return this.stats;
  }
}

export { Simulation };
