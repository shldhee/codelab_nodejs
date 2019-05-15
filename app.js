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

debug('app is initiated')
module.exports = app;