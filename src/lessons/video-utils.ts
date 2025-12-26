import ffmpeg from 'fluent-ffmpeg';
import os from 'os';
if (os.platform() === 'win32') {
  // Windows (لوكال)
  ffmpeg.setFfprobePath('ffprobe');
} else {
  // Linux (Server)
  ffmpeg.setFfprobePath('/usr/bin/ffprobe');
}

/* ---------- Types ---------- */

interface FfprobeFormatSafe {
  duration: number;
}

interface FfprobeSafe {
  format: FfprobeFormatSafe;
}

/* ---------- Type Guards ---------- */

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasDurationFormat(data: unknown): data is FfprobeSafe {
  if (!isObject(data)) return false;
  if (!isObject(data.format)) return false;

  return typeof data.format.duration === 'number';
}

/* ---------- Function ---------- */

export async function getVideoDuration(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    ffmpeg(url)
      .inputOptions(['-analyzeduration 10000000', '-probesize 10000000'])
      .ffprobe((err, metadata) => {
        if (err) {
          console.warn('⚠️ ffprobe failed:', err.message);
          return resolve(null);
        }

        if (hasDurationFormat(metadata)) {
          return resolve(metadata.format.duration);
        }

        resolve(null);
      });
  });
}
