export interface MapTextRun {
  text: string
  foreground?: string
  background?: string
}
// Game terrain colors are data semantics, separate from application chrome.
const foreground: Record<string, string> = {
  r: '128,0,0',
  R: '255,0,0',
  g: '0,128,0',
  G: '0,255,0',
  b: '0,0,128',
  B: '0,128,255',
  c: '0,128,128',
  C: '0,255,255',
  m: '128,0,128',
  M: '255,0,255',
  y: '128,128,0',
  Y: '255,255,0',
  w: '192,192,192',
  W: '255,255,255',
  L: '96,96,96',
  l: '0,0,0',
}
const background: Record<string, string> = {
  r: '80,0,0',
  g: '0,80,0',
  b: '0,0,60',
  c: '0,60,60',
  m: '60,0,60',
  y: '60,60,0',
  w: '60,60,60',
  l: '0,0,0',
}
export function parseMapText(text: string): MapTextRun[] {
  // Uppercase backgrounds are attributes, not brightness.
  const backgroundColor = (letter: string) => background[letter.toLowerCase()]
  const runs: MapTextRun[] = []
  let fg: string | undefined
  let bg: string | undefined
  function append(value: string) {
    const previous = runs[runs.length - 1]
    if (previous && previous.foreground === fg && previous.background === bg) previous.text += value
    else runs.push({ text: value, foreground: fg, background: bg })
  }
  for (let i = 0; i < text.length; ) {
    const char = text[i]
    if (char === '\r') {
      i++
      continue
    }
    if (char === '\n' || (char === '\\' && text[i + 1] === 'n')) {
      fg = undefined
      bg = undefined
      append('\n')
      i += char === '\n' ? 1 : 2
      continue
    }
    if (char === '&') {
      const next = text[i + 1]
      const color = text[i + 2] ?? ''
      if (next === '+' && foreground[color]) {
        fg = `rgb(${foreground[color]})`
        bg = undefined
        i += 3
        continue
      }
      if (next === '-' && backgroundColor(color)) {
        bg = `rgb(${backgroundColor(color)})`
        fg = undefined
        i += 3
        continue
      }
      if (next === '=' && backgroundColor(color) && foreground[text[i + 3] ?? '']) {
        bg = `rgb(${backgroundColor(color)})`
        fg = `rgb(${foreground[text[i + 3] ?? '']})`
        i += 4
        continue
      }
      if (next === 'n' || next === 'N' || next === ']') {
        fg = undefined
        bg = undefined
        i += 2
        continue
      }
    }
    append(char ?? '')
    i++
  }
  return runs
}
