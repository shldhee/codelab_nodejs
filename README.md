# 1강

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

# 2강

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

# 3강

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

# 4강

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

# 5강

## debug 모듈 만들기

- debug 장점
  - 태그를 지정한 로그 함수를 만들 수 있다.
  - 태그별로 색상을 줘서 로그 식별이 수월하다.
  - 아직 잘 모르겠다....

```js
const debug = require('debug')('my_tag')
debug('my_log') // "my_tag my_log"
```

## 테스트 코드 만들기

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

## Debug 활용 color

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

## 정적 파일

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

# 7강

## 