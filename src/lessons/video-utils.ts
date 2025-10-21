import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffprobePath from '@ffprobe-installer/ffprobe';

ffmpeg.setFfmpegPath(ffmpegPath.path);
ffmpeg.setFfprobePath(ffprobePath.path);

// نعرف نوع بسيط للنتيجة اللي احنا محتاجينها فقط
interface SafeFfprobeFormat {
  duration?: number;
}

interface SafeFfprobeData {
  format?: SafeFfprobeFormat;
}

/**
 * Safely extract video duration (in seconds) using ffprobe.
 */
export async function getVideoDuration(url: string): Promise<number | null> {
  return new Promise<number | null>((resolve) => {
    ffmpeg.ffprobe(
      url,
      (err: Error | null | undefined, metadataRaw: unknown) => {
        if (err) {
          console.warn(
            '⚠️ Could not read duration for video:',
            url,
            err.message,
          );
          resolve(null);
          return;
        }

        // نعمل casting آمن للنوع اللي احنا محددينه
        const metadata = metadataRaw as SafeFfprobeData;

        const dur =
          typeof metadata?.format?.duration === 'number'
            ? metadata.format.duration
            : null;

        resolve(dur);
      },
    );
  });
}
