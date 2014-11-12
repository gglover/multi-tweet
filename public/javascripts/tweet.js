var SOCKET = io();





var MT_VIEW = {
  init: function() {
    MT_VIEW.bindEvents();
  },

  bindEvents: function() {
    SOCKET.on('tweet-updated', MT_VIEW.handleTweetUpdate);
    SOCKET.on('voting-updated', MT_VIEW.handleVotingUpdate);
    $('.letter').click(MT_VIEW.handleTweetInput);
  },

  handleVotingUpdate: function(msg) {
    MT_MODEL.voting[msg.letter] = msg.count;
    MT_VIEW.renderVotingStats();
  },
  
  handleTweetUpdate: function(msg) {
    MT_MODEL.voting = {};
    $('#tweet-final').val(msg);
    MT_VIEW.renderVotingStats();
  },

  handleTweetInput: function(evt) {
    SOCKET.emit('tweet-input', evt.currentTarget.innerHTML);
  },

  renderVotingStats: function() {
    var top5 = MT_MODEL.top5();

    $('.voting-entry').each(function(idx, el) {
      var $entry = $(el);
      if (idx < top5.length){
        $entry.text(top5[idx][0] + " : " + top5[idx][1]);
      } else {
        $entry.text('');
      }
    });
  }
};





var MT_MODEL = {
  voting: {},
  top5: function() {
    var sorted = [];
    for (var letter in MT_MODEL.voting) {
      sorted.push([letter, MT_MODEL.voting[letter]])
      sorted.sort(function(a, b) {return a[1] - b[1]})
    }
    return sorted.reverse().slice(0, 5);
  }
};




$(document).ready(MT_VIEW.init);