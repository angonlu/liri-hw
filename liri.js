// links to packages that we need in order to make this app work.
var keys = require("./keys.js");
var request = require("request");
var Spotify = require("node-spotify-api");
var fs = require("fs");
var twitter = require("twitter");
var client = new twitter({
		consumer_key: keys.twitterKey.consumer_key,
     	consumer_secret: keys.twitterKey.consumer_secret,
     	access_token_key: keys.twitterKey.access_token_key,
     	access_token_secret: keys.twitterKey.access_token_secret 
	});
// ----------------------------Movie-this Function -------------------------------------
function movieThis(){
var arguments = process.argv;
var movieName = "";
	for (var i = 3; i < arguments.length; i++) {
		if (i > 3 && i < arguments.length){
			movieName = movieName + "+" + arguments[i];
		}
		else {
			movieName += arguments[i];
		}
	}

if (movieName === ""){
	movieName = "Mr. Nobody";
}
// uses the request package to request information to the OMDB API
var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey="+ keys.omdbKey.key+"";
request(queryUrl, function(error, response, body){
	if (!error && response.statusCode === 200) {
		// gets rid of the "plus" signs in the title of the movie used to request information
		var cleanStr = movieName.replace(/\+/g, " ")
		// turns every first letter of every word in a title to a capital letter.
		var titleCase = toTitleCase(cleanStr)
		// console.logs every piece of information most relevant to the movie title
		console.log("Title: "+titleCase+
					"\nYear: "+JSON.parse(body).Year+
					"\nIMDB Rating: "+ JSON.parse(body).imdbRating+
					"\nRotten Tomatoes Rating: "+ JSON.parse(body).Ratings[1].Value+
					"\nCountry Produced: "+ JSON.parse(body).Country+
					"\nLanguages: "+ JSON.parse(body).Language+
					"\nPlot: "+ JSON.parse(body).Plot+
					"\nActors: "+ JSON.parse(body).Actors);
		// stores this info in a variable so we can then send it to a function that writes it on a .txt file for 
		// logging purposes.
		var toLog = "\nTitle: "+toTitleCase(cleanStr)+
					"\nYear: "+JSON.parse(body).Year+
					"\nIMDB Rating: "+ JSON.parse(body).imdbRating+
					"\nRotten Tomatoes Rating: "+ JSON.parse(body).Ratings[1].Value+
					"\nCountry Produced: "+ JSON.parse(body).Country+
					"\nLanguages: "+ JSON.parse(body).Language+
					"\nPlot: "+ JSON.parse(body).Plot+
					"\nActors: "+ JSON.parse(body).Actors+
					"\n-------------------------------------"
					// calls the function that logs info and passes our data as an argument
					logData(toLog);

	}
})
}
// Function to change movie title to "title case" or every first letter of every word turned into a capital case
function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
// --------------------------End of Movie-this function ---------------------------
// --------------------------Start of spotify-this function------------------------
function getSong(){
var arguments = process.argv;
var songName = "";
	for (var i = 3; i < arguments.length; i++){
		if (i > 3 && i <  arguments.length){
			songName = songName + "+" + arguments[i];
		}
		else {
			songName += arguments[i]
		}
	}
// I think I got confused here - this was supposed to be in a random txt file and has no business being here.
// I left it cause it caused me great trouble to get it working.
if(arguments.length === 3){
	fs.readFile("default_song.txt", "utf8", function(error, data){
	if (error){
		console.log("error")
	}
	console.log(data)
	var defaultSong = data;
	spotifySearch(defaultSong);
// 	//call the spotify search function

})
}
else{
	spotifySearch(songName);

}
}
// searches for the requested song on the spotify API using the node-api package
function spotifySearch(song){
var spotify = new Spotify({
  id: keys.spotifyKey.id,
  secret: keys.spotifyKey.secret
});
 
spotify.search({ type: 'track', query: song}, function(err, data) {
  if (err) {
    return console.log('Error occurred: ' + err);
  }
  // When the information is retrieved, we select only certain pieces that are most relevant
  console.log("Artist: "+ data.tracks.items[0].artists[0].name+
  	 		  "\nSong: "+ data.tracks.items[0].name+
  	 		  "\nAlbum: "+ data.tracks.items[0].album.name
  	 		  )
// if there is no preview, provide the user with a link to listen if they have a spotify account
if(data.tracks.items[0].preview_url === null){
	console.log("Sorry, no preview available."+ 
				"\nListen here with a Spotify Account: "
				+ data.tracks.items[0].external_urls.spotify)
	var noPreview = data.tracks.items[0].external_urls.spotify;
}
// if there is a preview. provide it
else {
	console.log("Preview(Copy & paste): " + data.tracks.items[0].preview_url)
	var preview = data.tracks.items[0].preview_url;
}
// stores all relevant info in a variable for logging purposes
var toLog = "\nArtist: "+ data.tracks.items[0].artists[0].name+
  	 		  "\nSong: "+ data.tracks.items[0].name+
  	 		  "\nAlbum: "+ data.tracks.items[0].album.name+
  	 		  "\nURL: "+ data.tracks.items[0].external_urls.spotify+ 
  	 		  "\nPreview"+ data.tracks.items[0].preview_url+
  	 		  "\n--------------------"
// sends the requested information to a .txt file
logData(toLog);


});
}

// -------------------------End of spotify-this function -------------------------
// -------------------------start of twitter-this function -----------------------
var params = {screen_name: 'ls_angon'};
// this function gets tweets 0-19, 0 being the most recent of any twitter account.
// in this case, the assignment asks that we only get tweets from our dummy or personal accounts.
function myTweets(){
client.get('statuses/user_timeline', params, function(error, tweets, response){
	if(!error){
		var count = 19;
			for(var i=19; i > -1; i--){
				count--;
				console.log(i+"-"+tweets[i].text)
				var toLog = "\n"+i+"-"+tweets[i].text;
				logData(toLog)
			}
		
	}
	else{
		throw error
	}
})
}

// -------------------------end of twitter-this function---------------------------
// -------------------------Start of "do-what-it-says" function -------------------------
// this is the "do-what-it-says" function. it gets a command from the random.txt file
// it is called if process.argv[2] equals "do-what-it-says"
function getRandomCommand(){
	fs.readFile("random.txt", "utf8", function(error, data){
		if (error){
			throw error
		}
		else{
			// gets the first 17 characters which contain the command
			var command = data.substring(0, 17)
			// gets the rest of the characters which contain the song
			var randSong = data.substring(37, 19)
			// console.log(randSong)
			// sends the song in the txt file to the spotify function.
			spotifySearch(randSong);

	}
	})
}

var doWhatItSays = function() {
  fs.readFile("random.txt", "utf8", function(error, data) {
    console.log(data);

    var dataArr = data.split(",");

    if (dataArr.length === 2) {
      pick(dataArr[0], dataArr[1]);
    }
    else if (dataArr.length === 1) {
      pick(dataArr[0]);
    }
  });
};

// -------------------------End of "do-what-it-says" function
// ------------------------write commands to log.txt---------------
// this file takes the concadenated information as an argument and writes it to a .txt file
function logData(text){
	fs.appendFileSync('log.txt', text);
	console.log("<--Done-->");
}
// --------------------------Conditionals that call certain functions depending on the arguments --------------------
var pick = function(caseData, functionData){
switch(caseData){
	case "movie-this":
	movieThis();
	break;

	case "my-tweets":
	myTweets();
	break;

	case "spotify-this-song":
	getSong();
	break;

	case "do-what-it-says":
	// getRandomCommand();
	doWhatItSays();
	break;
  }
};

var runThis = function(argOne, argTwo){
	pick(argOne, argTwo)
};

runThis(process.argv[2], process.argv[3]);



