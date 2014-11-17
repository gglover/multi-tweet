var SOCKET = io();





var MT_VIEW = {
  init: function(data) {
    MT_VIEW.bindEvents();

    MT_MODEL.setVoting(data.voting);

    // Start up the timer
    MT_TIMER.start(data.time, data.votingLength);

    // This is a shitty way to do this
    MT_VIEW.renderTweet(data.tweet);
  },

  bindEvents: function() {
    SOCKET.on('tweet-updated', MT_VIEW.handleTweetUpdate);
    SOCKET.on('voting-updated', MT_VIEW.handleVotingUpdate);

    $(document).on('update-voting', MT_VIEW.renderVotingStats);
    $('.letter').click(MT_VIEW.handleTweetInput);
    $(document).keypress(MT_VIEW.handleTweetInputFromKeyboard);
  },

  handleTweetInputFromKeyboard: function(evt) {
    var chr = String.fromCharCode(evt.keyCode);
    SOCKET.emit('tweet-input', chr);
  },

  handleVotingUpdate: function(msg) {
    MT_MODEL.updateVoteCount(msg.letter, msg.count);
  },
  
  handleTweetUpdate: function(msg) {
    MT_MODEL.clearVoting();
    MT_TIMER.reset();
    MT_VIEW.renderTweet(msg);
  },

  handleTweetInput: function(evt) {
    var chosen = evt.currentTarget.innerHTML;
    if (chosen == 'tweet!') {
      // post to twitter!
    } else {
      if (chosen == '(space)') {
        chosen = ' ';
      }
      SOCKET.emit('tweet-input', chosen);
    }
  },

  renderTweet: function(tweet) {
    $('#tweet-final').val(tweet);
  },
 
  renderVotingStats: function() {
    var top5 = MT_MODEL.top5();
    if (top5.length > 0) {
      var highestVotes = top5[0][1];
    }

    $('.voting-entry').each(function(idx, el) {
      var $btn = $(el).find('button');
      var $bar = $(el).find('.voting-bar');

      if (idx < top5.length){
        $btn.text(top5[idx][0]);
        $bar.css({ 'width': 90 * (top5[idx][1] / highestVotes) + '%'});

      } else {
        $btn.text('');
        $bar.css({ 'width': 0});

      }
    });
  }
};

var MT_TIMER = {
  votingLength: 0,
  time: 0,
  interval: 0,

  start: function(initialTime, votingLength) {
    MT_TIMER.votingLength = votingLength;
    MT_TIMER.time = initialTime;
    MT_TIMER.interval = setInterval(MT_TIMER.increaseTime, 1000);
  },

  reset: function() {
    clearInterval(MT_TIMER.interval);
    MT_TIMER.time = 0;
    MT_TIMER.interval = setInterval(MT_TIMER.increaseTime, 1000);
  },

  increaseTime: function() {
    MT_TIMER.time++;
    $('#timer').text(MT_TIMER.votingLength - MT_TIMER.time);
  }
}




var MT_MODEL = {
  voting: {},

  clearVoting: function() {
    MT_MODEL.setVoting({});
  },

  setVoting: function(stats) {
    MT_MODEL.voting = stats;
    $(document).trigger('update-voting');
  },

  updateVoteCount: function(letter, count) {
    MT_MODEL.voting[letter] = count;
    $(document).trigger('update-voting');
  },

  top5: function() {
    var sorted = [];
    for (var letter in MT_MODEL.voting) {
      sorted.push([letter, MT_MODEL.voting[letter]])
      sorted.sort(function(a, b) {return a[1] - b[1]})
    }
    return sorted.reverse().slice(0, 5);
  }
};




$(document).ready( function() {
  SOCKET.on('current-state', function(data) {
    MT_VIEW.init(data);
  })
});


