export class FFmpegFactory {
  public static get(): any {
    const ffmpeg = require('fluent-ffmpeg');
    try {
      const ffmpegPath = require('ffmpeg-static');
      ffmpeg.setFfmpegPath(ffmpegPath);
      const ffprobePath = require('ffprobe-static');
      ffmpeg.setFfprobePath(ffprobePath.path);
    } catch (e) {
    }
    return ffmpeg;
  }
}
