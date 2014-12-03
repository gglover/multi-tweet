var SOCKET = io();




var MT_VIEW = {
  init: function(data) {
    MT_VIEW.bindEvents();

    MT_MODEL.setVoting(data.voting);

    // Start up the timer
    MT_TIMER.start(data.time, data.votingLength);

    // This is a shitty way to do this
    MT_MODEL.tweet = data.tweet;
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
    var $key = $('.letter[data-value="'+ msg.letter + '"]');

    // Flash to indicate vote
    $key.addClass('flash');
    setTimeout(function() {
      $key.removeClass('flash');
    }, 100);
    MT_MODEL.updateVoteCount(msg.letter, msg.count);
  },
  
  handleTweetUpdate: function(msg) {
    MT_MODEL.clearVoting();
    MT_MODEL.tweet = msg;
    MT_TIMER.reset();
    MT_VIEW.renderTweet(msg);
  },

  handleTweetInput: function(evt) {
    var chosen = $(evt.currentTarget).data('value');
    SOCKET.emit('tweet-input', chosen);
  },

  renderTweet: function(tweet) {
    var $tweet = $('#tweet-final');
    $tweet.text('');
    var templated = MT_VIEW.templateTweet(tweet);
    $tweet.append(templated);

    var $charsLeft = $('#chars-left');
    var $numLeft = 140 - MT_MODEL.charCount();
    $charsLeft.text($numLeft);
    if ($numLeft == 0) {
      SOCKET.emit('max-chars', $tweet.text());
      $charsLeft.text('140');
    }
  },
 
  renderVotingStats: function() {
    var top5 = MT_MODEL.top5();
    if (top5.length > 0) {
      var highestVotes = top5[0][1];
    }

    var currTweet = MT_MODEL.tweet;
    currTweet = currTweet.split(' ');
    currTweet = currTweet[currTweet.length - 1];

    $('.voting-entry').each(function(idx, el) {
      var $key = $(el).find('button')
       ,  $bar = $(el).find('.voting-bar')
       ,  $barText = $(el).find('.bar-text');

      if (idx < top5.length && top5[idx][0] != ''){
        var $newKey = $('.letter[data-value="' + top5[idx][0] + '"]').html();
        $key.html($newKey);
        $bar.css({ 'width': 90 * (top5[idx][1] / highestVotes) + '%'});
        $barText.html(MT_VIEW.templateTweet(currTweet + top5[idx][0]));
      

      } else {
        $key.text('--');
        $bar.css({ 'width': 0});
        $barText.text('');
      }
    });
  },

  templateTweet: function(tweet) {
    var tokens = tweet.split(' ');
    for (var i = 0; i < tokens.length; i++) {
      tokens[i] = MT_VIEW.templateWord(tokens[i]);
    }
    return tokens.join(' ');
  },

  templateWord: function(word) {
    // Convert emoji
    //word.matchAll(/:[^:]{3,8}:/g, function(res) {
    var emojiTokens = word.split(':');
    for (var i = 0; i < emojiTokens.length; i++) {
      if (emojiTokens[i].charAt(0) == '`') {
        emojiTokens[i] = '<img class="emoji" src="' + emojiTokens[i].substr(1, emojiTokens[i].length) + '.png"' + '/>';
      }
    }
    word = emojiTokens.join('');

    var firstChar = word.charAt(0);
    var templatedOutput = '';
    if (firstChar == '#') {
        templatedOutput =  '<a href="https://twitter.com/hashtag/' + word.substr(1, word.length) + '" class="hashtag">';
        templatedOutput += word + '</a>';
    } else if (firstChar == '@') {
        templatedOutput =  '<a href="https://twitter.com/' + word.substr(1, word.length) + '" class="handle">';
        templatedOutput += word + '</a>';
    } else if (firstChar == ':') {
        var emoji = word.replace(/:/g, '');
        templatedOutput = '<img class="emoji" src="' + emoji + '.png"' + '/>';
    } else {
        templatedOutput = word;
    }
    return templatedOutput;
  }
};

var MT_TIMER = {
  votingLength: 0,
  time: 0,
  interval: 0,

  start: function(initialTime, votingLength) {
    clearInterval(MT_TIMER.interval);
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
    var timeLeft = Math.max(MT_TIMER.votingLength - MT_TIMER.time, 0);
    $('#timer').text('00:' + (timeLeft < 10 ? '0' : '') + timeLeft);
    if (timeLeft < 6) {
      $('#timer').css({ 'color': '#ff4d4d'});
      $('#timer').css({ 'font-weight': 'bold'});
    } else {
      $('#timer').css({ 'color': 'black'});
      $('#timer').css({ 'font-weight': 'normal'});
    }
  }
}




var MT_MODEL = {
  tweet: '',
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
      sorted.sort(function(a, b) {return b[1] - a[1]})
    }
    return sorted.slice(0, 5);
  },

  charCount: function() {
    var currTweet = MT_MODEL.tweet;
    var numChars = 0;
    for (var i = 0; i < currTweet.length; i++) {
      if (currTweet[i] == ':') {
        i = currTweet.indexOf(':', i + 1);
      }
      numChars++;
    }
    return numChars;
  }
};




$(document).ready( function() {
  SOCKET.on('current-state', function(data) {
    MT_VIEW.init(data);
  })
});
