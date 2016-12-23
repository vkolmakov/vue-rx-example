const WebSocketServer = require('uws').Server
const Rx = require('rxjs/Rx')
const _ = require('lodash')
const data = require('./data')

const wss = new WebSocketServer({ port: 3000 })
const MESSAGE_INTERVAL = 2000
const messageTypes = {
  UNKNOWN: 'UNKNOWN',
  PICTURE: 'PICTURE',
  PING: 'PING',
  PONG: 'PONG',
}

function createMessage() {
  return {
    type: messageTypes.PICTURE,
    payload: data[_.random(data.length - 1)],
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

function addNewConnection(ws) {
  console.log('Received a connection')

  console.log('Subscribed to message stream')
  const broadcastSubscription = broadcastMessages$.subscribe(msg => ws.send(msg))

  ws.on('message', function handleMessage (rawMsg) {
    let msg
    try {
      msg = JSON.parse(rawMsg)
    } catch (err) {
      msg = { type: messageTypes.UNKNOWN }
    }

    switch (msg.type) {
    case messageTypes.PING:
      ws.send(JSON.stringify(createPongMessage()))
      break
    default:
      break
    }
  })

  ws.on('close', function (e) {
    console.log('Closed connection', e)
    broadcastSubscription.unsubscribe()
  })
}

const broadcastMessages$ = Rx.Observable.interval(MESSAGE_INTERVAL)
      .map(_ => createMessage())
      .map(msg => JSON.stringify(msg))
      .publish()
      .refCount()

const connections$ = Rx.Observable.fromEvent(wss, 'connection')
      .do(ws => addNewConnection(ws))
      .subscribe()
