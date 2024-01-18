declare module YTDL {
  export interface IYTDL_Options {
    outputPath?: string;
    // https://github.com/fent/node-ytdl-core/blob/0574df33f3382f3a825e4bef30f21e51cd78eafe/typings/index.d.ts#L7
    //youtubeVideoQuality: 'lowest' | 'highest' | string | number;
    deleteTimeout?: number;
    queueParallelism?: number;
    deleteTimeout?: number;
    progressTimeout?: number;
    allowWebm?: boolean;
    requestOptions?: {};
    audioMetadata?: string[]; // ID3 tags to set as audio metadata
  }

  export interface IResultObj {
    videoID: string;
    author: object;
    output: string;
    videoTitle: string;
  }

  export interface IVideoTask {
    videoId: string;
    // https://github.com/freeall/progress-stream#usage
    progress: {
      percentage: number;
      transferred: number;
      length: number;
      remaining: number;
      eta: number;
      runtime: number;
      delta: number;
      speed: number;
    }
  }
}

declare class YTDL {
  constructor(options: YTDL.IYTDL_Options)

  //cleanFileName(fileName: string): string;

  /**
   * Downloads the specified youtube video to mp3.
   * @param {string} linkYT Url of video from youtube.com
   * @param {string | number} quality Audio Quality to download. Default is highest quality.
   * @param {string} fileName File name of video. Optional.
   * @returns void
   */
  toMp3(linkYT: string, quality?: 'lowestaudio' | 'highestaudio' | string | number, fileName?: string): void;

  /**
   * Downloads the specified youtube video to mp4.
   * @param {string} linkYT Url of video from youtube.com
   * @param {string} fileName File name of video. Optional.
   * @returns void
   */
  toMp4(linkYT: string, fileName?: string): void;

  #performDownload(task: object, callback: (errorNessage?: string, output?: any) => void): void;

  /**
   * Event emitted when the queue size changes (both positive and negative). 
   * @event progress return info about video download progress.
   */
  on(event: 'queueSize', listener: (total: number) => void): this;

  /**
   * Event emitted when happen a error or finish download video..
   * @event error return info about err.
   * @event finish return a data object with information about video or audio downloaded.
   */
  on(event: 'error' | 'finish', listener: (err: any, data: YTDL.IResultObj) => void): this;
  /**
   * Event emitted when an audio is being downloaded.
   * @event progress return info about video download progress.
   */
  on(event: 'progress', listener: (video: YTDL.IVideoTask) => void): this;
}

declare module '@yohancolla/ytdl' {
  export = YTDL;
}