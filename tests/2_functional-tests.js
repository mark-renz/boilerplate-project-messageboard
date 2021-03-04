const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const server = require('../server');

chai.use(chaiHttp);


suite('Functional Tests', () => {
  
  let threadId, threadId2, replyId; 
  
  suite('api/threads/{board}', () =>  {   
    suite('POST', () => {  
    test('Create a new thread', (done) => {
      let data = {
        board: 'general',
        text: 'Functional Test Post Thread',
        delete_password: 'password'
      }
      chai.request(server)
        .post('/api/threads/general')
        .send(data)
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
            threadId2 = res.body[1]._id;
            done();
          })
      })
    })

    suite('PUT', () => {
      test('Report Thread', done => {
        const data = {
          board: 'general',
          report_id: threadId,
        }
        chai.request(server)
          .put('/api/threads/general')
          .send(data)
          .end((err,res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'reported');
            done();
          })
        })
      })

    suite('DELETE', () => {
      test('Delete thread w/ wrong password', done => {
        const data = {
          board: 'general',
          thread_id: threadId,
          delete_password: 'wrong password'
        }
        chai.request(server)
          .delete('/api/threads/general')
          .send(data)
          .end((err, res)=>{
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');
            done();
          })
      })

      test('Delete thread', done => {
        const data = {
          board: 'general',
          thread_id: threadId,
          delete_password: 'password'
        }
        chai.request(server)
          .delete('/api/threads/general')
          .send(data)
          .end((err,res)=>{
            assert.equal(res.status, 200);
            assert.equal(res.text, 'delete successful');
            done();
          })
      })
    })

    suite('api/replies/{board}', () => {
      suite('POST', () => {
        test('Create reply', done => {
          const data = {
            board: 'general',
            thread_id: threadId2,
            text: 'reply test',
            delete_password: 'password'
          }
          chai.request(server)
            .post('/api/replies/general')
            .send(data)
            .end((err, res) => {
              assert.equal(res.status, 200);
              expect(res).to.redirect;
              done();
            })
        })
      })

      suite('GET', () => {
        test('View single thread', done => {
          chai.request(server)
            .get('/api/replies/general')
            .query({thread_id: threadId2})
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.hasAllKeys(res.body,[
                '_id',
                'text',
                'created_on',
                'bumped_on',
                'replies'
              ]);
              assert.doesNotHaveAllDeepKeys(res.body,[
                'delete_password',
                'reported'
              ]);
              res.body.replies.map(reply => {
                assert.hasAllKeys(reply,[
                  '_id',
                  'text',
                  'created_on'
                ])
              })
              replyId = res.body.replies[0]._id;
              done();
            })
        })
      })

      suite('PUT', () => {
        test('report reply', done => {
          const data = {
            board: 'general',
            thread_id: threadId2,
            reply_id: replyId
          }

          chai.request(server)
            .put('/api/replies/general')
            .send(data)
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.text, 'reported');
              done();
            })
        })
      })

      suite('DELETE', () => {
        test('Delete reply wrong password', done => {
          const data = {
            board: 'general',
            thread_id: threadId2,
            reply_id: replyId,
            delete_password: 'wrong password'
          }

          chai.request(server)
            .delete('/api/replies/general')
            .send(data)
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.text, 'wrong password');
              done();
            })
        })

        test('Delete reply', done => {
          const data = {
            board: 'general',
            thread_id: threadId2,
            reply_id: replyId,
            delete_password: 'password'
          }

          chai.request(server)
            .delete('/api/replies/general')
            .send(data)
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.text, 'reply deleted');
              done();
            })
        })
      })
    })

  })
});