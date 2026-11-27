// Native Duris log grammar, matching ansi.c and url_text.h.
// Keep nativePvpLog.ts in the other package in sync.
export interface NativeLogRun {
  text: string
  foreground?: string
  background?: string
}

const colors = 'lbgcrmywLBGCRMYW'

function validColor(letter: string): boolean {
  return letter.length === 1 && colors.includes(letter)
}

function urlDelimiter(char: string): boolean {
  const code = char.charCodeAt(0)
  return code <= 32 || (code >= 127 && code <= 159) || '<>"\u0027\u0060\\'.includes(char)
}

function urlParameter(text: string, index: number, query: boolean): boolean {
  const next = text.charAt(index + 1)
  const after = text.charAt(index + 2)
  if (query && /^[nN]$/.test(next) && /^[a-zA-Z0-9_%\u0080-\uffff-]$/.test(after)) {
    return true
  }
  for (let i = index + 1; i < text.length; i++) {
    const char = text.charAt(i)
    if (char === '=') return true
    if (
      char.charCodeAt(0) <= 32 ||
      char.charCodeAt(0) === 127 ||
      '&/?#<>"\u0027\u0060\\'.includes(char)
    ) {
      return false
    }
  }
  return false
}

export function parseNativePvpLog(text: string): NativeLogRun[] {
  const runs: NativeLogRun[] = []
  let foreground: string | undefined
  let background: string | undefined
  let inUrl = false
  let query = false
  let tail = ''

  function reset() {
    foreground = undefined
    background = undefined
    inUrl = false
    query = false
    tail = ''
  }

  function append(char: string) {
    const previous = runs[runs.length - 1]
    if (previous && previous.foreground === foreground && previous.background === background) {
      previous.text += char
    } else {
      runs.push({ text: char, foreground, background })
    }
    tail = (tail + char).slice(-9)
    if (urlDelimiter(char)) {
      inUrl = false
      query = false
    } else if (inUrl && (char === '?' || char === '#')) {
      query = true
    } else if (!inUrl && char === '/' && /(^|[^a-zA-Z0-9_])https?:\/\/$/i.test(tail)) {
      inUrl = true
    }
  }

  for (let i = 0; i < text.length; ) {
    const char = text.charAt(i)
    if (char === '\r') {
      i++
      continue
    }
    if (char === '\n' || char === '\x1f') {
      reset()
      if (char === '\n') append(char)
      i++
      continue
    }
    if (char === '&' && !(inUrl && text[i - 1] !== '&' && urlParameter(text, i, query))) {
      const next = text.charAt(i + 1)
      const first = text.charAt(i + 2)
      const second = text.charAt(i + 3)
      if (next === 'n' || next === 'N') {
        foreground = undefined
        background = undefined
        i += 2
        continue
      }
      if ((next === '+' || next === '-') && validColor(first)) {
        foreground = next === '+' ? first : undefined
        background = next === '-' ? first.toLowerCase() : undefined
        i += 3
        continue
      }
      if (next === '=' && validColor(first) && validColor(second)) {
        foreground = second
        background = first.toLowerCase()
        i += 4
        continue
      }
    }
    append(char)
    i++
  }
  return runs
}

export function stripNativePvpLog(text: string): string {
  return parseNativePvpLog(text)
    .map((run) => run.text)
    .join('')
}
