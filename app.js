// const http = require('http');

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('Hello, World!\n');
// });

// module.exports = server

const App = require('./src/Application');
const app = App();
const debug = require('./utils/debug')('app')
const serveStatic = require('./middlewares/serve-static')
const path = require('path')
const fs = require('fs')

const index = (req, res, next) => {
    const publicPath = path.join(__dirname, './public')

    fs.readFile(`${publicPath}/index.html`, (err, data) => {
        if (err) throw err

        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html')
        res.end(data)
    })
}

const error404 = (req, res, next) => {
    res.statusCode = 404
    res.end('Not Found')
}

const error = (err, req, res, next) => {
    res.statusCode = 500
    res.end()
}

app.use(serveStatic())
app.use(index)
app.use(error404)
app.use(error)


debug('app is initiated')
module.exports = app;