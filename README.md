[![npm](https://img.shields.io/npm/v/@yohancolla/ytdl.svg)](https://www.npmjs.com/package/@yohancolla/ytdl)
[![npm](https://img.shields.io/npm/dt/@yohancolla/ytdl.svg?maxAge=3600)](https://www.npmjs.com/package/@yohancolla/ytdl)
[![install size](https://packagephobia.now.sh/badge?p=@yohancolla/ytdl)](https://packagephobia.now.sh/result?p=@yohancolla/ytdl)
![X (formerly Twitter) URL](https://img.shields.io/twitter/url?url=https%3A%2F%2Ftwitter.com%2FYohanColla&style=social)


[![NPM](https://nodei.co/npm/@yohancolla/ytdl.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/@yohancolla/ytdl/)

# 🧐 About Youtube Downloader

With this module you can download videos and song from Youtube (MP3 and MP4) which allows from a specific YouTube video to convert to MP3 (Only audio) or MP4 (Video), and stored on disk.

## ⚙️ Running

### Basic example

A basic usage example to download mp3 is the following:

```javascript
const YTDL = require("@yohancolla/ytdl");

//Configure YoutubeDownloader with your settings
var ytdl = new YTDL({
    "outputPath": "/path/to/mp3/folder",    // Output file location (default: the home directory)  
    "queueParallelism": 2,                  // Download parallelism (default: 1)
    "progressTimeout": 2000,                // Interval in ms for the progress reports (default: 1000)
    "deleteTimeout": 60                     // Interval in seconds for delete the file (default: 0 [no delete])
});

//Download video and save as MP3 file
// On video quality default is highestaudio
ytdl.toMp3("https://youtu.be/CqGOwGQtCFk?si=8HSNkZBnjXrHx7Wp", "highestaudio");

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
ytdl.toMp3(linkURL, "highestaudio", "DVRST - My Toy");
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
    videoId: "Vhd6Kc4TZls",
    author: {
        artist: "DVRST",
        title: "My Toy",
        thumbnail: "https://i.ytimg.com/vi/Vhd6Kc4TZls/hqdefault.jpg"
    }
    output: "/path/to/mp3/folder/DVRST - My Toy.mp3",
    videoTitle: "DVRST - My Toy"
}
```

## License
MIT License

Copyright (C) 2024-present by YohanColla

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. 