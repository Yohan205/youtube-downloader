const YTDL = require('./index');
//let link = 'https://www.youtube.com/watch?v=LXybWcPHMXc';
let link = ['https://youtu.be/acfYQmCBsz8?si=yXYb0DqpTcFuB6J7', 'https://youtu.be/CqGOwGQtCFk?si=8HSNkZBnjXrHx7Wp'];

var downloadVideo = async () => {
    console.log('downloading');
    const ytdl = new YTDL({
        //outputPath: '.',
        deleteTimeout: (3*60),
        youtubeVideoQuality: '18',//'hightestvideo',
    });

    ytdl.toMp4(link[1]);

    ytdl.on('finish', (err, data) => {
        console.log("finish", data);
    })
    
    ytdl.on("error", function(error) {
        console.log("Error", error);
    });
    
    ytdl.on("progress", function(progress) {
        console.log(progress);
    });
};

var downlaodMp3 = async () => {
    console.log("Downlaoding...");

    const ytdl = new YTDL({
        outputPath: './media/',
    });

    ytdl.toMp3(link[1], 'highestaudio', 'My Toy');

    ytdl.on("finish", function(err, data) {
        console.log("fisnish", data);
    });
    
    ytdl.on("error", function(error) {
        console.log("Error", error);
    });
    
    ytdl.on("progress", function(progress) {
        console.log("percent", progress);
    });
};

//downloadVideo();
downlaodMp3();