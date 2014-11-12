var 

exports = module.exports = api;

function api(io) {
  io.on('connection', function(socket){
      //debugger;

      console.log('a user connected');
      DB.get("user", function(err, reply) {
          // reply is null when the key is missing
          console.log(reply);
      });

      // Socket events
      socket.on('tweet-input', function(msg) {
          if (msg.length != 1) { return };
          console.log('tweet-input: ' + msg + " from " + socket.conn.remoteAddress);
          
          DB.get('tweet', function(err, reply) {
            if (err != null) {
              console.warn('tweet access error');
              return;
            } 

            var newMessage = reply + msg
            DB.set('tweet', reply + msg, DB.print);
            io.emit('tweet-updated', { tweet: newMessage, lastLetter: msg});
          });
      });
  });
}