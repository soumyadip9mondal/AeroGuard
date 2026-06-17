import { spawn } from 'child_process';
import { Readable } from 'stream';

// Standard 8-byte PNG header signature
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

/**
 * Pipes a video stream into FFmpeg and yields decoded frame buffers on-the-fly.
 * 
 * @param videoStream Readable source stream (e.g. from R2 GetObject)
 * @param sampleRateFps Rate at which to sample frames (e.g. 1 frame per second)
 * @param abortSignal Option abort signal to stop FFmpeg execution
 */
export async function* extractFrames(
  videoStream: Readable,
  sampleRateFps: number,
  abortSignal?: AbortSignal
): AsyncGenerator<Buffer> {
  // Spawn FFmpeg as a child process
  const ffmpeg = spawn('ffmpeg', [
    '-i', 'pipe:0',                          // Input from stdin
    '-vf', `fps=${sampleRateFps}`,           // Set frame sampling rate
    '-f', 'image2pipe',                     // Output format
    '-vcodec', 'png',                       // PNG compression codec
    'pipe:1',                               // Output to stdout
  ]);

  let isKilled = false;

  // Handle abort signal by killing FFmpeg
  if (abortSignal) {
    if (abortSignal.aborted) {
      ffmpeg.kill('SIGKILL');
      isKilled = true;
    } else {
      abortSignal.addEventListener('abort', () => {
        console.log('Abort signal detected. Terminating FFmpeg child process...');
        ffmpeg.kill('SIGKILL');
        isKilled = true;
      });
    }
  }

  // Handle pipe broken / stdin errors gracefully
  ffmpeg.stdin.on('error', (err: any) => {
    // Avoid logging generic pipe errors when FFmpeg exits normally or gets killed
    if (!isKilled) {
      console.debug('FFmpeg stdin pipe error:', err.message);
    }
  });

  // Capture standard error stream in background for diagnostics
  let stderrOutput = '';
  ffmpeg.stderr.on('data', (chunk) => {
    stderrOutput += chunk.toString('utf8');
  });

  // Pipe videoStream to FFmpeg stdin
  videoStream.pipe(ffmpeg.stdin);

  let accumulator = Buffer.alloc(0);

  // Read stdout data
  for await (const chunk of ffmpeg.stdout) {
    if (abortSignal?.aborted) {
      break;
    }
    
    // Accumulate incoming bytes
    accumulator = Buffer.concat([accumulator, chunk]);

    // Parse and yield any complete PNG images inside the accumulator
    while (accumulator.length >= PNG_SIGNATURE.length) {
      // 1. Locate the first signature in the accumulator to align the stream
      const firstSigIndex = accumulator.indexOf(PNG_SIGNATURE);
      if (firstSigIndex === -1) {
        // No signature found, wait for more data
        break;
      }

      // If leading bytes exist before the first signature, discard them (junk/metadata)
      if (firstSigIndex > 0) {
        accumulator = accumulator.subarray(firstSigIndex);
      }

      // 2. Scan for the NEXT signature to find the end boundaries of the current image
      const nextSigIndex = accumulator.indexOf(PNG_SIGNATURE, PNG_SIGNATURE.length);
      if (nextSigIndex === -1) {
        // The first image is incomplete, accumulate more data
        break;
      }

      // 3. Slice out the complete frame buffer
      const frameBuffer = accumulator.subarray(0, nextSigIndex);
      
      // 4. Update accumulator to slice off the yielded frame
      accumulator = accumulator.subarray(nextSigIndex);

      yield frameBuffer;
    }
  }

  // Yield the remaining image buffer if it is a complete PNG frame
  if (!abortSignal?.aborted && accumulator.length >= PNG_SIGNATURE.length) {
    const finalSigIndex = accumulator.indexOf(PNG_SIGNATURE);
    if (finalSigIndex !== -1) {
      const frameBuffer = accumulator.subarray(finalSigIndex);
      yield frameBuffer;
    }
  }

  // Wait for the FFmpeg process to close
  const exitCode = await new Promise<number | null>((resolve) => {
    ffmpeg.on('close', (code) => {
      resolve(code);
    });
  });

  // Throw error only if FFmpeg failed and we did not terminate it intentionally
  if (exitCode !== 0 && exitCode !== null && !isKilled) {
    throw new Error(`FFmpeg exited with error code ${exitCode}. Stderr: ${stderrOutput.slice(-500)}`);
  }
}
