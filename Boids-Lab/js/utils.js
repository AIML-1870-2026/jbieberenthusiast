// Vector Math & Helper Utilities

// Euclidean distance between two points
function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Squared distance (faster, avoids sqrt)
function distanceSquared(x1, y1, x2, y2) {
  return (x2 - x1) ** 2 + (y2 - y1) ** 2;
}

// Vector magnitude (length)
function magnitude(vx, vy) {
  return Math.sqrt(vx * vx + vy * vy);
}

// Normalize vector to unit length
function normalize(vx, vy) {
  const mag = magnitude(vx, vy);
  if (mag === 0) return { x: 0, y: 0 };
  return { x: vx / mag, y: vy / mag };
}

// Limit vector magnitude to max value
function limit(vx, vy, max) {
  const mag = magnitude(vx, vy);
  if (mag > max && mag > 0) {
    return { x: (vx / mag) * max, y: (vy / mag) * max };
  }
  return { x: vx, y: vy };
}

// Set vector to specific magnitude
function setMagnitude(vx, vy, mag) {
  const n = normalize(vx, vy);
  return { x: n.x * mag, y: n.y * mag };
}

// Map value from one range to another
function map(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

// Clamp value between min and max
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Map speed to HSL hue for color gradient
// Speed 0-2: Blue (240), 2-4: Cyan-Green (180-120), 4-6: Yellow-Orange (60-30), 6+: Red (0)
function speedToHue(speed, maxSpeed) {
  const normalizedSpeed = clamp(speed, 0, maxSpeed);

  if (normalizedSpeed <= 2) {
    return 240; // Blue
  } else if (normalizedSpeed <= 4) {
    return map(normalizedSpeed, 2, 4, 180, 120); // Cyan to Green
  } else if (normalizedSpeed <= 6) {
    return map(normalizedSpeed, 4, 6, 60, 30); // Yellow to Orange
  } else {
    return map(normalizedSpeed, 6, maxSpeed, 30, 0); // Orange to Red
  }
}

// Random number between min and max
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// Random integer between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export {
  distance,
  distanceSquared,
  magnitude,
  normalize,
  limit,
  setMagnitude,
  map,
  clamp,
  speedToHue,
  random,
  randomInt
};
