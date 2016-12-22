const WebSocketServer = require('uws').Server
const Rx = require('rxjs/Rx')
const _ = require('lodash')
const data = require('./data')

const wss = new WebSocketServer({ port: 3000 })
const MESSAGE_INTERVAL = 3000
const messageTypes = {
  UNKNOWN: 'UNKNOWN',
  PICTURE: 'PICTURE',
  PING: 'PING'
}

function createMessage() {
  const payload = data[_.random(data.length - 1)]
  return {
    type: messageTypes.PICTURE,
    payload,
  }
}

function addNewConnection(ws) {
  console.log('Received a connection')

  console.log('Subscribed to message stream')
  broadcastMessages$.subscribe(msg => ws.send(msg))

  ws.on('message', function handleMessage (rawMsg) {
    let msg
    try {
      msg = JSON.parse(rawMsg)
    } catch (err) {
      msg = { type: messageTypes.UNKNOWN }
    }

    switch (msg.type) {
    case messageTypes.PING:
      ws.send(JSON.stringify({ type: 'PONG' }))
      break
    default:
      break
    }
  })

  ws.on('close', function (e) {
    console.log('Closed connection', e)
  })
}

const broadcastMessages$ = Rx.Observable.interval(MESSAGE_INTERVAL)
      .map(_ => createMessage())
      .map(msg => JSON.stringify(msg))
      .publish()

broadcastMessages$.connect()

const connections$ = Rx.Observable.fromEvent(wss, 'connection')
      .do(ws => addNewConnection(ws))
      .subscribe()
