var 

exports = module.exports = api;

function api(io) {

  io.on('connection', function(socket){

      console.log('a user connected');

      // Socket events
      socket.on('tweet-input', function(msg) {
          if (msg.length != 1) { return };
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
  });

  // Process voting results on interval
  setInterval(function() {
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
        var top = {char: '', votes: 0};
        for (input in votes) {
          if (votes[input] > top.votes) {
            top = {char: input, votes: votes[input]};
          } 
        }

        // Update the tweet
        var newTweet = tweet + top.char;

        console.log(newTweet);

        io.emit('tweet-updated', newTweet);
        DB.set('tweet', newTweet);

        // Reset everything...
        DB.del('voting');
        DB.hmset('voting', {a: 0});
      });
    });

  }, CONFIG.votingLength);

};