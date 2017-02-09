<template>
  <div id="app">
    <h1>cute every {{ rate / 1000}}s</h1>
    <input type="range" v-model="rate" min="100" max="5000" step="100" />
    <div class="pictures">
      <img v-for="pic in pictures$" :alt="pic.title" :src="pic.link"/>
    </div>
  </div>
</template>

<script>
import Rx from 'rxjs/Rx'

const socket = new WebSocket('ws://localhost:3000')


export default {
  name: 'app',
  data () {
    return {
      rate: 1000
    }
  },

  subscriptions () {
    const messages$ = Rx.Observable.fromEvent(socket, 'message')
                        .map(e => JSON.parse(e.data))
                        .take(2)

    const rates$ = this.$watchAsObservable('rate')
                       .map(({ newValue }) => newValue)
                       .startWith(this.rate)

    const ticks$ = rates$
      .switchMap(rate => Rx.Observable.interval(rate))

    const pictures$ = messages$
      .zip(ticks$, (msg, _) => msg)
      .map(msg => msg.payload)
      .scan((acc, msg) => [msg, ...acc], [])

    return {
      pictures$,
      rates$
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

.pictures {
  display: flex;
  flex-flow: row wrap;
}

.pictures > img {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

</style>
