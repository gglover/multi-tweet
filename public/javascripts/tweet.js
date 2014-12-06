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
    MT_VIEW.setUserCount(data.users);
  },

  bindEvents: function() {
    SOCKET.on('tweet-updated', MT_VIEW.handleTweetUpdate);
    SOCKET.on('voting-updated', MT_VIEW.handleVotingUpdate);
    SOCKET.on('user-count', MT_VIEW.handleUserCountUpdate);

    $(document).on('update-voting', MT_VIEW.renderVotingStats);
    $('.letter').click(MT_VIEW.handleTweetInput);
    $(document).keypress(MT_VIEW.handleTweetInputFromKeyboard);
  },

  handleUserCountUpdate: function(msg) {
    MT_VIEW.setUserCount(msg.count);
  },

  handleTweetInputFromKeyboard: function(evt) {
    // Have to do this for space bar triggering two votes
    document.activeElement.blur();

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
    var numLeft = 140 - MT_MODEL.charCount();
    $charsLeft.text(numLeft);
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

        // Space bar escape clause
        if (top5[idx][0] == ' ') {
          $newKey = null;
        }

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
    // We want custom text if they're about to tweet
    if (tweet.lastIndexOf('tweet') == Math.abs(tweet.length - 5)) {
      return "Tweet!";
    }
    var tokens = tweet.split(' ');
    for (var i = 0; i < tokens.length; i++) {
      tokens[i] = MT_VIEW.templateWord(tokens[i]);
    }
    return tokens.join(' ');
  },

  templateWord: function(word) {
    var emojiTokens = word.split(':');
    var containsEmoji = false;
    for (var i = 0; i < emojiTokens.length; i++) {
      if (emojiTokens[i].charAt(0) == '`') {
        containsEmoji = true;
        emojiTokens[i] = '<img class="emoji" src="' + emojiTokens[i].substr(1, emojiTokens[i].length) + '.png"' + '/>';
      }
    }
    word = emojiTokens.join('');

    var firstChar = word.charAt(0);
    var templatedOutput = '';
    if (firstChar == '#' && !containsEmoji) {
        templatedOutput =  '<a href="https://twitter.com/hashtag/' + word.substr(1, word.length) + '" class="hashtag">';
        templatedOutput += word + '</a>';
    } else if (firstChar == '@' && !containsEmoji) {
        templatedOutput =  '<a href="https://twitter.com/' + word.substr(1, word.length) + '" class="handle">';
        templatedOutput += word + '</a>';
    } else {
        templatedOutput = word;
    }
    return templatedOutput;
  },

  setUserCount: function(count) {
    $('title').text('multi-tweet (' + count + ')');
    count -= 1;
    var text = "there " + (count == 1 ? 'is 1 person' : ('are ' + count + ' people')) + ' tweeting with you!';

    $('#users-connected').text(text);
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
