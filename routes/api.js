'use strict';

const Board = require('../models/board');
const Thread = require('../models/thread');
const Reply = require('../models/reply');
const thread = require('../models/thread');

async function createThread(boardName, text, deletePassword){
  //TODO: find board if not exist create board else create thread
  let board = await Board.findOne({board_name: boardName}).catch(e=>console.log(e));
  
  const newThread = new Thread({
    text: text,
    delete_password: deletePassword,
  });

  const thread = await newThread.save().catch(e=>console.log(e));

  if(!board && thread){
    const newBoard = new Board({
      board_name: boardName,
      threads: thread._id
    });

    board = await newBoard.save().catch(e=>console.log(e));   
  } else if(board && thread){
    const updateBoard = await Board.updateOne({ board_name: boardName },{
      $push: {threads: [thread._id]}
    }).catch(e=>console.log(e));
  } else console.log('thread creation fail')

  return thread;
}

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    /*TODO: New thread (POST /api/threads/:board)
    input board, body, password
   */
    .post(async ( req, res ) => {
      console.log("POST Thread");
      
      const boardName = req.params.board;
      console.log(boardName);
      const text = req.body.text;
      const deletePassword = req.body.delete_password;

      console.log(boardName, text, deletePassword);
      const thread = await createThread(boardName, text, deletePassword);
      
      thread ? res.redirect(`/b/${boardName}`) : res.send('create thread fail');
    })
    
    /*TODO: Get thread (GET /api/thread/:board)
    return thread[10] - bumped, replies[3] - recent
    */
   //TODO: return 3 most recent reply
    .get(async ( {params:{board:boardName}}, res )=>{
      console.log("GET Thread");

      const board = await Board.findOne({board_name:boardName})
      .populate({
        path: 'threads',
        populate: {
          path: 'replies',
          options : {sort:{created_on: -1}}
        },
        options: {limit: 10, sort: {bumped_on: -1}},
      }).exec();

      const data = await board.threads.map(
        ({_id, text, created_on, bumped_on, replies}) => {
          
          const replyObj = replies.slice(0,3).map(
            ({_id, text, created_on})=>{
              const replyObj = {
                _id: _id,
                text: text,
                created_on: created_on
              }
              return replyObj;
            });
          
          const threadObj = {
            _id: _id,
            text: text,
            created_on: created_on,
            bumped_on: bumped_on,
            replies: replyObj,
            replycount: replies.length
          }

          return threadObj;
        });
      
      res.send(data);
    })

  /*TODO: Report thread (PUT /api/threads/:board) 
    input board, thread_id
  */
    .put(async ( req, res ) => {
      const threadId = req.body.thread_id;
      const thread = await Thread.findByIdAndUpdate(threadId, {reported: true}).catch(e=>console.log(e));
      return thread ? res.send('reported') : res.send('thread does not exist');
    })

  /*TODO: Delete thread (DELETE /api/threads/:board)
    input board, thread_id, password
  */
    .delete(async ( req, res) =>{
      const boardName = req.body.board;
      const threadId = req.body.thread_id;
      const deletePassword = req.body.delete_password;
      
      const board = await Board.findOne({board_name:boardName});
        
      if(board && board.threads.includes(threadId)){
          const thread = await Thread.deleteOne({
            _id:threadId,
          delete_password: deletePassword}).catch(e=>console.log(e));
          
          thread.deletedCount ? res.send('delete successful') : res.send('incorrect password');
        }else 
          res.send('incorrect board');
    });

  app.route('/api/replies/:board')
  /*TODO: New reply (POST /api/replies/:board) 
    input board, thread_id, body, password
  */
  .post( async (
    {params:{board: boardName}, 
    body:{thread_id, text, delete_password}}, res)=> {
      console.log("POST REPLY");
      const board = await Board.findOne({board_name:boardName}).catch(e=>console.log(e));
      
      if(board && board.threads.includes(thread_id)){
        const thread = await Thread.findOne({_id:thread_id}).catch(e=>console.log(e));

        if(thread) {
          const newReply = new Reply({
            text: text,
            delete_password: delete_password
          });

          const reply = await newReply.save().catch(e=>console.log(e));

          if(reply){
            const updateThread = await Thread.updateOne({ _id: thread_id },{
              $push: {
                replies: [reply._id]
              },
              $set: {
                bumped_on: Date.now()
              }
            }).catch(e=>console.log(e));
          }
        }
      }
      
      //created or not redirect thread
      res.redirect(`/b/${boardName}/${thread_id}`);

  })

  /*TODO: Report reply (PUT /api/replies/:board)
    input board, threadId, replyId 
  */

  /*TODO: Delete reply (DELETE /api/replies/:board)
    input board, threadId, replyId, password
  */
  .delete(async (
    {params:{board: boardName}, body:{thread_id:threadId, reply_id: replyId, delete_password:deletePassword}}, res) => {
      console.log('DELETE REPLY');

      const board = await Board.findOne({board_name: boardName}).catch(e=>console.log(e));

      if(board && board.threads.includes(threadId)){
        const thread = await Thread.findById(threadId).catch(e=>console.log(e));
        
        if(thread && thread.replies.includes(replyId)){
          const reply = await Reply.findOneAndDelete({_id:replyId, delete_password: deletePassword}).catch(e=>console.log(e));

          reply ? res.send('reply deleted') : res.send('wrong password');
        }
      } res.send('not exist')
    })
      
      

  /*TODO: Get thread (GET /api/replies/:board?thread_id=:thread_id)
    return thread, all replies.
  */
  .get( 
    async({params:{ board:boardName }, 
    query:{thread_id: threadId}}, res) => {
      console.log('GET REPLIES');
      
      const board = await Board.findOne({board_name: boardName});
      
      if(board && board.threads.includes(threadId)){
        const thread = Thread.findById(threadId);

        const replies = await thread.populate({
          path: 'replies',
          options: {sort: {created_on: -1}}
        }).exec();

        res.send(replies);

      }
      else res.send("");
  })
};


