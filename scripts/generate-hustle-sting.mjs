import { writeFileSync } from "node:fs"

const sampleRate = 22050
const duration = 1.85
const count = Math.floor(sampleRate * duration)
const samples = new Float32Array(count)
const clamp = (x) => Math.max(-0.96, Math.min(0.96, x))
const env = (t, attack, decay) => t < 0 ? 0 : (1 - Math.exp(-t / Math.max(0.001, attack))) * Math.exp(-t / Math.max(0.001, decay))
const add = (time, fn, gain = 1) => {
  const start = Math.floor(time * sampleRate)
  for (let i = start; i < count; i++) {
    const t = (i - start) / sampleRate
    samples[i] += fn(t) * gain
  }
}

// Compact original sting: two soft hip-hop kicks, a crisp noise snare, metallic cash chime and coin-like sparkle.
add(0, t => Math.sin(2 * Math.PI * (43 + 66 * Math.exp(-t * 17)) * t) * env(t, 0.004, 0.19), 0.55)
add(0.34, t => Math.sin(2 * Math.PI * (42 + 48 * Math.exp(-t * 15)) * t) * env(t, 0.003, 0.15), 0.36)
for (const start of [0.19, 0.53]) {
  let seed = Math.floor(start * 100000) + 71
  add(start, t => {
    seed = (seed * 16807) % 2147483647
    const noise = (seed / 1073741823.5) - 1
    return noise * env(t, 0.002, 0.055) * 0.42 + Math.sin(2 * Math.PI * 185 * t) * env(t, 0.003, 0.09) * 0.12
  }, 0.5)
}
const bell = (t, freq, decay, phase = 0) => Math.sin(2 * Math.PI * freq * t + phase) * Math.exp(-t / decay)
add(0.72, t => (bell(t, 1046.5, 0.44) * 0.5 + bell(t, 1568, 0.36, 0.4) * 0.32 + bell(t, 2093, 0.27, 1.1) * 0.18), 0.55)
add(0.96, t => (bell(t, 1318.5, 0.38) * 0.5 + bell(t, 1760, 0.31, 0.5) * 0.3 + bell(t, 2637, 0.2, 0.7) * 0.15), 0.32)
for (const [start, freq, gain] of [[1.12, 1976, 0.18], [1.23, 1568, 0.16], [1.32, 2349, 0.14], [1.42, 1760, 0.12]]) {
  add(start, t => bell(t, freq, 0.22, 0.2), gain)
}
for (let i = 0; i < count; i++) {
  const t = i / sampleRate
  const fade = Math.min(1, t / 0.025, (duration - t) / 0.32)
  samples[i] = clamp(samples[i] * Math.max(0, fade))
}

const dataSize = count * 2
const wav = Buffer.alloc(44 + dataSize)
wav.write("RIFF", 0)
wav.writeUInt32LE(36 + dataSize, 4)
wav.write("WAVE", 8)
wav.write("fmt ", 12)
wav.writeUInt32LE(16, 16)
wav.writeUInt16LE(1, 20)
wav.writeUInt16LE(1, 22)
wav.writeUInt32LE(sampleRate, 24)
wav.writeUInt32LE(sampleRate * 2, 28)
wav.writeUInt16LE(2, 32)
wav.writeUInt16LE(16, 34)
wav.write("data", 36)
wav.writeUInt32LE(dataSize, 40)
for (let i = 0; i < count; i++) wav.writeInt16LE(Math.round(samples[i] * 32767), 44 + i * 2)

writeFileSync(new URL("../public/audio/hustle-intro.wav", import.meta.url), wav)
console.log(`Generated original ${duration.toFixed(2)}s intro sting (${wav.length} bytes).`)
