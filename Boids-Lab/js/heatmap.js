// Heatmap Overlay System - Visualizes spatial density and movement patterns

class Heatmap {
  constructor(canvasWidth, canvasHeight, gridSize = 40) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.gridSize = gridSize;

    // Calculate cell dimensions
    this.cellWidth = canvasWidth / gridSize;
    this.cellHeight = canvasHeight / gridSize;

    // Initialize grid
    this.grid = [];
    this.reset();

    // Decay factor - old data fades over time
    this.decayRate = 0.92;

    // Track max value for normalization
    this.maxValue = 1;
  }

  // Reset grid to zeros
  reset() {
    this.grid = [];
    for (let i = 0; i < this.gridSize; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.gridSize; j++) {
        this.grid[i][j] = 0;
      }
    }
    this.maxValue = 1;
  }

  // Update heatmap with current boid positions
  update(boids) {
    // Apply decay to all cells
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        this.grid[i][j] *= this.decayRate;
      }
    }

    // Increment cells where boids are located
    for (const boid of boids) {
      const cellX = Math.floor(boid.x / this.cellWidth);
      const cellY = Math.floor(boid.y / this.cellHeight);

      // Bounds check
      if (cellX >= 0 && cellX < this.gridSize && cellY >= 0 && cellY < this.gridSize) {
        this.grid[cellX][cellY] += 1;
      }
    }

    // Update max value for normalization (with minimum floor)
    this.maxValue = 5; // Minimum threshold
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (this.grid[i][j] > this.maxValue) {
          this.maxValue = this.grid[i][j];
        }
      }
    }
  }

  // Simple smooth color gradient: transparent -> blue -> cyan -> white
  getColor(normalizedValue, intensity) {
    if (normalizedValue < 0.02) {
      return null; // Skip very low values
    }

    // Smooth gradient using a single color ramp
    const v = Math.min(normalizedValue, 1);
    const alpha = v * 0.6 * intensity;

    // Blue to cyan to white gradient
    const r = Math.floor(v * v * 200);
    const g = Math.floor(v * 220);
    const b = Math.floor(180 + v * 75);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Draw the heatmap overlay with soft edges
  draw(ctx, intensity = 0.7) {
    // Draw cells with slight overlap for smoother appearance
    const overlap = 1;

    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const value = this.grid[i][j];
        if (value < 0.1) continue;

        const normalizedValue = value / this.maxValue;
        const color = this.getColor(normalizedValue, intensity);

        if (!color) continue;

        ctx.fillStyle = color;
        ctx.fillRect(
          i * this.cellWidth - overlap,
          j * this.cellHeight - overlap,
          this.cellWidth + overlap * 2,
          this.cellHeight + overlap * 2
        );
      }
    }
  }
}

export { Heatmap };
