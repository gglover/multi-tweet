exports = module.exports = api;

function api(io) {
  io.on('connection', function(socket){
      DB.set("user", "hello", REDIS.print);
      console.log('a user connected');
      DB.get("user", function(err, reply) {
          // reply is null when the key is missing
          console.log(reply);
      });

      // Socket events
      socket.on('tweet-input', function(msg) {
          console.log('tweet-input:' + msg);
      });
  });
}