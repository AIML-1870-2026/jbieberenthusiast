// Heatmap Overlay System - Visualizes spatial density and movement patterns

class Heatmap {
  constructor(canvasWidth, canvasHeight, gridSize = 30) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.gridSize = gridSize;

    // Calculate cell dimensions
    this.cellWidth = canvasWidth / gridSize;
    this.cellHeight = canvasHeight / gridSize;

    // Initialize grid with zeros
    this.grid = [];
    this.reset();

    // Decay factor - old data fades over time
    this.decayRate = 0.95;

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

    // Update max value for normalization
    this.maxValue = 1;
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (this.grid[i][j] > this.maxValue) {
          this.maxValue = this.grid[i][j];
        }
      }
    }
  }

  // Map normalized value (0-1) to heatmap color
  // Low: Transparent/Dark Blue, Medium: Purple/Magenta, High: Orange/Yellow
  getColor(normalizedValue, intensity) {
    const alpha = normalizedValue * 0.8 * intensity;

    if (normalizedValue < 0.05) {
      // Very low - nearly transparent
      return `rgba(0, 0, 0, 0)`;
    } else if (normalizedValue < 0.33) {
      // Low density - dark blue to purple
      const r = Math.floor(normalizedValue * 3 * 100);
      const b = Math.floor(150 + normalizedValue * 3 * 50);
      return `rgba(${r}, 0, ${b}, ${alpha * 0.5})`;
    } else if (normalizedValue < 0.66) {
      // Medium density - purple to magenta
      const t = (normalizedValue - 0.33) * 3;
      const r = Math.floor(100 + t * 155);
      const g = Math.floor(t * 50);
      const b = Math.floor(200 - t * 50);
      return `rgba(${r}, ${g}, ${b}, ${alpha * 0.7})`;
    } else {
      // High density - orange to yellow
      const t = (normalizedValue - 0.66) * 3;
      const r = 255;
      const g = Math.floor(100 + t * 155);
      const b = Math.floor(150 - t * 150);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }

  // Draw the heatmap overlay
  draw(ctx, intensity = 0.7) {
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const value = this.grid[i][j];
        if (value < 0.1) continue; // Skip nearly empty cells

        const normalizedValue = value / this.maxValue;
        const color = this.getColor(normalizedValue, intensity);

        ctx.fillStyle = color;
        ctx.fillRect(
          i * this.cellWidth,
          j * this.cellHeight,
          this.cellWidth,
          this.cellHeight
        );
      }
    }
  }
}

export { Heatmap };
