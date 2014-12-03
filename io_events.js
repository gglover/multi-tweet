var exports = module.exports = api;
var twitter_api = require('./twitter_api')

function api(io) {

  // Elapsed seconds since the last set of votes was processed.
  var votingTime = 0;

  io.on('connection', function(socket){

      console.log('a user connected');
      emitCurrentState(socket);

      // Socket events
      socket.on('tweet-input', function(msg) {
          if (!validateInput(msg)) { return; }

          console.log('tweet-input: ' + msg + " from " + socket.conn.remoteAddress);
          
          DB.hmget('voting', msg, function(err, reply) {
            if (err != null) {
              console.warn('voting access error');
              return;
            } 
            var newCount = parseInt(reply[0]) || 1;
            DB.hmset('voting', msg, newCount + 1);
            io.emit('voting-updated', {letter: msg, count: newCount});
          });
      });

      socket.on('max-chars', function(msg) {
          alert('boo!');
          DB.set('tweet', '');
          io.emit('tweet-updated', '');
          twitter_api.post(translateTweet(msg));
          return;
      });
  });

  function emitCurrentState(socket) {
    DB.hgetall('voting', function(err, votes) {
      if (err != null) {
        console.warn('voting access error');
        return;
      }
      DB.get('tweet', function(err, tweet) {
        if (err != null) {
          console.warn('voting access error');
          return;
        }

        socket.emit('current-state', { voting:       votes, 
                                       time:         votingTime,
                                       tweet:        tweet,
                                       votingLength: CONFIG.votingLength
        });
      });
    });
  };

  function validateInput(msg) {
    var cs = CONFIG.charset;
    for (var i = 0; i < cs.length; i++) {
      var csRow = cs[i]; 
      for (var j = 0; j < csRow.length; j++) {
        if (msg == csRow[j].value) { return true; }
      }
    }
    return false;
  }

  function translateTweet(tweet) {
    var tokens = tweet.split(':');
    for (var i = 0; i < tokens.length; i++) {
      if (tokens[i].charAt(0) == '`') {
        tokens[i] = CONFIG.getEmojiUnicode(tokens[i]);
      }
    }
    return tokens.join('');
  }

  // Process voting results on interval
  setInterval(function() {
    
    votingTime += 1;

    if (votingTime > CONFIG.votingLength) {
      // We should really store this...
      DB.hgetall('voting', function(err, votes) {
        if (err != null) {
          console.warn('voting access error');
          return;
        }

        DB.get('tweet', function(err, tweet) {
          if (err != null) {
            console.warn('voting access error');
            return;
          }

          // Get character with the most votes
          var top = {value: '', votes: 0};
          for (input in votes) {
            if (votes[input] > top.votes) {
              top = {value: input, votes: votes[input]};
            } 
          }

          if (top.value == 'tweet') {
            DB.set('tweet', '');
            io.emit('tweet-updated', '');
            twitter_api.post(translateTweet(tweet));
            return;
          }

          // Update the tweet
          var newTweet = tweet + top.value;

          io.emit('tweet-updated', newTweet);
          DB.set('tweet', newTweet);

        });

        // Reset everything...
        DB.del('voting');
        DB.hmset('voting', {'' : 0});
      });

      votingTime = 0;
    }

  }, 1000);

};