const WebSocketServer = require('uws').Server
const Rx = require('rxjs/Rx')
const _ = require('lodash')
const data = require('./data')

const wss = new WebSocketServer({ port: 3000 })

const MESSAGE_INTERVAL = 300

const messageTypes = {
  UNKNOWN: 'UNKNOWN',
  PICTURE: 'PICTURE',
  PING: 'PING'
}

function createMessage() {
  const payload = data[_.random(data.length - 1)]
  console.log(payload)
  return {
    type: messageTypes.PICTURE,
    payload,
  }
}

function addNewConnection(ws) {
  console.log('Received a Connection')

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
    console.log('closed', e)
  })

  const output$ = Rx.Observable.zip(
    Rx.Observable.of(ws).delay(0).repeat(),            // delays are added
    Rx.Observable.interval(MESSAGE_INTERVAL).delay(0), // to make both observables lazy
    function combineObservables(ws, interval) {
      return [ws, interval]
    }
  )

  return output$
}

const connections$ = Rx.Observable.fromEvent(wss, 'connection')
      .flatMap(ws => addNewConnection(ws))
      .map(([ws, interval]) => [ws, createMessage(interval)])
      .do(([ws, message]) => ws.send(JSON.stringify(message)))
      .subscribe()
