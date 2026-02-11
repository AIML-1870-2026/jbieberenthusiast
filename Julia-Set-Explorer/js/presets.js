// Famous Julia Set Presets

const PRESETS = [
  {
    name: 'Dendrite',
    c: { real: -0.4, imag: 0.6 },
    description: 'Tree-like branching structure'
  },
  {
    name: 'San Marco',
    c: { real: -0.75, imag: 0.0 },
    description: 'Classic symmetric pattern'
  },
  {
    name: 'Siegel Disk',
    c: { real: -0.391, imag: -0.587 },
    description: 'Circular structures with spirals'
  },
  {
    name: "Douady's Rabbit",
    c: { real: -0.123, imag: 0.745 },
    description: 'Rabbit-like shape with three-fold symmetry'
  },
  {
    name: 'Dragon',
    c: { real: -0.8, imag: 0.156 },
    description: 'Dragon curves with fine detail'
  },
  {
    name: 'Spiral',
    c: { real: 0.285, imag: 0.01 },
    description: 'Intricate spiral patterns'
  }
];

// Animation path presets for morphing
const ANIMATION_PATHS = {
  circular: {
    name: 'Circular',
    description: 'Animate c in a circle around origin',
    getPoint: (t, params = {}) => {
      const radius = params.radius || 0.7;
      const centerReal = params.centerReal || 0;
      const centerImag = params.centerImag || 0;
      return {
        real: centerReal + radius * Math.cos(2 * Math.PI * t),
        imag: centerImag + radius * Math.sin(2 * Math.PI * t)
      };
    }
  },
  linear: {
    name: 'Linear',
    description: 'Interpolate between two points',
    getPoint: (t, params = {}) => {
      const start = params.start || { real: -0.8, imag: 0.156 };
      const end = params.end || { real: 0.285, imag: 0.01 };
      return {
        real: start.real + (end.real - start.real) * t,
        imag: start.imag + (end.imag - start.imag) * t
      };
    }
  },
  presetTour: {
    name: 'Preset Tour',
    description: 'Visit famous Julia sets',
    presets: ['Dendrite', 'Spiral', "Douady's Rabbit", 'Siegel Disk', 'Dragon', 'San Marco'],
    getPoint: (t, params = {}) => {
      const tour = ANIMATION_PATHS.presetTour.presets;
      const totalPresets = tour.length;
      const scaledT = t * totalPresets;
      const index = Math.floor(scaledT) % totalPresets;
      const nextIndex = (index + 1) % totalPresets;
      const localT = scaledT - Math.floor(scaledT);

      const current = PRESETS.find(p => p.name === tour[index]);
      const next = PRESETS.find(p => p.name === tour[nextIndex]);

      // Smooth easing
      const eased = localT < 0.5
        ? 2 * localT * localT
        : 1 - Math.pow(-2 * localT + 2, 2) / 2;

      return {
        real: current.c.real + (next.c.real - current.c.real) * eased,
        imag: current.c.imag + (next.c.imag - current.c.imag) * eased
      };
    }
  },
  lissajous: {
    name: 'Lissajous',
    description: 'Complex non-repeating paths',
    getPoint: (t, params = {}) => {
      const a = params.a || 3;
      const b = params.b || 2;
      const delta = params.delta || Math.PI / 2;
      const scaleReal = params.scaleReal || 0.8;
      const scaleImag = params.scaleImag || 0.6;
      return {
        real: scaleReal * Math.sin(a * 2 * Math.PI * t + delta),
        imag: scaleImag * Math.sin(b * 2 * Math.PI * t)
      };
    }
  },
  randomWalk: {
    name: 'Random Walk',
    description: 'Smooth random parameter changes',
    noise: null,
    getPoint: (t, params = {}) => {
      // Simple smooth noise-like movement
      const speed = params.speed || 1;
      return {
        real: 0.5 * Math.sin(t * 2.3 * speed) * Math.cos(t * 1.7 * speed) - 0.2,
        imag: 0.5 * Math.cos(t * 1.9 * speed) * Math.sin(t * 2.1 * speed) + 0.1
      };
    }
  }
};

export { PRESETS, ANIMATION_PATHS };
