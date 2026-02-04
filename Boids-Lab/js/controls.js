// UI Control Handlers - Connects DOM elements to simulation

// Preset configurations
const PRESETS = {
  schooling: {
    separation: 1.2,
    alignment: 1.8,
    cohesion: 1.0,
    neighborRadius: 60,
    maxSpeed: 4.0
  },
  chaotic: {
    separation: 0.5,
    alignment: 0.3,
    cohesion: 0.4,
    neighborRadius: 30,
    maxSpeed: 6.0
  },
  cluster: {
    separation: 0.8,
    alignment: 1.0,
    cohesion: 2.5,
    neighborRadius: 80,
    maxSpeed: 3.0
  }
};

class Controls {
  constructor(simulation) {
    this.simulation = simulation;

    // Cache DOM elements
    this.elements = {
      // Sliders
      separationSlider: document.getElementById('separation'),
      alignmentSlider: document.getElementById('alignment'),
      cohesionSlider: document.getElementById('cohesion'),
      neighborRadiusSlider: document.getElementById('neighborRadius'),
      maxSpeedSlider: document.getElementById('maxSpeed'),
      heatmapIntensitySlider: document.getElementById('heatmapIntensity'),

      // Value displays
      separationValue: document.getElementById('separationValue'),
      alignmentValue: document.getElementById('alignmentValue'),
      cohesionValue: document.getElementById('cohesionValue'),
      neighborRadiusValue: document.getElementById('neighborRadiusValue'),
      maxSpeedValue: document.getElementById('maxSpeedValue'),
      heatmapIntensityValue: document.getElementById('heatmapIntensityValue'),

      // Buttons
      resetBtn: document.getElementById('resetBtn'),
      pauseBtn: document.getElementById('pauseBtn'),
      boundaryBtn: document.getElementById('boundaryBtn'),
      schoolingBtn: document.getElementById('schoolingBtn'),
      chaoticBtn: document.getElementById('chaoticBtn'),
      clusterBtn: document.getElementById('clusterBtn'),

      // Checkboxes
      colorBySpeedCheckbox: document.getElementById('colorBySpeed'),
      showHeatmapCheckbox: document.getElementById('showHeatmap'),

      // Stats display
      fpsDisplay: document.getElementById('fps'),
      boidCountDisplay: document.getElementById('boidCount'),
      avgSpeedDisplay: document.getElementById('avgSpeed'),
      avgNeighborsDisplay: document.getElementById('avgNeighbors'),

      // Info panel
      infoToggle: document.getElementById('infoToggle'),
      infoContent: document.getElementById('infoContent')
    };

    this.init();
  }

  init() {
    this.bindSliders();
    this.bindButtons();
    this.bindCheckboxes();
    this.bindInfoPanel();
    this.startStatsUpdate();
  }

  // Bind slider events
  bindSliders() {
    const sliderConfig = [
      { slider: 'separationSlider', value: 'separationValue', param: 'separation' },
      { slider: 'alignmentSlider', value: 'alignmentValue', param: 'alignment' },
      { slider: 'cohesionSlider', value: 'cohesionValue', param: 'cohesion' },
      { slider: 'neighborRadiusSlider', value: 'neighborRadiusValue', param: 'neighborRadius' },
      { slider: 'maxSpeedSlider', value: 'maxSpeedValue', param: 'maxSpeed' }
    ];

    for (const config of sliderConfig) {
      const slider = this.elements[config.slider];
      const display = this.elements[config.value];

      if (slider && display) {
        // Set initial value
        slider.value = this.simulation.params[config.param];
        display.textContent = slider.value;

        // Bind input event
        slider.addEventListener('input', () => {
          const value = parseFloat(slider.value);
          this.simulation.setParam(config.param, value);
          display.textContent = value;
        });
      }
    }

    // Heatmap intensity slider (special case)
    const heatmapSlider = this.elements.heatmapIntensitySlider;
    const heatmapDisplay = this.elements.heatmapIntensityValue;
    if (heatmapSlider && heatmapDisplay) {
      heatmapSlider.value = this.simulation.heatmapIntensity;
      heatmapDisplay.textContent = heatmapSlider.value;

      heatmapSlider.addEventListener('input', () => {
        const value = parseFloat(heatmapSlider.value);
        this.simulation.heatmapIntensity = value;
        heatmapDisplay.textContent = value;
      });
    }
  }

  // Bind button events
  bindButtons() {
    // Reset button
    if (this.elements.resetBtn) {
      this.elements.resetBtn.addEventListener('click', () => {
        this.simulation.reset();
      });
    }

    // Pause/Resume button
    if (this.elements.pauseBtn) {
      this.elements.pauseBtn.addEventListener('click', () => {
        const isPaused = this.simulation.togglePause();
        this.elements.pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
      });
    }

    // Boundary mode toggle
    if (this.elements.boundaryBtn) {
      this.elements.boundaryBtn.addEventListener('click', () => {
        const mode = this.simulation.toggleBoundaryMode();
        this.elements.boundaryBtn.textContent = `Boundary: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
      });
    }

    // Preset buttons
    if (this.elements.schoolingBtn) {
      this.elements.schoolingBtn.addEventListener('click', () => {
        this.applyPreset('schooling');
      });
    }

    if (this.elements.chaoticBtn) {
      this.elements.chaoticBtn.addEventListener('click', () => {
        this.applyPreset('chaotic');
      });
    }

    if (this.elements.clusterBtn) {
      this.elements.clusterBtn.addEventListener('click', () => {
        this.applyPreset('cluster');
      });
    }
  }

  // Apply preset and update sliders
  applyPreset(presetName) {
    const preset = PRESETS[presetName];
    if (!preset) return;

    this.simulation.applyPreset(preset);

    // Update slider positions and displays
    const sliderMap = {
      separation: { slider: 'separationSlider', display: 'separationValue' },
      alignment: { slider: 'alignmentSlider', display: 'alignmentValue' },
      cohesion: { slider: 'cohesionSlider', display: 'cohesionValue' },
      neighborRadius: { slider: 'neighborRadiusSlider', display: 'neighborRadiusValue' },
      maxSpeed: { slider: 'maxSpeedSlider', display: 'maxSpeedValue' }
    };

    for (const [param, elements] of Object.entries(sliderMap)) {
      const slider = this.elements[elements.slider];
      const display = this.elements[elements.display];
      if (slider && display && param in preset) {
        slider.value = preset[param];
        display.textContent = preset[param];
      }
    }
  }

  // Bind checkbox events
  bindCheckboxes() {
    // Color by speed toggle
    if (this.elements.colorBySpeedCheckbox) {
      this.elements.colorBySpeedCheckbox.checked = this.simulation.colorBySpeed;
      this.elements.colorBySpeedCheckbox.addEventListener('change', (e) => {
        this.simulation.colorBySpeed = e.target.checked;
      });
    }

    // Show heatmap toggle
    if (this.elements.showHeatmapCheckbox) {
      this.elements.showHeatmapCheckbox.checked = this.simulation.showHeatmap;
      this.elements.showHeatmapCheckbox.addEventListener('change', (e) => {
        this.simulation.showHeatmap = e.target.checked;
      });
    }
  }

  // Bind info panel toggle
  bindInfoPanel() {
    if (this.elements.infoToggle && this.elements.infoContent) {
      this.elements.infoToggle.addEventListener('click', () => {
        this.elements.infoContent.classList.toggle('collapsed');
        const isCollapsed = this.elements.infoContent.classList.contains('collapsed');
        this.elements.infoToggle.textContent = isCollapsed ? 'Show Info ▼' : 'Hide Info ▲';
      });
    }
  }

  // Update stats display periodically
  startStatsUpdate() {
    setInterval(() => {
      const stats = this.simulation.getStats();

      if (this.elements.fpsDisplay) {
        this.elements.fpsDisplay.textContent = stats.fps;

        // Low FPS warning
        if (stats.fps < 45 && stats.fps > 0) {
          this.elements.fpsDisplay.classList.add('warning');
        } else {
          this.elements.fpsDisplay.classList.remove('warning');
        }
      }

      if (this.elements.boidCountDisplay) {
        this.elements.boidCountDisplay.textContent = stats.boidCount;
      }

      if (this.elements.avgSpeedDisplay) {
        this.elements.avgSpeedDisplay.textContent = stats.avgSpeed.toFixed(2);
      }

      if (this.elements.avgNeighborsDisplay) {
        this.elements.avgNeighborsDisplay.textContent = stats.avgNeighbors.toFixed(1);
      }
    }, 200);
  }
}

export { Controls };
