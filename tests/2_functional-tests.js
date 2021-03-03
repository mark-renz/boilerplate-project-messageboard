const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const server = require('../server');

chai.use(chaiHttp);


suite('Functional Tests', () => {
  suite('api/threads/{board}', () =>  {
    
    let threadId, replyId;    
    
    suite('POST', () => {  
    test('Create a new thread', (done) => {
      let thread = {
        board: 'general',
        text: 'Functional Test Post Thread',
        delete_password: 'password'
      }
      chai.request(server)
        .post('/api/threads/general')
        .send(thread)
        .end((err, res) => {
          assert.equal(res.status, 200);
          expect(res).to.redirect;
          done();
          })
      })
    })

    suite('GET', () => {
      test('View 10 recent threads/ 3 replies each', done => {
        chai.request(server)
          .get('/api/threads/general')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isAtMost(res.body.length,10);

            res.body.map(thread => {
              assert.hasAllKeys(thread,[
                '_id',
                'text',
                'created_on',
                'bumped_on',
                'replies',
                'replycount'
              ]);
              assert.doesNotHaveAllKeys(thread, [
                'reported',
                'delete_password'
              ])

              assert.isAtMost(thread.replies.length, 3);
            });
            threadId = res.body[0]._id;
            reportThreadId = res.body[1]._id;
            done();
          })
      })
    })

    suite('PUT', () => {
      test('Report Thread', done => {
        const thread = {
          board: 'general',
          report_id: threadId,
        }
        chai.request(server)
          .put('/api/threads/general')
          .send(thread)
          .end((err,res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'reported');
            done();
          })
        })
      })

    suite('DELETE', () => {
      test('Delete thread w/ wrong password', done => {
        const thread = {
          board: 'general',
          thread_id: threadId,
          delete_password: 'wrong password'
        }
        chai.request(server)
          .delete('/api/threads/general')
          .send(thread)
          .end((err, res)=>{
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');
            done();
          })
      })

      test('Delete thread', done => {
        const thread = {
          board: 'general',
          thread_id: threadId,
          delete_password: 'password'
        }
        chai.request(server)
          .delete('/api/threads/general')
          .send(thread)
          .end((err,res)=>{
            assert.equal(res.status, 200);
            assert.equal(res.text, 'delete successful');
            done();
          })
      })
    })

  })
});