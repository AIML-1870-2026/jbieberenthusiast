// Julia and Mandelbrot Set Renderer

import { COLOR_SCHEMES } from './colorPalettes.js';

class FractalRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    // View parameters
    this.center = { real: 0, imag: 0 };
    this.zoom = 1;

    // Julia parameters
    this.c = { real: -0.7, imag: 0.27015 };

    // Rendering parameters
    this.maxIterations = 100;
    this.colorScheme = 'classic';
    this.palette = null;

    // Mode: 'julia' or 'mandelbrot'
    this.mode = 'julia';

    // Rendering state
    this.isRendering = false;
    this.renderQueue = null;

    // Image data for direct pixel manipulation
    this.imageData = null;

    this.updatePalette();
  }

  // Update color palette when scheme or iterations change
  updatePalette() {
    const scheme = COLOR_SCHEMES[this.colorScheme];
    if (scheme) {
      this.palette = scheme.generate(this.maxIterations);
    }
  }

  // Set the complex parameter c for Julia set
  setC(real, imag) {
    this.c.real = real;
    this.c.imag = imag;
  }

  // Set view center
  setCenter(real, imag) {
    this.center.real = real;
    this.center.imag = imag;
  }

  // Set zoom level
  setZoom(zoom) {
    this.zoom = Math.max(0.1, zoom);
  }

  // Set max iterations
  setMaxIterations(iterations) {
    this.maxIterations = iterations;
    this.updatePalette();
  }

  // Set color scheme
  setColorScheme(scheme) {
    if (COLOR_SCHEMES[scheme]) {
      this.colorScheme = scheme;
      this.updatePalette();
    }
  }

  // Set mode (julia or mandelbrot)
  setMode(mode) {
    this.mode = mode;
  }

  // Map pixel coordinates to complex plane
  pixelToComplex(px, py) {
    const scale = 4.0 / this.zoom;
    const aspectRatio = this.width / this.height;
    return {
      real: this.center.real + (px - this.width / 2) * scale / this.width,
      imag: this.center.imag + (py - this.height / 2) * scale / this.height
    };
  }

  // Map complex coordinates to pixel
  complexToPixel(real, imag) {
    const scale = 4.0 / this.zoom;
    return {
      x: (real - this.center.real) * this.width / scale + this.width / 2,
      y: (imag - this.center.imag) * this.height / scale + this.height / 2
    };
  }

  // Julia set iteration
  juliaIteration(zx, zy, cx, cy) {
    let x = zx, y = zy;
    let iter = 0;

    while (x * x + y * y <= 4 && iter < this.maxIterations) {
      const xtemp = x * x - y * y + cx;
      y = 2 * x * y + cy;
      x = xtemp;
      iter++;
    }

    // Smooth coloring
    if (iter < this.maxIterations) {
      const log_zn = Math.log(x * x + y * y) / 2;
      const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
      iter = iter + 1 - nu;
    }

    return iter;
  }

  // Mandelbrot set iteration
  mandelbrotIteration(cx, cy) {
    let x = 0, y = 0;
    let iter = 0;

    while (x * x + y * y <= 4 && iter < this.maxIterations) {
      const xtemp = x * x - y * y + cx;
      y = 2 * x * y + cy;
      x = xtemp;
      iter++;
    }

    // Smooth coloring
    if (iter < this.maxIterations) {
      const log_zn = Math.log(x * x + y * y) / 2;
      const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
      iter = iter + 1 - nu;
    }

    return iter;
  }

  // Get color for iteration count (with smooth interpolation)
  getColor(iter) {
    if (iter >= this.maxIterations) {
      return { r: 0, g: 0, b: 0 };
    }

    const floor = Math.floor(iter);
    const frac = iter - floor;
    const c1 = this.palette[Math.min(floor, this.maxIterations)];
    const c2 = this.palette[Math.min(floor + 1, this.maxIterations)];

    return {
      r: Math.floor(c1.r + (c2.r - c1.r) * frac),
      g: Math.floor(c1.g + (c2.g - c1.g) * frac),
      b: Math.floor(c1.b + (c2.b - c1.b) * frac)
    };
  }

  // Main render function
  render(callback) {
    if (this.isRendering) {
      // Queue this render
      this.renderQueue = callback;
      return;
    }

    this.isRendering = true;
    this.imageData = this.ctx.createImageData(this.width, this.height);
    const data = this.imageData.data;

    const startTime = performance.now();

    // Render all pixels
    for (let py = 0; py < this.height; py++) {
      for (let px = 0; px < this.width; px++) {
        const { real, imag } = this.pixelToComplex(px, py);

        let iter;
        if (this.mode === 'mandelbrot') {
          iter = this.mandelbrotIteration(real, imag);
        } else {
          iter = this.juliaIteration(real, imag, this.c.real, this.c.imag);
        }

        const color = this.getColor(iter);
        const idx = (py * this.width + px) * 4;
        data[idx] = color.r;
        data[idx + 1] = color.g;
        data[idx + 2] = color.b;
        data[idx + 3] = 255;
      }
    }

    this.ctx.putImageData(this.imageData, 0, 0);

    const renderTime = performance.now() - startTime;
    this.isRendering = false;

    if (callback) callback(renderTime);

    // Process queued render
    if (this.renderQueue) {
      const queuedCallback = this.renderQueue;
      this.renderQueue = null;
      requestAnimationFrame(() => this.render(queuedCallback));
    }
  }

  // Render at lower resolution for preview (during interactions)
  renderPreview(scale = 0.25, callback) {
    const previewWidth = Math.floor(this.width * scale);
    const previewHeight = Math.floor(this.height * scale);

    // Create temporary canvas for preview
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = previewWidth;
    tempCanvas.height = previewHeight;
    const tempCtx = tempCanvas.getContext('2d');
    const imageData = tempCtx.createImageData(previewWidth, previewHeight);
    const data = imageData.data;

    for (let py = 0; py < previewHeight; py++) {
      for (let px = 0; px < previewWidth; px++) {
        const realPx = px / scale;
        const realPy = py / scale;
        const { real, imag } = this.pixelToComplex(realPx, realPy);

        let iter;
        if (this.mode === 'mandelbrot') {
          iter = this.mandelbrotIteration(real, imag);
        } else {
          iter = this.juliaIteration(real, imag, this.c.real, this.c.imag);
        }

        const color = this.getColor(iter);
        const idx = (py * previewWidth + px) * 4;
        data[idx] = color.r;
        data[idx + 1] = color.g;
        data[idx + 2] = color.b;
        data[idx + 3] = 255;
      }
    }

    tempCtx.putImageData(imageData, 0, 0);

    // Scale up to full canvas
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.drawImage(tempCanvas, 0, 0, this.width, this.height);

    if (callback) callback();
  }

  // Zoom at a specific point
  zoomAt(px, py, factor) {
    const { real, imag } = this.pixelToComplex(px, py);

    // Adjust center to zoom toward click point
    const newZoom = this.zoom * factor;
    const scale = 4.0 / this.zoom;
    const newScale = 4.0 / newZoom;

    this.center.real = real - (px - this.width / 2) * newScale / this.width;
    this.center.imag = imag - (py - this.height / 2) * newScale / this.height;
    this.zoom = newZoom;
  }

  // Pan by pixel offset
  pan(dx, dy) {
    const scale = 4.0 / this.zoom;
    this.center.real -= dx * scale / this.width;
    this.center.imag -= dy * scale / this.height;
  }

  // Reset to default view
  resetView() {
    this.center = { real: 0, imag: 0 };
    this.zoom = 1;
  }

  // Resize canvas
  resize(width, height) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  // Export current view as PNG
  exportImage(filename = 'julia-set.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }

  // Get current state for display
  getState() {
    return {
      mode: this.mode,
      c: { ...this.c },
      center: { ...this.center },
      zoom: this.zoom,
      maxIterations: this.maxIterations,
      colorScheme: this.colorScheme
    };
  }
}

export { FractalRenderer };
