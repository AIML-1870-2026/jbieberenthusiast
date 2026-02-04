// Boid Class - Individual agent with flocking behavior
import { magnitude, normalize, limit, setMagnitude, distanceSquared, speedToHue } from './utils.js?v=2';

class Boid {
  constructor(x, y, canvasWidth, canvasHeight) {
    // Position
    this.x = x;
    this.y = y;

    // Velocity - random initial direction
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    // Acceleration
    this.ax = 0;
    this.ay = 0;

    // Canvas bounds reference
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // Cache for current frame neighbors
    this.neighbors = [];
    this.neighborCount = 0;
  }

  // Find all neighbors within perception radius
  findNeighbors(boids, perceptionRadius) {
    this.neighbors = [];
    const radiusSquared = perceptionRadius * perceptionRadius;

    for (const other of boids) {
      if (other === this) continue;

      const dSq = distanceSquared(this.x, this.y, other.x, other.y);
      if (dSq < radiusSquared) {
        this.neighbors.push({ boid: other, distSq: dSq });
      }
    }

    this.neighborCount = this.neighbors.length;
    return this.neighbors;
  }

  // RULE 1: Separation - Avoid crowding nearby boids
  // Steers away from neighbors, weighted by inverse distance
  separation(weight) {
    if (this.neighbors.length === 0) return { x: 0, y: 0 };

    let steerX = 0;
    let steerY = 0;

    for (const { boid: other, distSq } of this.neighbors) {
      // Direction away from neighbor
      let diffX = this.x - other.x;
      let diffY = this.y - other.y;

      // Weight by inverse distance (closer = stronger)
      const dist = Math.sqrt(distSq);
      if (dist > 0) {
        diffX /= dist;
        diffY /= dist;
      }

      steerX += diffX;
      steerY += diffY;
    }

    // Average and apply weight
    steerX = (steerX / this.neighbors.length) * weight;
    steerY = (steerY / this.neighbors.length) * weight;

    return { x: steerX, y: steerY };
  }

  // RULE 2: Alignment - Steer toward average heading of neighbors
  // Matches velocity direction with nearby boids
  alignment(weight, maxSpeed, maxForce) {
    if (this.neighbors.length === 0) return { x: 0, y: 0 };

    let avgVx = 0;
    let avgVy = 0;

    for (const { boid: other } of this.neighbors) {
      avgVx += other.vx;
      avgVy += other.vy;
    }

    // Average velocity
    avgVx /= this.neighbors.length;
    avgVy /= this.neighbors.length;

    // Desired velocity towards average heading
    const desired = setMagnitude(avgVx, avgVy, maxSpeed);

    // Steering = desired - current velocity
    let steerX = desired.x - this.vx;
    let steerY = desired.y - this.vy;

    // Limit and apply weight
    const limited = limit(steerX, steerY, maxForce);
    return { x: limited.x * weight, y: limited.y * weight };
  }

  // RULE 3: Cohesion - Steer toward average position of neighbors
  // Moves toward center of mass of nearby boids
  cohesion(weight, maxSpeed, maxForce) {
    if (this.neighbors.length === 0) return { x: 0, y: 0 };

    let avgX = 0;
    let avgY = 0;

    for (const { boid: other } of this.neighbors) {
      avgX += other.x;
      avgY += other.y;
    }

    // Center of mass
    avgX /= this.neighbors.length;
    avgY /= this.neighbors.length;

    // Direction to center
    let dirX = avgX - this.x;
    let dirY = avgY - this.y;

    // Desired velocity towards center
    const desired = setMagnitude(dirX, dirY, maxSpeed);

    // Steering = desired - current velocity
    let steerX = desired.x - this.vx;
    let steerY = desired.y - this.vy;

    // Limit and apply weight
    const limited = limit(steerX, steerY, maxForce);
    return { x: limited.x * weight, y: limited.y * weight };
  }

  // Apply a force to acceleration
  applyForce(fx, fy) {
    this.ax += fx;
    this.ay += fy;
  }

  // Update physics: velocity and position
  update(maxSpeed) {
    // Update velocity with acceleration
    this.vx += this.ax;
    this.vy += this.ay;

    // Limit velocity to max speed
    const limited = limit(this.vx, this.vy, maxSpeed);
    this.vx = limited.x;
    this.vy = limited.y;

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Reset acceleration for next frame
    this.ax = 0;
    this.ay = 0;
  }

  // Handle boundary conditions
  handleBoundaries(mode) {
    if (mode === 'wrap') {
      // Wrap around edges (Pac-Man style)
      if (this.x < 0) this.x = this.canvasWidth;
      if (this.x > this.canvasWidth) this.x = 0;
      if (this.y < 0) this.y = this.canvasHeight;
      if (this.y > this.canvasHeight) this.y = 0;
    } else {
      // Bounce off edges
      if (this.x <= 0 || this.x >= this.canvasWidth) {
        this.vx *= -1;
        this.x = Math.max(0, Math.min(this.canvasWidth, this.x));
      }
      if (this.y <= 0 || this.y >= this.canvasHeight) {
        this.vy *= -1;
        this.y = Math.max(0, Math.min(this.canvasHeight, this.y));
      }
    }
  }

  // Get current speed
  getSpeed() {
    return magnitude(this.vx, this.vy);
  }

  // Get hue value based on speed (for trails)
  getSpeedHue(maxSpeed) {
    return speedToHue(this.getSpeed(), maxSpeed);
  }

  // Draw the boid as a triangle pointing in direction of motion
  draw(ctx, colorBySpeed, maxSpeed, theme = null) {
    const speed = this.getSpeed();
    const angle = Math.atan2(this.vy, this.vx);

    // Triangle size
    const size = 9;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(angle);

    // Color based on speed, theme, or default
    if (colorBySpeed) {
      let hue;
      if (theme && theme.natureColors) {
        // Nature theme: green to yellow-green range
        hue = 80 + (speed / maxSpeed) * 40;
      } else {
        hue = speedToHue(speed, maxSpeed);
      }
      ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
      ctx.shadowColor = `hsl(${hue}, 80%, 60%)`;
      ctx.shadowBlur = 4;
    } else if (theme && theme.boidColor) {
      ctx.fillStyle = theme.boidColor;
      ctx.shadowColor = theme.boidGlow || 'rgba(255, 255, 255, 0.2)';
      ctx.shadowBlur = 2;
    } else {
      ctx.fillStyle = 'rgba(220, 220, 220, 0.9)';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
      ctx.shadowBlur = 2;
    }

    // Draw triangle pointing right (will be rotated to velocity direction)
    ctx.beginPath();
    ctx.moveTo(size, 0);           // Nose
    ctx.lineTo(-size * 0.6, -size * 0.5);  // Top back
    ctx.lineTo(-size * 0.6, size * 0.5);   // Bottom back
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

export { Boid };
