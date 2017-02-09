const WebSocketServer = require('uws').Server
const Rx = require('rxjs/Rx')
const { MESSAGE_INTERVAL, messageTypes } = require('./constants')
const { createMessage, createPongMessage } = require('./messages')

const wss = new WebSocketServer({ port: 3000 })

const pongMessages$ = new Rx.Subject()

const broadcastMessages$ = Rx.Observable.interval(MESSAGE_INTERVAL)
      .map(createMessage)
      .merge(pongMessages$)
      .map(JSON.stringify)

broadcastMessages$.publish()
  .refCount()

function addNewConnection(ws) {
  console.log('Received a connection')
  console.log('Subscribed to message stream')
  const broadcastSubscription = broadcastMessages$.subscribe(ws.send.bind(ws))

  ws.on('message', (rawMsg) => {
    let msg
    try {
      msg = JSON.parse(rawMsg)
    } catch (err) {
      msg = { type: messageTypes.UNKNOWN }
    }

    switch (msg.type) {
    case messageTypes.PING:
      pongMessages$.next(createPongMessage())
      break
    default:
      break
    }
  })

  ws.on('close', (e) => {
    console.log('Closed connection', e)
    broadcastSubscription.unsubscribe()
  })
}

const connections$ = Rx.Observable.fromEvent(wss, 'connection')
      .do(addNewConnection)
      .subscribe()
