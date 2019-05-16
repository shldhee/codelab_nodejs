const debug = require('./utils/debug')('app')
const serveStatic = require('./middlewares/serve-static')
const logger =require('./middlewares/logger')
const index = require('./routes')
const errors = require('./middlewares/errors')
const App = require('./src/Application');
const apiPost = require('./routes/api/posts')
const app = App();

app.use(logger())
app.use(serveStatic())
app.use('/',index.listPosts())
app.use('/api/posts', apiPost.index())
app.use(errors.error404())
app.use(errors.error())

debug('app is initiated')
module.exports = app;