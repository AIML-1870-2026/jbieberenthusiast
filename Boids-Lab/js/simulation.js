// Main Simulation Loop and State Management
import { Boid } from './boid.js';
import { Heatmap } from './heatmap.js';
import { random } from './utils.js';

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
      maxForce: 0.1  // Steering strength
    };

    // State
    this.boids = [];
    this.paused = false;
    this.boundaryMode = 'wrap';

    // Visual options
    this.colorBySpeed = true;
    this.showHeatmap = false;
    this.heatmapIntensity = 0.7;

    // Heatmap system
    this.heatmap = new Heatmap(this.width, this.height, 30); // 30x30 grid

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
    this.lastFrameTime = performance.now();

    // Animation frame ID for cancellation
    this.animationId = null;

    // Initialize boids
    this.reset();
  }

  // Reset simulation with new random boids
  reset() {
    this.boids = [];
    const boidCount = 150;

    for (let i = 0; i < boidCount; i++) {
      const x = random(0, this.width);
      const y = random(0, this.height);
      this.boids.push(new Boid(x, y, this.width, this.height));
    }

    // Reset heatmap
    this.heatmap.reset();

    // Update stats
    this.stats.boidCount = this.boids.length;
  }

  // Apply a preset configuration
  applyPreset(preset) {
    Object.assign(this.params, preset);
  }

  // Update simulation parameters
  setParam(name, value) {
    if (name in this.params) {
      this.params[name] = value;
    }
  }

  // Toggle pause state
  togglePause() {
    this.paused = !this.paused;
    return this.paused;
  }

  // Toggle boundary mode
  toggleBoundaryMode() {
    this.boundaryMode = this.boundaryMode === 'wrap' ? 'bounce' : 'wrap';
    return this.boundaryMode;
  }

  // Main update loop for all boids
  update() {
    const { separation, alignment, cohesion, neighborRadius, maxSpeed, maxForce } = this.params;

    // Track stats
    let totalSpeed = 0;
    let totalNeighbors = 0;

    for (const boid of this.boids) {
      // Find neighbors for this boid
      boid.findNeighbors(this.boids, neighborRadius);

      // Calculate forces from the three rules
      const sepForce = boid.separation(separation);
      const aliForce = boid.alignment(alignment, maxSpeed, maxForce);
      const cohForce = boid.cohesion(cohesion, maxSpeed, maxForce);

      // Apply all forces
      boid.applyForce(sepForce.x, sepForce.y);
      boid.applyForce(aliForce.x, aliForce.y);
      boid.applyForce(cohForce.x, cohForce.y);

      // Update physics
      boid.update(maxSpeed);

      // Handle boundaries
      boid.handleBoundaries(this.boundaryMode);

      // Accumulate stats
      totalSpeed += boid.getSpeed();
      totalNeighbors += boid.neighborCount;
    }

    // Update heatmap (every 2 frames for performance)
    if (this.showHeatmap && this.frameCount % 2 === 0) {
      this.heatmap.update(this.boids);
    }

    // Update statistics (every 10 frames)
    if (this.frameCount % 10 === 0) {
      this.stats.avgSpeed = totalSpeed / this.boids.length;
      this.stats.avgNeighbors = totalNeighbors / this.boids.length;
      this.stats.boidCount = this.boids.length;
    }

    // Update FPS (every second)
    const now = performance.now();
    this.frameCount++;
    if (now - this.lastFpsUpdate >= 1000) {
      this.stats.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  }

  // Render the simulation
  render() {
    // Clear canvas
    this.ctx.fillStyle = '#0a0a14';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw heatmap first (background layer)
    if (this.showHeatmap) {
      this.heatmap.draw(this.ctx, this.heatmapIntensity);
    }

    // Draw all boids
    for (const boid of this.boids) {
      boid.draw(this.ctx, this.colorBySpeed, this.params.maxSpeed);
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

  // Start the simulation
  start() {
    this.loop();
  }

  // Stop the simulation
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // Get current stats
  getStats() {
    return this.stats;
  }
}

export { Simulation };
