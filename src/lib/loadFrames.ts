import { spinnerLog } from './spinnerLog'

async function loadOne(url: string): Promise<ImageBitmap> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return createImageBitmap(await response.blob())
}

/**
 * Downloads and fully decodes every frame up front, so drawing a frame later
 * never waits on the network or on a lazy decode. Each frame is retried once;
 * a second failure rejects. `onProgress` fires as each frame becomes drawable.
 * Resolves with bitmaps in the same order as `urls`.
 */
export async function loadFrames(
  urls: string[],
  onProgress: (done: number, total: number) => void,
): Promise<ImageBitmap[]> {
  const total = urls.length
  const startedAt = performance.now()
  let done = 0
  spinnerLog.info('load:start', { frames: total })

  const bitmaps = await Promise.all(
    urls.map(async (url, index) => {
      const frameStartedAt = performance.now()
      let bitmap: ImageBitmap
      try {
        bitmap = await loadOne(url)
      } catch (error) {
        spinnerLog.warn('load:retry', { index, url, error })
        try {
          bitmap = await loadOne(url)
        } catch (retryError) {
          spinnerLog.error('load:failed', { index, url, error: retryError })
          throw retryError
        }
      }
      done += 1
      spinnerLog.info('load:frame', {
        index,
        ms: Math.round(performance.now() - frameStartedAt),
        done,
        total,
      })
      onProgress(done, total)
      return bitmap
    }),
  )

  spinnerLog.info('load:done', { ms: Math.round(performance.now() - startedAt) })
  return bitmaps
}
