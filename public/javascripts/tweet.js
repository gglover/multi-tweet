var SOCKET = io();

var MT_VIEW = {
  init: function() {
    MT_VIEW.bindEvents();
  },

  bindEvents: function() {
    $('#tweet').keyup(MT_VIEW.handleTweetInput);
    SOCKET.on('tweet-updated', MT_VIEW.handleTweetUpdate);
  },

  handleTweetInput: function(evt) {
    var input = String.fromCharCode(evt.keyCode);
    SOCKET.emit('tweet-input', input);
  },

  handleTweetUpdate: function(msg) {
    $('#tweet-final').val(msg.tweet);
  }
};

$(document).ready(MT_VIEW.init);