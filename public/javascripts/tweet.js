var SOCKET = io();

var MT_VIEW = {
  init: function() {
    MT_VIEW.bindEvents();
  },

  bindEvents: function() {
    SOCKET.on('tweet-updated', MT_VIEW.handleTweetUpdate);
    $('.letter').click(MT_VIEW.handleTweetInput);
  },
  
  handleTweetUpdate: function(msg) {
    $('#tweet-final').val(msg.tweet);
  },

  handleTweetInput: function(evt) {
    SOCKET.emit('tweet-input', evt.currentTarget.innerHTML);
  }
};

$(document).ready(MT_VIEW.init);