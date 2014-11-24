
var twitterAPI = require('node-twitter-api');
var secrets = require('./secrets');
var twitter = new twitterAPI({
		    consumerKey: secrets.consumerKey,
		    consumerSecret: secrets.consumerSecret,
		    callback: 'http://twoot.gus-glover.com/twitter_cb'
		});

module.exports = {

	handshake: function() {
		
		twitter.verifyCredentials(secrets.accessToken, secrets.accessTokenSecret, function(error, data, response) {
		    if (error) {
		        //something was wrong with either accessToken or accessTokenSecret
		        //start over with Step 1
		    } else {
		        //accessToken and accessTokenSecret can now be used to make api-calls (not yet implemented)
		        //data contains the user-data described in the official Twitter-API-docs
		        //you could e.g. display his screen_name
		    }
		});
	},

	post: function(text) {
		console.log("post: " + text);
		twitter.statuses("update", {
        status: text
		    },
		    secrets.accessToken,
		    secrets.accessTokenSecret,
		    function(error, data, response) {
		        if (error) {
		            // something went wrong
		        } else {
		            // data contains the data sent by twitter
		            console.log('here');
		        }
		    }
		);
	}
};