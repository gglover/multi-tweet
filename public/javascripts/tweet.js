var SOCKET = io();

var MT_VIEW = {
  init: function() {
    MT_VIEW.bindEvents();
  },

  bindEvents: function() {
    $('#tweet').keyup(MT_VIEW.handleTweetInput);
  },

  handleTweetInput: function(evt) {
    var input = String.fromCharCode(evt.keyCode);
    SOCKET.emit('tweet-input', input);
  }
};

$(document).ready(MT_VIEW.init);