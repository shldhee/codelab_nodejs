const debug = require('./utils/debug')('app')
const serveStatic = require('./middlewares/serve-static')
const logger =require('./middlewares/logger')
const index = require('./routes')
const errors = require('./middlewares/errors')
const App = require('./src/Application');
const apiPost = require('./routes/api/posts')
const bodyParser = require('./middlewares/body-parser')
const app = App();

app.use(logger())
app.use(bodyParser())
app.use(serveStatic())
app.use('/',index.listPosts())
// app.use('/api/posts', apiPost.index())
app.get('/api/posts', apiPost.index()) // use() 였던 것을 get() 으로 명확히 등록
app.post('/api/posts', apiPost.create()); // post()로 등록
app.use(errors.error404());
app.use(errors.error404())
app.use(errors.error())

debug('app is initiated')
module.exports = app;