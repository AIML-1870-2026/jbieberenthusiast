// Main Application - Julia Set Explorer

import { FractalRenderer } from './renderer.js';
import { PRESETS, ANIMATION_PATHS } from './presets.js';
import { COLOR_SCHEMES } from './colorPalettes.js';

class JuliaExplorer {
  constructor() {
    // DOM Elements
    this.juliaCanvas = document.getElementById('juliaCanvas');
    this.mandelbrotCanvas = document.getElementById('mandelbrotCanvas');

    // Renderers
    this.juliaRenderer = null;
    this.mandelbrotRenderer = null;

    // UI State
    this.viewMode = 'single'; // 'single' or 'split'
    this.isPanning = false;
    this.lastMousePos = { x: 0, y: 0 };

    // Animation state
    this.isAnimating = false;
    this.animationPath = 'circular';
    this.animationSpeed = 1;
    this.animationTime = 0;
    this.animationLoop = true;
    this.animationFrame = null;
    this.lastAnimationTime = 0;

    // Debounce timer
    this.renderTimeout = null;

    this.init();
  }

  init() {
    this.setupCanvas();
    this.bindControls();
    this.bindCanvasEvents();
    this.bindKeyboard();
    this.populatePresets();
    this.populateColorSchemes();
    this.render();
  }

  setupCanvas() {
    // Set canvas size
    const container = this.juliaCanvas.parentElement;
    const size = Math.min(container.clientWidth, 800);

    this.juliaCanvas.width = size;
    this.juliaCanvas.height = size;

    this.juliaRenderer = new FractalRenderer(this.juliaCanvas);

    // Setup Mandelbrot canvas for split view
    if (this.mandelbrotCanvas) {
      this.mandelbrotCanvas.width = size;
      this.mandelbrotCanvas.height = size;
      this.mandelbrotRenderer = new FractalRenderer(this.mandelbrotCanvas);
      this.mandelbrotRenderer.setMode('mandelbrot');
    }
  }

  bindControls() {
    // Parameter sliders
    const realSlider = document.getElementById('realSlider');
    const imagSlider = document.getElementById('imagSlider');
    const iterSlider = document.getElementById('iterSlider');
    const animSpeedSlider = document.getElementById('animSpeedSlider');

    if (realSlider) {
      realSlider.addEventListener('input', () => this.onParameterChange());
    }
    if (imagSlider) {
      imagSlider.addEventListener('input', () => this.onParameterChange());
    }
    if (iterSlider) {
      iterSlider.addEventListener('input', () => this.onIterationChange());
    }
    if (animSpeedSlider) {
      animSpeedSlider.addEventListener('input', () => {
        this.animationSpeed = parseFloat(animSpeedSlider.value);
        document.getElementById('animSpeedValue').textContent = this.animationSpeed.toFixed(1) + 'x';
      });
    }

    // Color scheme selector
    const colorSelect = document.getElementById('colorScheme');
    if (colorSelect) {
      colorSelect.addEventListener('change', () => {
        this.juliaRenderer.setColorScheme(colorSelect.value);
        if (this.mandelbrotRenderer) {
          this.mandelbrotRenderer.setColorScheme(colorSelect.value);
        }
        this.render();
      });
    }

    // Preset selector
    const presetSelect = document.getElementById('presetSelect');
    if (presetSelect) {
      presetSelect.addEventListener('change', () => {
        const preset = PRESETS.find(p => p.name === presetSelect.value);
        if (preset) {
          this.applyPreset(preset);
        }
      });
    }

    // Animation path selector
    const pathSelect = document.getElementById('animPathSelect');
    if (pathSelect) {
      pathSelect.addEventListener('change', () => {
        this.animationPath = pathSelect.value;
      });
    }

    // Buttons
    document.getElementById('resetViewBtn')?.addEventListener('click', () => this.resetView());
    document.getElementById('saveImageBtn')?.addEventListener('click', () => this.saveImage());
    document.getElementById('playPauseBtn')?.addEventListener('click', () => this.toggleAnimation());
    document.getElementById('toggleModeBtn')?.addEventListener('click', () => this.toggleMode());
    document.getElementById('toggleSplitBtn')?.addEventListener('click', () => this.toggleSplitView());

    // Loop toggle
    const loopCheckbox = document.getElementById('animLoopCheckbox');
    if (loopCheckbox) {
      loopCheckbox.addEventListener('change', () => {
        this.animationLoop = loopCheckbox.checked;
      });
    }

    // Info panel toggle
    document.getElementById('infoToggle')?.addEventListener('click', () => {
      const content = document.getElementById('infoContent');
      const toggle = document.getElementById('infoToggle');
      if (content) {
        content.classList.toggle('collapsed');
        toggle.textContent = content.classList.contains('collapsed') ? 'Show Info ▼' : 'Hide Info ▲';
      }
    });
  }

  bindCanvasEvents() {
    // Julia canvas events
    this.juliaCanvas.addEventListener('click', (e) => this.onCanvasClick(e, 'julia'));
    this.juliaCanvas.addEventListener('contextmenu', (e) => this.onCanvasRightClick(e, 'julia'));
    this.juliaCanvas.addEventListener('wheel', (e) => this.onCanvasWheel(e, 'julia'));
    this.juliaCanvas.addEventListener('mousedown', (e) => this.onCanvasMouseDown(e, 'julia'));
    this.juliaCanvas.addEventListener('mousemove', (e) => this.onCanvasMouseMove(e, 'julia'));
    this.juliaCanvas.addEventListener('mouseup', () => this.onCanvasMouseUp());
    this.juliaCanvas.addEventListener('mouseleave', () => this.onCanvasMouseUp());

    // Mandelbrot canvas events (for split view)
    if (this.mandelbrotCanvas) {
      this.mandelbrotCanvas.addEventListener('click', (e) => this.onMandelbrotClick(e));
      this.mandelbrotCanvas.addEventListener('wheel', (e) => this.onCanvasWheel(e, 'mandelbrot'));
      this.mandelbrotCanvas.addEventListener('mousedown', (e) => this.onCanvasMouseDown(e, 'mandelbrot'));
      this.mandelbrotCanvas.addEventListener('mousemove', (e) => this.onCanvasMouseMove(e, 'mandelbrot'));
      this.mandelbrotCanvas.addEventListener('mouseup', () => this.onCanvasMouseUp());
      this.mandelbrotCanvas.addEventListener('mouseleave', () => this.onCanvasMouseUp());
    }
  }

  bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      switch (e.key.toLowerCase()) {
        case 'r':
          this.resetView();
          break;
        case '+':
        case '=':
          this.juliaRenderer.zoomAt(this.juliaCanvas.width / 2, this.juliaCanvas.height / 2, 1.5);
          this.render();
          break;
        case '-':
          this.juliaRenderer.zoomAt(this.juliaCanvas.width / 2, this.juliaCanvas.height / 2, 0.67);
          this.render();
          break;
        case ' ':
          e.preventDefault();
          this.toggleAnimation();
          break;
        case 'm':
          this.toggleMode();
          break;
        case 'arrowup':
          this.juliaRenderer.pan(0, -50);
          this.render();
          break;
        case 'arrowdown':
          this.juliaRenderer.pan(0, 50);
          this.render();
          break;
        case 'arrowleft':
          this.juliaRenderer.pan(-50, 0);
          this.render();
          break;
        case 'arrowright':
          this.juliaRenderer.pan(50, 0);
          this.render();
          break;
      }
    });
  }

  populatePresets() {
    const select = document.getElementById('presetSelect');
    if (!select) return;

    PRESETS.forEach(preset => {
      const option = document.createElement('option');
      option.value = preset.name;
      option.textContent = preset.name;
      option.title = preset.description;
      select.appendChild(option);
    });
  }

  populateColorSchemes() {
    const select = document.getElementById('colorScheme');
    if (!select) return;

    Object.entries(COLOR_SCHEMES).forEach(([key, scheme]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = scheme.name;
      select.appendChild(option);
    });
  }

  onParameterChange() {
    if (this.isAnimating) return;

    const real = parseFloat(document.getElementById('realSlider').value);
    const imag = parseFloat(document.getElementById('imagSlider').value);

    document.getElementById('realValue').textContent = real.toFixed(3);
    document.getElementById('imagValue').textContent = imag.toFixed(3);

    this.juliaRenderer.setC(real, imag);
    this.updateCDisplay();

    // Debounce rendering
    if (this.renderTimeout) clearTimeout(this.renderTimeout);
    this.renderTimeout = setTimeout(() => this.render(), 50);
  }

  onIterationChange() {
    const iter = parseInt(document.getElementById('iterSlider').value);
    document.getElementById('iterValue').textContent = iter;

    this.juliaRenderer.setMaxIterations(iter);
    if (this.mandelbrotRenderer) {
      this.mandelbrotRenderer.setMaxIterations(iter);
    }

    if (this.renderTimeout) clearTimeout(this.renderTimeout);
    this.renderTimeout = setTimeout(() => this.render(), 100);
  }

  onCanvasClick(e, canvas) {
    if (this.isPanning) return;

    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const renderer = canvas === 'julia' ? this.juliaRenderer : this.mandelbrotRenderer;
    renderer.zoomAt(x, y, 2);
    this.render();
    this.updateViewDisplay();
  }

  onCanvasRightClick(e, canvas) {
    e.preventDefault();
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const renderer = canvas === 'julia' ? this.juliaRenderer : this.mandelbrotRenderer;
    renderer.zoomAt(x, y, 0.5);
    this.render();
    this.updateViewDisplay();
  }

  onCanvasWheel(e, canvas) {
    e.preventDefault();
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const factor = e.deltaY < 0 ? 1.2 : 0.83;
    const renderer = canvas === 'julia' ? this.juliaRenderer : this.mandelbrotRenderer;
    renderer.zoomAt(x, y, factor);
    this.render();
    this.updateViewDisplay();
  }

  onCanvasMouseDown(e, canvas) {
    if (e.button !== 0) return;
    this.isPanning = true;
    this.panningCanvas = canvas;
    this.lastMousePos = { x: e.clientX, y: e.clientY };
    e.target.style.cursor = 'grabbing';
  }

  onCanvasMouseMove(e, canvas) {
    if (!this.isPanning || this.panningCanvas !== canvas) return;

    const dx = e.clientX - this.lastMousePos.x;
    const dy = e.clientY - this.lastMousePos.y;
    this.lastMousePos = { x: e.clientX, y: e.clientY };

    const renderer = canvas === 'julia' ? this.juliaRenderer : this.mandelbrotRenderer;
    renderer.pan(-dx, -dy);

    // Use preview during pan
    renderer.renderPreview(0.5);
    this.updateViewDisplay();
  }

  onCanvasMouseUp() {
    if (this.isPanning) {
      this.isPanning = false;
      this.juliaCanvas.style.cursor = 'crosshair';
      if (this.mandelbrotCanvas) {
        this.mandelbrotCanvas.style.cursor = 'crosshair';
      }
      this.render();
    }
  }

  onMandelbrotClick(e) {
    if (this.isPanning) return;

    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Get complex coordinates from click
    const { real, imag } = this.mandelbrotRenderer.pixelToComplex(x, y);

    // Update Julia set with this c value
    this.juliaRenderer.setC(real, imag);

    // Update sliders
    const realSlider = document.getElementById('realSlider');
    const imagSlider = document.getElementById('imagSlider');
    if (realSlider && imagSlider) {
      realSlider.value = Math.max(-2, Math.min(2, real));
      imagSlider.value = Math.max(-2, Math.min(2, imag));
      document.getElementById('realValue').textContent = real.toFixed(3);
      document.getElementById('imagValue').textContent = imag.toFixed(3);
    }

    this.updateCDisplay();
    this.updateMandelbrotMarker(x, y);
    this.juliaRenderer.render();
  }

  updateMandelbrotMarker(x, y) {
    // Draw marker on Mandelbrot set
    if (!this.mandelbrotCanvas) return;

    const ctx = this.mandelbrotRenderer.ctx;
    // Re-render Mandelbrot to clear old marker
    this.mandelbrotRenderer.render(() => {
      // Draw crosshair at current c position
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 10, y);
      ctx.lineTo(x + 10, y);
      ctx.moveTo(x, y - 10);
      ctx.lineTo(x, y + 10);
      ctx.stroke();

      // Draw circle
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  applyPreset(preset) {
    this.juliaRenderer.setC(preset.c.real, preset.c.imag);

    // Update sliders
    const realSlider = document.getElementById('realSlider');
    const imagSlider = document.getElementById('imagSlider');
    if (realSlider && imagSlider) {
      realSlider.value = preset.c.real;
      imagSlider.value = preset.c.imag;
      document.getElementById('realValue').textContent = preset.c.real.toFixed(3);
      document.getElementById('imagValue').textContent = preset.c.imag.toFixed(3);
    }

    this.updateCDisplay();
    this.render();
  }

  resetView() {
    this.juliaRenderer.resetView();
    if (this.mandelbrotRenderer) {
      this.mandelbrotRenderer.resetView();
    }
    this.render();
    this.updateViewDisplay();
  }

  saveImage() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    this.juliaRenderer.exportImage(`julia-set-${timestamp}.png`);
  }

  toggleMode() {
    const btn = document.getElementById('toggleModeBtn');
    if (this.juliaRenderer.mode === 'julia') {
      this.juliaRenderer.setMode('mandelbrot');
      if (btn) btn.textContent = 'Mode: Mandelbrot';
    } else {
      this.juliaRenderer.setMode('julia');
      if (btn) btn.textContent = 'Mode: Julia';
    }
    this.render();
  }

  toggleSplitView() {
    const container = document.querySelector('.canvas-area');
    const splitBtn = document.getElementById('toggleSplitBtn');
    const mandelbrotWrapper = document.getElementById('mandelbrotWrapper');

    if (this.viewMode === 'single') {
      this.viewMode = 'split';
      container?.classList.add('split-view');
      mandelbrotWrapper?.classList.remove('hidden');
      splitBtn.textContent = 'Single View';

      // Render Mandelbrot
      if (this.mandelbrotRenderer) {
        // Resize canvases for split view
        const size = Math.min(400, window.innerWidth / 2 - 40);
        this.juliaCanvas.width = size;
        this.juliaCanvas.height = size;
        this.mandelbrotCanvas.width = size;
        this.mandelbrotCanvas.height = size;
        this.juliaRenderer.resize(size, size);
        this.mandelbrotRenderer.resize(size, size);

        this.mandelbrotRenderer.render();
        this.updateMandelbrotMarkerFromSliders();
      }
    } else {
      this.viewMode = 'single';
      container?.classList.remove('split-view');
      mandelbrotWrapper?.classList.add('hidden');
      splitBtn.textContent = 'Split View';

      // Resize Julia canvas back to full
      const fullSize = Math.min(800, window.innerWidth - 340);
      this.juliaCanvas.width = fullSize;
      this.juliaCanvas.height = fullSize;
      this.juliaRenderer.resize(fullSize, fullSize);
    }

    this.render();
  }

  updateMandelbrotMarkerFromSliders() {
    if (!this.mandelbrotRenderer) return;

    const real = this.juliaRenderer.c.real;
    const imag = this.juliaRenderer.c.imag;
    const { x, y } = this.mandelbrotRenderer.complexToPixel(real, imag);

    this.updateMandelbrotMarker(x, y);
  }

  toggleAnimation() {
    const btn = document.getElementById('playPauseBtn');
    if (this.isAnimating) {
      this.isAnimating = false;
      if (btn) btn.textContent = 'Play';
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
    } else {
      this.isAnimating = true;
      if (btn) btn.textContent = 'Pause';
      this.lastAnimationTime = performance.now();
      this.animate();
    }
  }

  animate() {
    if (!this.isAnimating) return;

    const now = performance.now();
    const dt = (now - this.lastAnimationTime) / 1000;
    this.lastAnimationTime = now;

    // Update animation time
    this.animationTime += dt * this.animationSpeed * 0.1;

    // Check for loop
    if (this.animationTime >= 1) {
      if (this.animationLoop) {
        this.animationTime = this.animationTime % 1;
      } else {
        this.animationTime = 1;
        this.isAnimating = false;
        document.getElementById('playPauseBtn').textContent = 'Play';
      }
    }

    // Get point from animation path
    const pathFn = ANIMATION_PATHS[this.animationPath];
    if (pathFn) {
      const { real, imag } = pathFn.getPoint(this.animationTime);
      this.juliaRenderer.setC(real, imag);

      // Ensure we're in Julia mode during animation
      this.juliaRenderer.setMode('julia');

      // Update sliders
      const realSlider = document.getElementById('realSlider');
      const imagSlider = document.getElementById('imagSlider');
      if (realSlider && imagSlider) {
        realSlider.value = Math.max(-2, Math.min(2, real));
        imagSlider.value = Math.max(-2, Math.min(2, imag));
        document.getElementById('realValue').textContent = real.toFixed(3);
        document.getElementById('imagValue').textContent = imag.toFixed(3);
      }

      this.updateCDisplay();

      // Update progress bar
      const progress = document.getElementById('animProgress');
      if (progress) {
        progress.value = this.animationTime * 100;
      }

      // Render the Julia set (use full render for quality)
      this.juliaRenderer.render();

      // Update Mandelbrot marker in split view
      if (this.viewMode === 'split') {
        this.updateMandelbrotMarkerFromSliders();
      }

      // Update mode button to reflect Julia mode
      const modeBtn = document.getElementById('toggleModeBtn');
      if (modeBtn) modeBtn.textContent = 'Mode: Julia';
    }

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  updateCDisplay() {
    const display = document.getElementById('cDisplay');
    if (display) {
      const { real, imag } = this.juliaRenderer.c;
      const sign = imag >= 0 ? '+' : '';
      display.textContent = `c = ${real.toFixed(3)} ${sign} ${imag.toFixed(3)}i`;
    }
  }

  updateViewDisplay() {
    const zoomDisplay = document.getElementById('zoomLevel');
    const centerDisplay = document.getElementById('centerDisplay');

    if (zoomDisplay) {
      zoomDisplay.textContent = this.juliaRenderer.zoom.toFixed(1) + 'x';
    }
    if (centerDisplay) {
      const { real, imag } = this.juliaRenderer.center;
      centerDisplay.textContent = `(${real.toFixed(3)}, ${imag.toFixed(3)})`;
    }
  }

  render() {
    this.juliaRenderer.render((time) => {
      const renderTimeEl = document.getElementById('renderTime');
      if (renderTimeEl) {
        renderTimeEl.textContent = time.toFixed(0) + 'ms';
      }
    });

    if (this.viewMode === 'split' && this.mandelbrotRenderer) {
      this.mandelbrotRenderer.render();
      this.updateMandelbrotMarkerFromSliders();
    }

    this.updateCDisplay();
    this.updateViewDisplay();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new JuliaExplorer();
});

export { JuliaExplorer };
