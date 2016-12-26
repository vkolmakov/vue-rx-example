var express = require('express')
var path = require('path')

var ROOT_DIR = path.resolve('.')

var app = express()
var port = process.env.PORT || 8000

app.use('/', express.static(ROOT_DIR))
app.get('/', (req, res) => res.sendFile(path.join(ROOT_DIR, 'index.html')))

app.listen(port, () => console.log('started on ' + port))
