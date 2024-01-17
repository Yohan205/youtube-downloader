# Youtube Downloader

Youtube MP3 and MP4 Downloader is a module which allows from an specify YouTube video to converted to MP3 (Only audio) or MP4 (Video), and stored on disk.

## Installation

### Installation via NPM

`npm install @yohancolla/ytdl --save`

## Running

### Basic example

A basic usage example is the following:

```javascript
var YTDL = require("@yohancolla/ytdl");

//Configure YoutubeDownloader with your settings
var ytdl = new YTDL({
    "outputPath": "/path/to/mp3/folder",    // Output file location (default: the home directory)
    "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
    "queueParallelism": 2,                  // Download parallelism (default: 1)
    "progressTimeout": 2000,                // Interval in ms for the progress reports (default: 1000)
    "allowWebm": false                      // Enable download from WebM sources (default: false)
});

//Download video and save as MP3 file
ytdl.toMp3("https:youtu.be/Vhd6Kc4TZls");

ytdl.on("finish", function(err, data) {
    console.log(data);
});

ytdl.on("error", function(error) {
    console.log(error);
});

ytdl.on("progress", function(progress) {
    console.log(JSON.stringify(progress));
});
```

You can also pass a file name for the respective video, which will then be used. Otherwise, the file name will be derived from the video title.
```javascript
ytdl.toMp3("https://youtu.be/Vhd6Kc4TZls", "Cold Funk - Funkorama.mp3");
```

While downloading, every `progressTimeout` timeframe, there will be an `progress` event triggered, outputting an object like

```javascript
{
    "videoId": "Vhd6Kc4TZls",
    "progress": {
        "percentage": 72.29996914191304,
        "transferred": 19559221,
        "length": 27052876,
        "remaining": 7493655,
        "eta": 2,
        "runtime": 6,
        "delta": 6591454,
        "speed": 3009110.923076923
    }
}
```

Furthermore, there will be a `queueSize` event emitted when the queue size changes (both positive and negative). This can be caught via

```javascript
ytdl.on("queueSize", function(size) {
    console.log(size);
});
```

Upon finish, the following output will be returned:

```javascript
{
    "videoId": "Vhd6Kc4TZls",
    "stats": {
        "transferredBytes": 27052876,
        "runtime": 7,
        "averageSpeed": 3279136.48
    },
    "output": "/path/to/mp3/folder/Cold Funk - Funkorama.mp3",
    "youtubeUrl": "http://www.youtube.com/watch?v=Vhd6Kc4TZls",
    "videoTitle": "Cold Funk - Funkorama - Kevin MacLeod | YouTube Audio Library",
    "artist": "Cold Funk",
    "title": "Funkorama",
    "thumbnail": "https://i.ytimg.com/vi/Vhd6Kc4TZls/hqdefault.jpg"
}
```