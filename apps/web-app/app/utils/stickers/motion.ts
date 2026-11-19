// Distances are in board units, times in milliseconds, and angles in degrees.
export const paperMotion = {
  rotationRange: 8,
  springFrequency: 30, // Critically damped angular frequency in radians per second.
  maxLag: 32,
  maxTilt: 8,
  speedAtMaxTilt: 1300,
  liftMs: 135,
  pressMs: 310,
}

export function clampLag(distance: number) {
  return Math.max(-paperMotion.maxLag, Math.min(paperMotion.maxLag, distance))
}

/** Exact critically damped spring step. Velocity is in normalized coordinates per second. */
export function follow(position: number, velocity: number, target: number, size: number, seconds: number) {
  const error = clampLag((position - target) * size) / size
  const frequency = paperMotion.springFrequency
  const slope = velocity + frequency * error
  const decay = Math.exp(-frequency * seconds)
  return {
    position: target + (error + slope * seconds) * decay,
    velocity: (velocity - frequency * slope * seconds) * decay,
  }
}

export function bank(speed: number) {
  return paperMotion.maxTilt * Math.tanh(speed / paperMotion.speedAtMaxTilt)
}
