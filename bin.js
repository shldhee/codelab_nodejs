const app  = require('./app');
const hostname = '127.0.0.1'
const port = 3000
const debug = require('./utils/debug')('bin')

app.listen(port, hostname, () => {
    debug(`Server running at http://${hostname}:${port}/`);
  });