declare module YoutubeDownloader {
  export interface IYoutubeDownloaderOptions {
    outputPath: string;
    // https://github.com/fent/node-ytdl-core/blob/0574df33f3382f3a825e4bef30f21e51cd78eafe/typings/index.d.ts#L7
    youtubeVideoQuality?: 'lowest' | 'highest' | string | number;
    queueParallelism: number;
    fileTimeout: number;
    progressTimeout: number;
    allowWebm?: boolean;
    requestOptions?: {};
  }

  export interface IResultObject {
    author: object;
    videoID: string
    videoTitle: string;
    output: string;
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

declare class YoutubeDownloader {
  constructor(options: YoutubeDownloader.IYoutubeDownloaderOptions)

  cleanFileName(fileName: string): string;
  toMp3(videoId: string, fileName?: string): void;
  #performDownload(task, callback: (errorNessage?: string, output?: any) => void): void;

  on(event: 'queueSize', listener: (total: number) => void): this;
  on(event: 'error' | 'finished', listener: (err: any, data: any) => void): this;
  on(event: 'progress', listener: (video: YoutubeDownloader.IVideoTask) => void): this;
}

declare module '@yohancolla/ytdl' {
  export = YoutubeDownloader;
}