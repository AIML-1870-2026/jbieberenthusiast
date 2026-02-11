// Color Palette Definitions for Julia Set Rendering

const COLOR_SCHEMES = {
  classic: {
    name: 'Classic',
    description: 'Blue to White gradient',
    generate: (maxIter) => {
      const palette = [];
      for (let i = 0; i <= maxIter; i++) {
        const t = i / maxIter;
        const r = Math.floor(t * 255);
        const g = Math.floor(t * 255);
        const b = Math.floor(128 + t * 127);
        palette.push({ r, g, b });
      }
      palette[maxIter] = { r: 0, g: 0, b: 0 }; // Inside set = black
      return palette;
    }
  },
  fire: {
    name: 'Fire',
    description: 'Black to Red to Orange to Yellow to White',
    generate: (maxIter) => {
      const palette = [];
      for (let i = 0; i <= maxIter; i++) {
        const t = i / maxIter;
        let r, g, b;
        if (t < 0.25) {
          // Black to dark red
          const lt = t / 0.25;
          r = Math.floor(lt * 128);
          g = 0;
          b = 0;
        } else if (t < 0.5) {
          // Dark red to orange
          const lt = (t - 0.25) / 0.25;
          r = Math.floor(128 + lt * 127);
          g = Math.floor(lt * 100);
          b = 0;
        } else if (t < 0.75) {
          // Orange to yellow
          const lt = (t - 0.5) / 0.25;
          r = 255;
          g = Math.floor(100 + lt * 155);
          b = 0;
        } else {
          // Yellow to white
          const lt = (t - 0.75) / 0.25;
          r = 255;
          g = 255;
          b = Math.floor(lt * 255);
        }
        palette.push({ r, g, b });
      }
      palette[maxIter] = { r: 0, g: 0, b: 0 };
      return palette;
    }
  },
  ocean: {
    name: 'Ocean',
    description: 'Deep Blue to Cyan to Light Blue',
    generate: (maxIter) => {
      const palette = [];
      for (let i = 0; i <= maxIter; i++) {
        const t = i / maxIter;
        let r, g, b;
        if (t < 0.5) {
          // Deep blue to cyan
          const lt = t / 0.5;
          r = Math.floor(lt * 50);
          g = Math.floor(50 + lt * 150);
          b = Math.floor(100 + lt * 100);
        } else {
          // Cyan to light blue/white
          const lt = (t - 0.5) / 0.5;
          r = Math.floor(50 + lt * 200);
          g = Math.floor(200 + lt * 55);
          b = Math.floor(200 + lt * 55);
        }
        palette.push({ r, g, b });
      }
      palette[maxIter] = { r: 0, g: 0, b: 0 };
      return palette;
    }
  },
  grayscale: {
    name: 'Grayscale',
    description: 'Black to White',
    generate: (maxIter) => {
      const palette = [];
      for (let i = 0; i <= maxIter; i++) {
        const t = i / maxIter;
        const v = Math.floor(t * 255);
        palette.push({ r: v, g: v, b: v });
      }
      palette[maxIter] = { r: 0, g: 0, b: 0 };
      return palette;
    }
  },
  psychedelic: {
    name: 'Psychedelic',
    description: 'Rainbow spectrum',
    generate: (maxIter) => {
      const palette = [];
      for (let i = 0; i <= maxIter; i++) {
        const t = i / maxIter;
        // HSL to RGB with cycling hue
        const hue = t * 360 * 3; // 3 full cycles
        const sat = 0.8;
        const light = 0.5;
        const { r, g, b } = hslToRgb(hue, sat, light);
        palette.push({ r, g, b });
      }
      palette[maxIter] = { r: 0, g: 0, b: 0 };
      return palette;
    }
  },
  electric: {
    name: 'Electric',
    description: 'Neon purple to cyan',
    generate: (maxIter) => {
      const palette = [];
      for (let i = 0; i <= maxIter; i++) {
        const t = i / maxIter;
        let r, g, b;
        if (t < 0.33) {
          const lt = t / 0.33;
          r = Math.floor(20 + lt * 100);
          g = 0;
          b = Math.floor(50 + lt * 150);
        } else if (t < 0.66) {
          const lt = (t - 0.33) / 0.33;
          r = Math.floor(120 - lt * 120);
          g = Math.floor(lt * 200);
          b = Math.floor(200 + lt * 55);
        } else {
          const lt = (t - 0.66) / 0.34;
          r = Math.floor(lt * 100);
          g = Math.floor(200 + lt * 55);
          b = 255;
        }
        palette.push({ r, g, b });
      }
      palette[maxIter] = { r: 0, g: 0, b: 0 };
      return palette;
    }
  }
};

// Helper: Convert HSL to RGB
function hslToRgb(h, s, l) {
  h = h % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r, g, b;

  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return {
    r: Math.floor((r + m) * 255),
    g: Math.floor((g + m) * 255),
    b: Math.floor((b + m) * 255)
  };
}

export { COLOR_SCHEMES, hslToRgb };
