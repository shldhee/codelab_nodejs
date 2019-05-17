

http://jeonghwan-kim.github.io/series/2018/12/01/node-web-0_index.html

따라하기 및 복습

## 1강

``` js
// package.json

// "test": "mocha server.spec.js"
// "test": "mocha './src/**/*.spec.js*'"
"test": "mocha $(find ./ -name \"*.spec.js\")"
```

- `spec.js`로 끝나는 모든 파일 테스트(mocha)로 실행


``` js
// server.spec.js
const should = require('should')
const server = require('./server')

describe('server test suite', () => {
    it('should return "hellow wolrd"', () => {
        server().should.be.equal('Hello World')
    })
})

// server.js
const server = () => "Hello World"

module.exports = server
```

- `npm test` 
- 테스트 정상적으로 작동되나 아래 메시지 출력
- Warning: Cannot find any files matching pattern "$(find"
- 윈도우에서 발생

## 2강

```js
const http = require('http'); // 노드 모듈을 가져온다 

const hostname = '127.0.0.1'; // 사용할 서버 호스트네임
const port = 3000; // 사용할 서버 포트

// 서버를 만든다 
const server = http.createServer((req, res) => { // 요청이 오면 실행되는 콜백 함수
  res.statusCode = 200; // 응답 상태값 설정
  res.setHeader('Content-Type', 'text/plain'); // 응답 헤더 중 Content-Type 설정
  res.end('Hello, World!\n'); // 응답 데이터 전송 
});

// 서버를 요청 대기 상태로 만든다 
server.listen(port, hostname, () => { // 요청 대기가 완료되면 실행되는 콜백 함수 
  // 터미널에 로그를 기록한다 
  console.log(`Server running at http://${hostname}:${port}/`);
});
```

- http 기본 모듈
    - http.createServer(): 서버 인스턴스를 만들어 반환
    - http.server: 서버 클래스
    - server.listen(): 서버를 클라이언트 요청 대기 상태(listen)로 만듬

```js
node server.js
curl localhost:3000 // 서버 요청하기(응답 확인 가능)
curl locahlost:3000 -v // http 헤더까지 확인 가능

> GET / HTTP/1.1
> Host: localhost:3000
> User-Agent: curl/7.59.0
> Accept: *
>
* STATE: DO => DO_DONE handle 0x67e150; line 1670 (connection #0)
* STATE: DO_DONE => WAITPERFORM handle 0x67e150; line 1795 (connection #0)
* STATE: WAITPERFORM => PERFORM handle 0x67e150; line 1811 (connection #0)
* HTTP 1.1 or later with persistent connection, pipelining supported
< HTTP/1.1 200 OK
< Content-Type: text/plain
< Date: Wed, 15 May 2019 02:40:50 GMT
< Connection: keep-alive
< Content-Length: 14

> 요청 정보
< 응답 정보 : 200 상태코드, text/plain 
```

## 3강

- 리팩토링
- server.js는 2가지 일을 한다.
    - server 생성(`createServer()`) // server.js
    - server 구동(`listen()`) // bin.js

    
``` js
// server.js
const http = require('http');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
});

module.exports = server

// bin.js
const server  = require('./server');
const hostname = '127.0.0.1'
const port = 3000

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
```

- `npm test`하면 오류남
```js
  server test suite
    1) should return "hello world"


  0 passing (16ms)
  1 failing

  1) server test suite
       should return "hello world":
     TypeError: server is not a function
      at Context.it (server.spec.js:6:5)



npm ERR! Test failed.  See above for more details.
```

## 4강

``` js
const should = require('should');
const sinon = require('sinon');

const App = require('./Application');

// Application 모듈의 listen() 메소드를 테스트, 이 메소드는 server객체 의 listen함수를 실행한다.
describe('Application', () => {
    describe('listen()', () => {
        it('server 객체의 listen 함수를 실행한다', () => {
            // arrange
            const app = App();
            const spy = sinon.spy();
            app._server.listen = spy // listen 함수가 호출되었는지 spy로 확인

            // act 테스트할 함수 실행
            app.listen()

            // assert
            should(spy.called).be.equal(true) // spy를 통해 listen함수가 호출되었는지 확인하는 곳
        })
    })
})
```

- `mocha`
  - `describe()` : 테스트 꾸러미(Test suite)라고 하며 테스트 환경을 기술함
  - `it()` : 테스트 케이스(Test case)라고 하며 단위 테스트를 정의함

- 유닛테스트는 보통 3단계로 나뉜다.
  - 준비(arrange) -> 실행(act) -> 검증(assert)


``` js
const http = require('http')

const Application = () => {
  const _server = http.createServer((req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end('Hello World\n')
  });

  const listen = (port = 3000, hostname = '127.0.0.1', fn) => {
    _server.listen(port, hostname, fn)
  }

  return {
    _server,
    listen
  }
}

module.exports = Application
```

- `http모듈`가져오고, 자바스크립트의 모듈 패턴으로 구현
  - 모듈패턴은 자바스크립트 객체를 반환(listen,_server)하여 외부에서 사용 가능
- 테스트 코드 보면 `_server`객체를 통해 스파이를 심었다. 테스트용이라 (`_`) 사용
- `_server`객체를 통해 `listen`함수 코드를 만들었다. 포트번호, 호스트명 기본 인자값을 설정해 방어코드, 테스트 코드에서 `listen`함수 호출 여부를 체크(`app.listen()`)하므로 `_server.listen()`을 호출

```js
// app.js
const App = require('./src/Application');
const app = App();

module.exports = app;
```

- `server.js` -> `app.js`로 변경

```js
// bin.js
const app  = require('./app');
const hostname = '127.0.0.1';
const port = 3000;

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```

- `server`대신 `app`으로 변경
- **http를 직접 사용하지 않고 Application 객체로 추상화 하였습니다.**

## 5강

### debug 모듈 만들기

- debug 장점
  - 태그를 지정한 로그 함수를 만들 수 있다.
  - 태그별로 색상을 줘서 로그 식별이 수월하다.
  - 아직 잘 모르겠다....

```js
const debug = require('debug')('my_tag')
debug('my_log') // "my_tag my_log"
```

### 테스트 코드 만들기

``` js
// debug.spec.js
// 필요한 모듈 상수 할당
require('should'); // 왜이렇게 하는지? 작동은 잘됨
const sinon = require('sinon');
const debug = require('./debug');

describe('debug', () => { // debug라는 환경 안에 생성이라는 환경에서 테스트
    describe('생성', () => { // debug > 생성 > it 내용들 같음 진짜 테스트
        it('태그명을 인자로 받는다 (없으면 예외를 던진다)', () => {
            should(()=> debug()).throw();
        })

        it('함수를 반환한다', () => {
            const debug = require('./debug')('mytag');
            should(typeof debug).equal('function');
        })
    })

    describe('반환된 함수', () => {
        let debug, tag, msg;

        beforeEach(() => {
            tag = 'mytag';
            debug = require('./debug')(tag);
            msg = 'my log message';
        })

        it('tag + message 형식의 로그 문자열을 반환한다', () => {
            const expected = `${tag} ${msg}`;
            const actual = debug(msg);
            actual.should.be.equal(expected);
        })

        it('로그 문자열을 인자로 console.log 함수를 실행한다.', () => {
            sinon.spy(console, 'log');
            const expected = `${tag} ${msg}`;

            debug(msg);

            sinon.assert.calledWith(console.log, expected);
        })
    })
});
```

``` js
const colors = [{
        name: 'cyan',
        value: '\x1b[36m'
    },
    {
        name: 'yellow',
        value: '\x1b[33m'
    },
    {
        name: 'red',
        value: '\x1b[31m'
    },
    {
        name: 'green',
        value: '\x1b[32m'
    },
    {
        name: 'magenta',
        value: '\x1b[35m'
    },
]
const resetColor = '\x1b[0m'

const debug = tag => {
    const randIdx = Math.floor(Math.random() * colors.length) % colors.length
    const color = colors[randIdx]
    if (!tag) throw Error('tag should be required'); // 생성

    return msg => { // 반환된 함수
        const logString = `${color.value}[${tag}]${resetColor} ${msg}`;
        console.log(logString);
        return logString;
    }
}

module.exports = debug;

const debug = require('./utils/debug')('app')
// 여기서 debug 함수에 첫번째 인자 tag가 'app'이 되고 함수가 return 될때 첫 인자가 2번재 인자가 된다. msg인자가 'log메세지'
```

### Debug 활용 color

``` js
//debug.js
const colors = [
  {name: 'cyan',     value: '\x1b[36m'},
  {name: 'yellow',   value: '\x1b[33m'},
  {name: 'red',      value: '\x1b[31m'},
  {name: 'green',    value: '\x1b[32m'},
  {name: 'magenta',  value: '\x1b[35m'},
]
const resetColor = '\x1b[0m'

const debug = tag => {
  const randIdx = Math.floor(Math.random() * colors.length) % colors.length
  const color = colors[randIdx]

    return msg => {
    const logString = `${color.value}[${tag}]${resetColor} ${msg}`;
    console.log(logString);
    return logString;
  }
```

- `console.log('\x1b[36m%s\x1b[0m', 'I am cyan')`
- 문자코드 + 문자 + 리셋코드
- 위와 같이 console 색상 변경 가능
- https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color


- 현재 app.js에서 Application(서버 express), debug(debug모듈)을 불러오고
- bin.js에서 실행하고 있다.

# 6장

### 정적 파일

- 서버 자원(리소스)중에서 브라우져에 다운로드 하여 화면을 그리는 파일을 정적파일이라고 한다.

```js
public
├── css
│   └── style.css
├── imgs
│   └── twitter.png
├── index.html
└── js
    └── script.js
```

```js
const path = require('path')
const fs = require('fs')

const Application = () => {
  const server = http.createServer((req, res) => {
    // ...

    const filePath = path.join(__dirname, '../public/index.html') // 모든 요청에 대해 index.html으로만 응답중
    fs.readFile(filePath, (err, data) => {
      if (err) throw err
      
      res.end(data)
    })
  });
}
```

- `path, fs` 모듈 호출
- `path.join`을 사용해 현재경로(`__dirname`)과 상대경로(`../public/index.html`) 위치 계산하여 `index.html`로 저장
- `fs`모듈은 `readFie`함수로 경로의 파일을 읽는다. 에러체크 후 정상이면 `data`에 파일 내용이 문자열로 들어온다.
- `res.end(data)` 함수로 파일 내용을 응답해준다.
- 이렇게 하면 그냥 마크업이 출력된다. 왜냐하면 `http 헤더값인 res.setHeader('Content-Type', 'text/html')으로 설정한다.
- 정상적으로 나오나 `css,js 등` 다른 정적파일을 보니 `index.html`파일의 내용을 똑같이 응답받는다. 
- 모든 요청에 대해 index.html으로만 응답중

``` js
 const mimeType = {
      '.ico': 'image/x-icon',
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.eot': 'appliaction/vnd.ms-fontobject',
      '.ttf': 'aplication/font-sfnt'
    }

    const ext = path.parse(req.url).ext;
    const publicPath = path.join(__dirname, '../public')

    console.log("path.parse(req.url)", path.parse(req.url));
    console.log(req.url);
    if (Object.keys(mimeType).includes(ext)) {
      fs.readFile(`${publicPath}${req.url}`, (err, data) => {
        if (err) {
          res.statusCode = 404;
          res.end('Not Found')
        } else { 
          res.statusCode = 200;
          res.setHeader('Content-Type', mimeType[ext]);
          res.end(data)
        }
      })
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');

      const filePath = path.join(__dirname, '../public/index.html')
      fs.readFile(filePath, (err, data) => {
        if (err) throw err;

        res.end(data);
      })
    }
```

- `mimeType` 딕셔너리를 만들어 확장자 키에 마임타임값을 사용
- 요청 주소를 파싱해서 확장자에 따라  `content-type` 헤더 값을 동적으로 설정

```js
console.log(path.parse(req.url))
{ root: '/',
  dir: '/css',
  base: 'style.css',
  ext: '.css',
  name: 'style' }

// img, sciprt 이런식으로 나옴
```

- `path.parse()`로 주소를 파싱하여 `ext`키에 확장자 정보를 추출
- 정적 파일은 모두 `public` 폴더에 있기 때문에 절대 경로를 계산하여 `publicPath`상수에 저장
- `Object.keys`를 이용해 `ext`키를 포함하면 그 요청 url(`req.url`)를 사용하여 일치하는 파일을 응답해준다.

- HTML, CSS, JS, IMAGE 처럼 브라우져에서 렌더링 되는 자원을 정적파일이라고 합니다.
- MineType을 설정하여 정적 파일 제공 기능을 구현했습니다.

## 7강

### 커스텀 모듈 serve-static 만들기

- 이전에 정적파일을 모듈로 빼내자

```js
//serve-static
const path = require('path')
const fs = require('fs')

const serveStatic = (req, res) => {
  const mimeType = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.eot': 'appliaction/vnd.ms-fontobject',
    '.ttf': 'aplication/font-sfnt'
  }

  const ext = path.parse(req.url).ext;
  const publicPath = path.join(__dirname, '../public')

  if (Object.keys(mimeType).includes(ext)) {
    fs.readFile(`${publicPath}${req.url}`, (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end('Not Found')
      } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', mimeType[ext]);
        res.end(data)
      }
    })
  }
}

module.exports = serveStatic;

// Application.js
const serveStatic = require('./serve-static')
    
const _server = http.createServer((req, res) => {
  serveStatic(req, res) // serve-static 모듈 사용 

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');

  const filePath = path.join(__dirname, '../public/index.html')
  fs.readFile(filePath, (err, data) => {
    if (err) throw err;

    res.end(data);
  })
});

```

- 요청이 오면 `serveStatic`모듈에 `req, res`인자를 넘겨서 실행
- `js, css, image` 파일이 온다면 모듈에서 응답
- `serveStatic()` 실행 후 다시 `index.html`을 응답하므로 2번 응답하게 되어 에러 발생
- ` Can't set headers after they are sent.`
- 하나의 요청에는 하나의 응답만 보내야 하는데 그렇지 않아 발생한 문제
- `serveStatic` 모듈이 동기 구문?이라면 한파일에 있었을때는 `if/else`로 분기처리했지만, 모듈로 분리하면서 로직 제어가 힘들다.
- 정적 파일을 모듈로 리팩토링하는 시도를 했습니다.
- 비동기 로직을 제어하는 현 구조의 한계를 짚어 봤습니다.?

## 8장

### 미들웨어

- 서버는 요청에서부터 응답까지 하나의 흐름을 가지고 있습니다.
- 요청과 응답 사이에 실행되는 함수목록을 "미들웨어 함수"라고 하겠습니다.
  - 요청한 클라이언트에게 응답(response)
  - 다음 미들웨어 함수 호출(next) 이때는 함수의 결과값을 다음 미들웨어 함수의 인자로 전달
- 어플리케이션 단에서 미들웨어 함수를 등록하는 부분과 요청이 올대 등록된 미들웨어 함수 모두를 실행하는 것이 중요 알고리즘


```js
//미들웨어 등록

const middlewares = []
const use = fn => middlewares.push(fn)

//미들웨어 실행
let next = null
const run = () => middlewares.forEach(mw => {
  next = mw(next)
})
```

### Middleware 모듈

```js
require('should');
const sinon = require('sinon');
const Middleware = require('./Middleware');

describe('Middleware', () => {
  let middleware;
  beforeEach(() => { // describe가 실행될때마다 실행
    middleware = Middleware();
  })

  it('초기 미들웨어 갯수는 0개이다', () => {
    middleware._middlewares.length.should.be.equal(0);
  })

  describe('add()', () => {
    it('배열에 미들웨어 함수를 추가한다.', () => {
      const fns = [() => {}, () => {}, () => {}]

      fns.forEach(fn => middleware.add(fn));

      middleware._middlewares.length.should.be.equal(fns.length)
    })
  })

  describe('run()', () => {
    it('미들웨어 함수를 실행한다', () => {
      const stub = {
        mw1() {},
        mw2() {}
      }

      /*
        stub 함수 이용, stub은 진짜처럼 동작하는 테스트용 메소드
        callsFake로 가짜 함수를 선언해 테스트때만 동작하게 한다.
      */
      sinon.stub(stub, 'mw1').callsFake((req,res,next) => next());
      sinon.stub(stub, 'mw2').callsFake((req,res,next) => next());

      // 위에서 stub들을 담는다.
      const fns = [
        stub.mw1,
        stub.mw2
      ]

      // 반복하면서 add 메소드 실행
      fns.forEach(fn => middleware.add(fn));

      middleware.run();

      // fn.called는 stub함수로 만든 메소드이며 호출되면 true, 안되면 false
      fns.forEach(fn => {
        should(fn.called).be.equal(true)
      })
    })

    it('next를 호출하지 않는 미들웨어가 있으면 함수 체인을 즉시 중지한다', () => {
      const stub = {
        mw1() {},
        mwWillStop() {},
        mw2() {}
      }

      sinon.stub(stub, 'mw1').callsFake((req, res, next) => next());
      sinon.stub(stub, 'mwWillStop').callsFake(() => null);
      sinon.stub(stub, 'mw2').callsFake((req, res, next) => next());

      const fns = [
        stub.mw1,
        stub.mwWillStop,
        stub.mw2,
      ]

      fns.forEach(fn => middleware.add(fn));

      middleware.run();

      fns.forEach((fn ,idx) => {
        const shouldInvoked = idx < 2
        console.log('shouldInvoked',shouldInvoked,"idx", idx);
        should(fn.called).be.equal(shouldInvoked)
      })
    })

    it('에러 발생시 에러 미들웨어만 실행한다', () => {
      const stub = {
        mw1(req, res, next) {},
        mwWillThrow(req, res, next) {}, // 에러 발생 미들웨어
        mw2(req, res, next) {},
        mwWillCatchError(err, req, res, next) {} // 에러 처리 미들웨어
      };
      sinon.stub(stub, 'mw1').callsFake((req, res, next) => next());
      sinon.stub(stub, 'mwWillThrow').callsFake((req, res, next) => next(Error()));
      sinon.stub(stub, 'mw2').callsFake((req, res, next) => next());
      sinon.stub(stub, 'mwWillCatchError').callsFake((err, req, res, next) => null);

      const fns = [
        stub.mw1,
        stub.mwWillThrow,
        stub.mw2,
        stub.mwWillCatchError,``
      ]
      fns.forEach(fn => middleware.add(fn));

      middleware.run();

      fns.forEach((fn, idx) => {
        const shouldInvoked = idx !== 2;
        should(fn.called).be.equal(shouldInvoked)
      });
    })
  })
});

```

- 인자 갯수에 따라 분류
- 일반 미들웨어: 인자 세 개 (req, res, next)
- 에러 미들웨어: 인자 네 개 (err, req, res, next)

``` js
const debug = require('../utils/debug')('Middleware');

const Middleware = () => {
    const _middlewares = [];
    let _req, _res;

    const add = fn => {
        _middlewares.push(fn)
    }

    const run = (req, res) => {
        _req = req;
        _res = res;

        _run(0);
    }
    const _run = (i, err) => {
           if (i < 0 || i >= _middlewares.length) return;

        debug(`i:${i} _middlewares:${_middlewares.length}`)

        const nextMw = _middlewares[i]
        const next = (err) => _run(i + 1, err)

        if(err) {
            const isNextErrorMw = nextMw.length === 4

            return isNextErrorMw ? nextMw(err, _req, _res, next) : _run(i + 1, err)
        }

        nextMw(_req, _res, next);
    }

    return {
        _middlewares,
        add,
        run
    }
}

module.exports = Middleware;
```

- 미들웨어는 비동기 로직을 다루기 위한 패턴입니다.
- 미들웨어는 요청에서 응답 사이에서 실행되는 함수들의 목록이며 순차적으로 실행됩니다.
- 에러 미들웨어는 인자가 4개이며 어떤 미들웨어에서든이 에러가 발생되면 곧장 실행됩니다.

## 9장

- 어려워지기 시작한다..

### Middleware로 Application.user() 메소드 구현

- 어플리케이션 미들웨어 함수 등록을 `Application.use()` 메소드가 그 역할을 하도록 한다.
- 이 메소드는 미들웨어의 `add()`를 호출해야 한다.

```js
// Application.secp.js
  describe('use()', () => {
    it('Middleware 모듈 인스턴스의 add() 메소드를 실행한다', () => {
      const spy = sinon.spy();
      app._middleware.add = spy;
      const mw1 = () => null;

      app.use(mw1);

      should(spy.called).be.equal(true);
    })
  })
```

- `use()`는 `Middleware의 add() 메소드를 실행한다`는 테스트 케이스
- 어플리케이션 내 내부 변수인 `_middleware`의 `add`에 스파이를 심었습니다.
- `app.use()` 실행하면 이 스파이 함수가 실행되었는지 점검한다.


```js
const http = require('http')
const debug = require('../utils/debug')('Application')
const Middleware = require('./Middleware'); // 미들웨어 불러오기

const Application = () => {
  const _middleware = Middleware(); // 미들웨어 인스턴스 생성
  const _server = http.createServer((req, res) => {
    _middleware.run(req, res) // 미들웨어 모두 실행
  });

  const use = fn => _middleware.add(fn); // 미들웨어 추가

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
```

- Application <- Middleware (Express.js) 구현하여 -> app.js


```js
const path = require('path')
// ...

const serveStatic = () => (req, res, next) => { // 미들웨어 함수 인터페이스
   const mimeType = {
     '.ico': 'image/x-icon',
    // ...
    if (Object.keys(mimeType).includes(ext)) {
      // ...
    } else {
      next() // 다음 미들웨어를 수행
    }
 }

module.exports = serveStatic;
```

## 10장

### Logger Middleware

- 요청이 와도 서버 터미널에 아무런 정보가 없습니다. 서버 로그를 기록하는 `logger` 미들웨어를 만들자(morgan과 비슷)

```js
//middlewares/logger.js
const logger = () => (req, res, next) => {
  const log = `${req.method} ${req.url}`
  console.log(log)
  next()
}

module.exports = logger
```

- 미들웨어 함수이므로 `(req, res, next)` 인터페이스를 맞춘다.
- 로그 메세지는 메소드명(req.method), URL(req.url)을 합쳐서 출력
- 미들웨어 이므로 `next()`는 꼭 실행

```js
// app.js
// ...
const logger = require('./middlewares/logger');

app.use(logger()) // 로그 미들웨어 추가
app.use(serveStatic())
// ...
```

#### 로그 색상 추가

``` js
const colors = {
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m',
}

const methodColorMap = {
    get: colors.green,
    post: colors.cyan,
    put: colors.yellow,
    delete: colors.red
}

const logger = () => (req, res, next) => {
    const coloredMethod = (method = '') => {
        return `${methodColorMap[method.toLowerCase()]}${method}${colors.reset}`
    }

    const log = `${coloredMethod(req.method)} ${req.url}`
    console.log(log);
    next();
}

module.exports = logger
```

- 요청 정보를 로깅하는 logger 미들웨어를 만들었습니다.

## 11강

### 라우터 use

```js
app.use(logger())
app.use(serveStatic())
app.use(index)
app.use(error404)
app.use(error)
```

- 현재 어플리케이션은 정적파일은 제외한 모든 요청을 index 미들웨어가 처리
- "GET /foo"로 요청해도 index 미들웨어가 동작해서 index.html 파일 제공

```js
app.use('/', indexController)
app.use('/foo', fooController)
```

- 특정 주소("/") 요청이 있을때 `indexController`, ("/foo")일땐 `fooController`

```js
const use = (path, fn) => {
  if (typeof path === 'string' && typeof fn === 'function') {
    fn._path = path;
  } else if (typeof path == 'function') {
    fn = path;
  } else {
    throw Error('Usage: use(path, fn) or use(fn)');
  }

  _middleware.add(fn);
}
```

- 인자가 2개 들어올때 1개는 path(특정 주소), 1개는 fn(처리 함수)일때 fn._path에 path를 넣어 이 후 미들웨어를 실행할때 이 문자열과 요청 URL를 비교후 함수 실행
- 인자가 1개면 미들웨어 실행 함수 이므로 fn = path으로 변경


```js
// Middleware.js
    const _run = (i, err) => {
           if (i < 0 || i >= _middlewares.length) return;

        // debug(`i:${i} _middlewares:${_middlewares.length}`)

        const nextMw = _middlewares[i]
        const next = (err) => _run(i + 1, err)

        if(err) {
            const isNextErrorMw = nextMw.length === 4

            return isNextErrorMw ? nextMw(err, _req, _res, next) : _run(i + 1, err)
        }

        if( nextMw._path ) {
            const pathMatched = _req.url === nextMw._path;
            return pathMatched ? nextMw(_req, _res, next) : _run(i + 1)
        }

        nextMw(_req, _res, next);
    }
```

- `nextMw._path`가 `true`면 인자를 2개 받은거다.
- 따라서 요청 url과 비교후 일치하면 미들웨어 함수 실행 아니면 다음 미들웨어로 넘어간다.


``` js
// router/index.js
const path = require('path');
const fs = require('fs');


const listPosts = () => (req, res, next) => {
    const publicPath = path.join(__dirname, '../public')
    
    fs.readFile(`${publicPath}/index.html`, (err, data) => {
        if (err) throw err
    
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html')
        res.end(data)
    })
}

module.exports = {
    listPosts
}
```

- 미들웨어 반환 함수로 `()` 추가, `../public`으로 변경

```js
const error404 = () => (req, res, next) => {
    res.statusCode = 404
    res.end('Not Found')
}

const error = () => (err, req, res, next) => {
    res.statusCode = 500
    res.end()
}

module.exports = {
    error404,
    error
}
```

- 미들웨어 errors도 생성
- 만약 정의 되지 않은 경로, 가령 “/foo”로 요청을 한다고 합시다. 서버에서는 logger -> serveStatic 미들웨어까지 가다가 index.listPost는 건너 뛰어 버리겠죠. 경로가 맞지 않으니깐요. erros.error404 미들웨어를 만나게 되고 비로 Not Found 문자열을 응답하게 될 것입니다.

- 경로에 따라 컨트롤러를 설정하는 use() 메소드를 구현했습니다.
- 어플리케이션 코드를 단순하게 개선하였습니다.

## 12장

### 포스트 조회 API

- `GET /api/posts` 요청했는데 404 NOT FOUND 응답

```js
const api {
  getPosts() {
    return http('get', '/api/posts')
  }
}

const http = (method, url, data = null) => new Promise((resolve, reject) => {
  const req = new  XMLHttpRequest()
  req.open(method, url, true)
  req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  req.onreadystatechange = evt => // ...
  req.send(data)
}
```

- `getPosts()` 메소드는 http 요청 보내고 있다.
- `GET`메소드와 `/api/posts` 주소로 `AJAX` 요청 보낸다.
- 서버에서는 엔드포인트(end point)가 없기 때문에 `404`로 응답한것이 문제

``` js
//routes/api/posts.js
const posts = [{
        title: 'post 3',
        body: 'this is post 3'
    },
    {
        title: 'post 2',
        body: 'this is post 2'
    },
    {
        title: 'post 1',
        body: 'this is post 1'
    },
]

const index = () => (req, res, next) => {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(posts))
}

module.exports = {
    index
}
```

- "/api/posts" 요청에 대한 응답 컨트를러 함수를 만들자(미들웨어 함수로 인터페이스 맞춤)
- `API`는 `JSON`형식을 사용하므로 `Content-Type`헤더를 `application/json`으로 맞춘다.
- 문자열을 보낼땐 `JSON.stringify()` 함수 이용해 객체를 문자열로 변환

``` js
// app.js
//...
const apiPost = require('./routes/api/posts')

app.use('/',index.listPosts())
app.use('/api/posts', apiPost.index())
app.use(errors.error404())
//...
```

- 마지막으로 컨트롤러를 `app.js`에 `use()`메소드로 등록
- index함수를 모듈로 노출. 기본적인 조회 기능이므로 함수 이름은 index!

``` js
api.getPosts()
      .then(data => {
        console.log(data);
        el.innerHTML = data.reduce((html, post) => {
          html += `
            <h2>${post.title}</h2>
            <div>${post.body}</div>
          `
          return html
        }, '')
      })
      .catch(err => {
        console.log(err)
        el.innerHTML = 'Error: Refresh this page'
      })
```

- `reduce`에서 html은 누적되면서 리턴해주고 post는 배열 요소이다.

## 13장

### 응답 객체

- Response 모듈
- 서버는 JSON 형식 데이터로 응답
- 상태 코드를 포함한 헤더 설정도 모든 엔드 포인트에서 사용
- 이러한 응답처리를 위한 Response 모듈 만들기
- `http.createServer()`메소드 콜백함수가 인자로 받는 응답 객체 `res`를 확장해서 만든다.


```js
require('should');
const Response = require('./Response');

describe('Response', () => {
  it('생성 인자가 없으면 에러를 던진다', () => {
    should(() => Response()).throw()
  })

  describe('반환 객체', () => {
    let res

    beforeEach(() => {
      res = Response({})
    })

    it('status 메소드를 노출한다', () => {
      res.should.have.property('status')
      should(typeof res.status).be.equal('function')
    })

    it('set 메소드를 노출한다', () => {
      res.should.have.property('set')
      should(typeof res.set).be.equal('function')
      should(res.set.length).be.equal(2);
    })

    it('send 메소드를 노출한다', () => {
      res.should.have.property('send')
      should(typeof res.send).be.equal('function')
    })

    it('json 메소드를 노출한다', () => {
      res.should.have.property('json')
      should(typeof res.json).be.equal('function')
    })
  })
})
```

- status(code): 상태 코드를 설정 ex) 200
- set(key, value): 헤더 값을 key/value로 설정 ex) Content-Type, text/html
- send(text): 문자 응답 
- json(object): 제이슨 응답

```js
const Response = res => {
  if (!res) throw Error('res is required');

  res.status = res.status || (code => {
    res.statusCode = code;
    return res;
  })

  res.set = res.set || ((key, value) => {
    res.setHeader(key, value);
    return res;
  })

  res.send = res.send || (text => {
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'text/plain');
    }
    res.end(text);
  })

  res.json = res.json || (data => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  })

  return res;
};

module.exports = Response;
```

- Response 모듈은 기존의 res객체를 인자로 받는다.
- 상태값을 설정하는 `status()` `res`는 이미 사용하고 있는 객체이기 때문에 키를 덮어 쓰지 않기 위해 || 연산자 사용
- `statusCode` 설정 후 그대로 `res` 반환
- 함수체이닝 기법

``` js
const Response = require('./Response')

const Application = () => {
  const _middleware = Middleware();

  const _server = http.createServer((req, res) => {
    _middleware.run(req, Response(res)) // Response 객체로 교체 
  })
```

- `req,res` 객체 사용하는 부분은 미들웨어 구동 메소드인 `run()`부분

```js
// index.listPosts()
const path = require('path');
const fs = require('fs');

const listPosts = () => (req, res, next) => {
    const publicPath = path.join(__dirname, '../public')
    
    fs.readFile(`${publicPath}/index.html`, (err, data) => {
        if (err) throw err
    
        res.status(200).set('Content-Type', 'text/html').send(data)
    })
}

module.exports = {
    listPosts
}
// apiPost.index()
const posts = [{
        title: 'post 3',
        body: 'this is post 3'
    },
    {
        title: 'post 2',
        body: 'this is post 2'
    },
    {
        title: 'post 1',
        body: 'this is post 1'
    },
]

// const index = () => (req, res, next) => {
//     res.setHeader('Content-Type', 'application/json')
//     res.end(JSON.stringify(posts))
// }

const index = () => (req, res, next) => {
    res.status(200).json(posts);
  }

module.exports = {
    index
}

/*
  res.status = res.status || (code => {
    res.statusCode = code;
    return res;
  })

  res.status가 없으면 code 인자로 하는 함수로 작업후 res 리턴
*/
```

- 코드를 더 단순하게 만들고 싶다면 자주 사용하는 200 상태 코드는 기본 인자값으로 설정하는 방법도 있겠네요.
- 응답 처리를 개선하기위해 Response 모듈을 만들었습니다.
- stauts(), set(), send(), json() 메소드를 추가로 지원합니다.

## 14장

### 요청 객체 쿼리스트링 요청

- `/api/posts`에 쿼리문자열 추가 `?limit=2&page=1`
- `_req.url === nextMw._path;` 가 일치하지 않아 다음 미들웨어 함수가 실행되서 Not Found

```js
if (nextMw._path) {
  const pathMatched = _req.url === nextMw._path; // 바로 이 부분 !!!
  return pathMatched ? nextMw(_req, _res, next) : _run(i + 1)
}
```

### Request 모듈

- HTTP에서 요청 URL의 양식은 `Protocol + Domain + Path + QueryString + Body`
- 여태까지 `req.url`은 `path+querysting`으로 이루어져있어서 문제가 발생
- req를 `path, query`를 속성을 만들자
  - `path` 비교 가능하고 `req.query`객체를 통해 `limit, page`접근 가능

```js
req.path = "/api/posts"
req.query = {
  limit: "2",
  page: "1"
}
```

```js
// Request.spec.js
require('should');
const Response = require('./Response');

describe('Response', () => {
  it('생성 인자가 없으면 에러를 던진다', () => {
    should(() => Response()).throw()
  })

  describe('반환 객체', () => {
    let res

    // 모듈 생성 코드는 각 테스트 케이스에서 중복으로 사용될 것이므로 beforeEach()에서 기술하였습니다.
    beforeEach(() => {
      res = Response({})
    })

    it('status 메소드를 노출한다', () => {
      res.should.have.property('status')
      should(typeof res.status).be.equal('function')
    })

    it('set 메소드를 노출한다', () => {
      res.should.have.property('set')
      should(typeof res.set).be.equal('function')
      should(res.set.length).be.equal(2);
    })

    it('send 메소드를 노출한다', () => {
      res.should.have.property('send')
      should(typeof res.send).be.equal('function')
    })

    it('json 메소드를 노출한다', () => {
      res.should.have.property('json')
      should(typeof res.json).be.equal('function')
    })
  })
})
```

### Request 모듈

```js
// Request.js
const Request = req => {
    if (!req) throw Error('req is required')
    
    // req.url = "/api/posts?limit=3&page=2"
    const partials = req.url.split('?')
    // ["/api/posts", "limit=3&page=2"]
  
    const path = partials[0] || '/'; // ["/api/posts"] || '/' 
    req.path = req.path || path;
  
    if (!partials[1] || !partials[1].trim()) return req;
    
  
    const qs = partials[1].split('&').reduce((obj, p) => {
      const frag = p.split('=')
      obj[frag[0]] = frag[1]
      return obj
    }, {})
  
    // split('&') -> ["limit=2","page=1"]
    // split('=') -> ["limit","2"] // frag[0,1]
    // frag[0] = "limit"
    // obj[frag[0]] -> obj["limit"] = 2
    // obj = {
    //   limit : 2,
    //   page: 1
    // }

    req.query = req.params || qs
    return req
  }
  
  module.exports = Request
  
```

```js
!"  " || !"   ".trim(); // true
!"  "; // false
```

- Request 모듈 `Application`에 적용하고 `Middleware`에서 사용


``` js
// Application.js
const Request = require('./Request');

const Application = () => {
  const _server = http.createServer((req, res) => {
    _middleware.run(Request(req), Response(res)) // Request 객체로 교체 
  });

// Middleware.js
  if (nextMw._path) {
      const pathMatched = _req.path === nextMw._path // 경로만 체크 
      return pathMatched ? nextMw(_req, _res, next) : _run(i + 1)
     }
```

- 포스트 갯수, 페이지 수 요청 처리
- `?limit=2&page=1`
- 포스트는 2개만 보여주고 1페이지르 보여달라
  - 만약 포스트가 6개 있으면 앞에 1,2만 불러오기
- `?limit=2&page=2`
- 포스트는 2개만 보여주고 2페이지르 보여달라
  - 만약 포스트가 6개 있으면 앞에 3,4만 불러오기

```js
const index = () => (req, res, next) => {
    const limit = req.query.limit * 1 || 2 // 포스트 갯수
    const page = req.query.page * 1 || 1 // 페이지 요청 수
  
    const begin = (page - 1) * limit // page가 1이면 slice가 0부터 시작한다. 만약 2이면 * limit이 포스트 개수 계산되므로 거기서부터 데이터 받게 한다.
    const end = begin + limit // 시작이 정해지면 거기다가 최대 포스트 갯수만 더하면 불러올 데이터 끝
  
    res.json(posts.slice(begin, end))
    // slice end는 end-1 까지 자른다
   }
```

- 요청 정보에 쉽게 접근하게 위한 Request 모듈을 만들었습니다.
- req.path, req.

## 15강

### 라우터 Get, Post

---

#### 강의는 다 봤지만 정리를 못했다. 나중에 다시 한번 보면서 정리하기.