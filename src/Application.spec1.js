const should = require('should');
const sinon = require('sinon');

const App = require('./Application');

describe('Application', () => {
  describe('listen()', () => {
    it('server 객체의 listen 함수를 실행한다', () => {
      // arrange 준비 단계 객체, 스파이 생성, app._server 객체의 listen속성에 spy 심음. 검증할때 listen 함수가 호출되었는지 spy로 확인
      const app = App();
      const spy = sinon.spy();
      app._server.listen = spy // listen 함수가 호출되었는지 spy로 확인

      // act
      app.listen()

      // assert
      should(spy.called).be.equal(true) // spy를 통해 listen함수가 호출되었는지 확인하는 곳
    })
  })

  describe('use()', () => {
    it('Middleware 모듈 인스턴스의 add() 메소드를 실행한다', () => {
      const spy = sinon.spy();
      app._middleware.add = spy;
      const mw1 = () => null;
      
      app.use(mw1);

      should(spy.called).be.equal(true);
    })
  })
})