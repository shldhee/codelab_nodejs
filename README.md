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