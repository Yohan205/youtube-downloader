'use strict';
const os = require('os');
const EventEmitter = require('events').EventEmitter;
const fs = require('fs');
const pathToFfmpeg = require('ffmpeg-static')
const ffmpeg = require('fluent-ffmpeg');
const ytdl = require('ytdl-core');
const async = require('async');
const progress = require('progress-stream');
const sanitize = require('sanitize-filename');

class YoutubeDownloader extends EventEmitter {

  constructor(options) {
    super();
    this.outputPath = options && options.outputPath ? options.outputPath : './';
    this.queueParallelism = (options && options.queueParallelism ? options.queueParallelism : 1);
    this.progressTimeout = (options && options.progressTimeout ? options.progressTimeout : 1000);
    this.deleteTimeout = (options && options.deleteTimeout ? options.deleteTimeout : 0);
    this.requestOptions = (options && options.requestOptions ? options.requestOptions : { maxRedirects: 5 });
    this.audioMetadata = (options && options.audioMetadata ? options.audioMetadata : []);

    if (options && options.ffmpegPath) {
      ffmpeg.setFfmpegPath(options.ffmpegPath);
    } else {
		ffmpeg.setFfmpegPath(pathToFfmpeg);
	}

    this.#setupQueue();
  }

  #setupQueue() {
    let self = this;
    // Async download/transcode queue
    this.downloadQueue = async.queue(function (task, callback) {
      self.emit('queueSize', self.downloadQueue.running() + self.downloadQueue.length());

      switch (task.type) {
        case "mp3":
          self.#performDownload(task, function(err, result) {
            callback(err, result);
          });
          break;
        case 'mp4':
          self.#downloadVideo(task, function(err, result) {
            callback(err, result);
          });
          break;
        default:
          break;
      }
    }, self.queueParallelism);
  }

  toMp3 (videoLink, quality, fileName) {
    let self = this;
    const task = {
      type: 'mp3',
		  videoLink: videoLink,
      quality: quality ? quality : 'highestaudio',
    	fileName: fileName
    };

    this.downloadQueue.push(task, function (err, data) {
      self.emit('queueSize', self.downloadQueue.running() + self.downloadQueue.length());

      if (err) {
        self.emit('error', err, data);
      } else {
        self.emit('finish', err, data);
      }
    });
  };

  toMp4 (videoLink, fileName) {
    let self = this;
    const task = {
      type: 'mp4',
      videoLink: videoLink,
      quality: 18,
      fileName: fileName
    };

    self.downloadQueue.push(task, function (err, data) {
      self.emit('queueSize', self.downloadQueue.running() + self.downloadQueue.length());

      if (err) {
        self.emit('error', err, data);
      } else {
        self.emit('finish', err, data);
      }
    });
  }

  async #performDownload(task, callback) {
    let self = this;
    let info;

    if (!ytdl.validateURL(task.videoLink)) return callback({
        error: "Invalid video URL! Check the URL and try again.",
        youtubeUrl: task.videoLink
      }, null);

    let resultObj = {
      videoId: ytdl.getURLVideoID(task.videoLink),
    };

    try {
      info = await ytdl.getInfo(resultObj.videoId, { quality: task.quality })
    } catch (err){
      return callback(err, null);
    }

    const videoTitle = sanitize(info.videoDetails.title);
    let artist = 'Unknown';
    let title = 'Unknown';
    const thumbnail = info.videoDetails.thumbnails ?
      info.videoDetails.thumbnails[0].url
      : info.videoDetails.thumbnail || null;

    if (videoTitle.indexOf('-') > -1) {
      let temp = videoTitle.split('-');
      if (temp.length >= 2) {
        artist = temp[0].trim();
        title = temp[1].trim();
      }
    } else {
      title = videoTitle;
    }

    // Derive file name, if given, use it, if not, from video title
    const fileName = (task.fileName ? self.outputPath + '/' + sanitize(task.fileName) : self.outputPath + (videoTitle || info.videoId) + '.mp3');

    // Stream setup
    const streamOptions =  {
      quality: task.quality,
      requestOptions: self.requestOptions
    };

    const stream = ytdl.downloadFromInfo(info, streamOptions);

    stream.on('error', function(err){
      callback(err, null);
    });

    stream.on('response', function(httpResponse) {
      // Setup of progress module
      const str = progress({
        length: parseInt(httpResponse.headers['content-length']),
        time: self.progressTimeout
      });

      // Add progress event listener
      str.on('progress', function(progress) {
        if (progress.percentage === 100) {
          resultObj.stats= {
            transferredBytes: progress.transferred,
            runtime: progress.runtime,
            averageSpeed: parseFloat(progress.speed.toFixed(2))
          }
        }
        self.emit('progress', {videoId: task.videoId, progress: progress})
      });
      let outputOptions = [
        '-id3v2_version', '4',
        '-metadata', 'title=' + title,
        '-metadata', 'artist=' + artist
      ];
      if (self.audioMetadata) {
        outputOptions = outputOptions.concat(self.audioMetadata);
      }
      
      const audioBitrate = info.formats.find(format => !!format.audioBitrate).audioBitrate

      // Start encoding
      const proc = new ffmpeg({
        source: stream.pipe(str)
      })
      .audioBitrate(audioBitrate || 192)
      .withAudioCodec('libmp3lame')
      .toFormat('mp3')
      .outputOptions(...outputOptions)
      .on('error', function(err) {
        return callback(err.message, null);
      })
      .on('end', function() {
        resultObj.author =  {
          artist,
          title,
          thumbnail
        }
        resultObj.output =  fileName;
        resultObj.videoTitle = videoTitle;
        return callback(null, resultObj);
      })
      .saveToFile(fileName);
    });
  };

  async #downloadVideo(task, callback) {
    let info, infoVideo;

    if (!ytdl.validateURL(task.videoLink)) return callback({
      error: "Invalid video URL! Check the URL and try again.",
      youtubeUrl: task.videoLink
    }, null);

    try {
      info = await ytdl.getInfo(task.videoID, { quality: task.quality })
    } catch (err){
      return callback(err);
    }

    infoVideo = info.videoDetails;
  
    //console.log(infoVideo.author);
    const videoTitle = sanitize(infoVideo.title);
  
    const filePath = (task.fileName ? this.outputPath + '/' + sanitize(task.fileName) : this.outputPath + (videoTitle || info.videoId) + '.mp4');

    // Stream setup
      const streamOptions = {
      quality: this.youtubeVideoQuality,
      filter: format => ((format.hasAudio === true && format.hasVideo === true ) && format.container === 'mp4' ),
      requestOptions: this.requestOptions
    }
  
    const stream = ytdl.downloadFromInfo(info, streamOptions);
  
    stream.on('error', function(err){
      callback(err, null);
    });

    const resultObj = {
      videoID: task.videoID,
      author: infoVideo.author,
      videoTitle,
      output: filePath,
    }

    stream.on('progress', (data) => console.log("PROGRESS", data));
    /*stream.on('response', (httpResponse) => {
      // Setup of progress module
      const streaming = progress({
        length: parseInt(httpResponse.headers['content-length']),
        time: this.progressTimeout
      });

      // Add progress event listener
      streaming.on('progress', (progress) => {
        if (progress.percentage === 100) {
          resultObj.stats= {
            transferredBytes: progress.transferred,
            runtime: progress.runtime,
            averageSpeed: parseFloat(progress.speed.toFixed(2))
          }
        }
        self.emit('progress', {videoID: task.videoID, progress: progress});
      });
    });*/

    stream.pipe(fs.createWriteStream(filePath));

    stream.on("end", (err) => {
      if (this.deleteTimeout !== 0){
        setTimeout( (cb) =>{
          try {
            fs.unlinkSync(filePath);
            console.log('File removed, timeout to remove (seconds):', this.deleteTimeout);
          } catch(err) {
            console.error('Something wrong happened removing the file', err); 
            resultObj.Error = err;
          }
        }, (1000*this.deleteTimeout), callback);
      }

      callback(null, resultObj);
    });
    
  }
}

module.exports = YoutubeDownloader;
