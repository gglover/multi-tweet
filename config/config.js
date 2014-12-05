module.exports = {
  // Place app constants here
  charset: [ [{value: '*'}, {value: '~'}, {value: '!'}, {value: '1'}, {value: '2'}, {value: '3'}, {value: '4'}, {value: '5'}, {value: '6'}, {value: '7'}, 
              {value: '8'}, {value: '9'}, {value: '0'}, {value: '*'}, {value: '*'}, {value: '-'}, {value: ','}, {value: '.'}, {value: '?'}, {value: '$'}], 
             [{value: 'Q'}, {value: 'q'}, {value: 'W'}, {value: 'w'}, {value: 'E'}, {value: 'e'}, {value: 'R'}, {value: 'r'}, {value: 'T'}, {value: 't'}, 
              {value: 'Y'}, {value: 'y'}, {value: 'U'}, {value: 'u'}, {value: 'I'}, {value: 'i'}, {value: 'O'}, {value: 'o'}, {value: 'P'}, {value: 'p'}], 
             [{value: 'A'}, {value: 'a'}, {value: 'S'}, {value: 's'}, {value: 'D'}, {value: 'd'}, {value: 'F'}, {value: 'f'}, {value: 'G'}, {value: 'g'}, 
              {value: 'H'}, {value: 'h'}, {value: 'J'}, {value: 'j'}, {value: 'K'}, {value: 'k'}, {value: 'L'}, {value: 'l'}, {value: ':`poo:', text: 'poo.png'}, {value: ':`leaf:', text: 'leaf.png'}], 
             [{value: 'Z'}, {value: 'z'}, {value: 'X'}, {value: 'x'}, {value: 'C'}, {value: 'c'}, {value: 'V'}, {value: 'v'}, {value: 'B'}, {value: 'b'},
              {value: 'N'}, {value: 'n'}, {value: 'M'}, {value: 'm'}, {value: ':`woman:', text: 'woman.png'}, {value: ':`bamboo:', text: 'bamboo.png'}, {value: ':`kiss:', text: 'kiss.png'}, {value: ':`moon:', text: 'moon.png'}, {value: ':`crying:', text: 'crying.png'}, {value: ':`wine:', text: 'wine.png'}],
             [{value: 'tweet', text: 'tweet.png' }, {value: '#'}, {value: '@'}, {value: ' ', text: '( space )'}, {value: ':`computer:', text: 'computer.png'}, {value: ':`floppy:', text: 'floppy.png'}, {value: ':`lady:', text: 'lady.png'}, {value: ':`bird:', text: 'bird.png'}, {value: ':`eggplant:', text: 'eggplant.png'}, {value: ':`angry:', text: 'angry.png'}]
           ],
  votingLength: 10,  // seconds
  emojiMapping: {
    poo:     '💩',
    leaf:    '🍃', 
    woman:   '👵', 
    bamboo:  '🎋', 
    kiss:    '💋', 
    moon:    '🌚', 
    crying:  '😭', 
    wine:    '🍷', 
    computer:'💻', 
    floppy:  '💾', 
    lady:    '💁', 
    bird:    '🐣', 
    eggplant:'🍆', 
    angry:   '😡'
  },

  getEmojiUnicode: function(emoji) {
    return this.emojiMapping[emoji.replace(/[:`]/g, '')] || '';
  }
}