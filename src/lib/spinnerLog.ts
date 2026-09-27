type Level = 'info' | 'warn' | 'error' | 'debug'

function emit(level: Level, event: string, detail?: Record<string, unknown>) {
  const message = `[spinner] +${Math.round(performance.now())}ms ${event}`
  if (detail === undefined) console[level](message)
  else console[level](message, detail)
}

/**
 * Console logging for the product spinner. Kept on in production builds so
 * load/interaction issues can be diagnosed on the deployed site. Stages log
 * at info, recoverable issues at warn, failures at error, and per-drag detail
 * at debug (only visible with DevTools' "Verbose" level).
 */
export const spinnerLog = {
  info: (event: string, detail?: Record<string, unknown>) => emit('info', event, detail),
  warn: (event: string, detail?: Record<string, unknown>) => emit('warn', event, detail),
  error: (event: string, detail?: Record<string, unknown>) => emit('error', event, detail),
  debug: (event: string, detail?: Record<string, unknown>) => emit('debug', event, detail),
}
