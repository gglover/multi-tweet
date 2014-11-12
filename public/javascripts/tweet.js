var SOCKET = io();

var MT_VIEW = {
  init: function() {
    MT_VIEW.bindEvents();
  },

  bindEvents: function() {
    $('.letter').click(MT_VIEW.handleTweetInput);
  },

  handleTweetInput: function(evt) {
    SOCKET.emit('tweet-input', evt.currentTarget.innerHTML);
  }
};

$(document).ready(MT_VIEW.init);