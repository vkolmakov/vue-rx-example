const data = require('./data')
const { messageTypes } = require('./constants')
const { random } = require('./util')

function createMessage() {
  return {
    type: messageTypes.PICTURE,
    payload: data[random(data.length - 1)],
  }
}

function createPongMessage() {
  return {
    type: messageTypes.PONG,
    payload: {
      title: 'PONG CAT!',
      link: 'https://media.giphy.com/media/4IAzyrhy9rkis/giphy.gif',
    },
  }
}

module.exports = {
  createMessage,
  createPongMessage,
}
