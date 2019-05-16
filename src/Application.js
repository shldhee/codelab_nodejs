const http = require('http')
const debug = require('../utils/debug')('Application')
const Middleware = require('./Middleware');
const Response = require('./Response')

const Application = () => {
  const _middleware = Middleware();
  const _server = http.createServer((req, res) => {
    _middleware.run(req, Response(res))
  });

  const use = (path, fn) => {
    if (typeof path ==='string' && typeof fn === 'function') {
      fn._path = path;
    } else if (typeof path ==="function") {
      fn = path;
    } else {
      throw Error('Usage : use(path, fn) or use(fn)');
    }
    _middleware.add(fn)
  };

  const listen = (port = 3000, hostname = '127.0.0.1', fn) => {
    _server.listen(port, hostname, fn)
    debug('server is listening')
  }

  return {
    _middleware,
    _server,
    use,
    listen
  }
}

module.exports = Application