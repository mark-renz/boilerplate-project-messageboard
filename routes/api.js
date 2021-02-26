'use strict';

const Board = require('../models/board');
const Thread = require('../models/thread');
const Reply = require('../models/reply');

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
      
      res.send(thread);
    })
    
    /*TODO: Get thread (GET /api/thread/:board)
    return thread[10] - bumped, replies[3] - recent
    */
    .get(async ( req, res )=>{
      console.log("GET Thread");
      console.log(req.params);

      const boardName = req.params.board;
      
      const board = Board.findOne({board_name:boardName});
      const threads = await board.populate({
        path: 'threads',
        options: {limit: 2, sort: {bumped_on: -1}}
      }).exec();

      let threadReturn = await threads.threads.map(thread => {
      const newThread = {
        _id: thread._id,
        text: thread.text,
        created_on: thread.created_on,
        bumped_on: thread.bumped_on,
        reported: thread.reported,
        delete_password: thread.delete_password,
        replies: thread.replies,
        replycount: thread.replies.length
      }
      return newThread;
      });

      res.send(threadReturn);
    })

  /*TODO: Report thread (PUT /api/threads/:board) 
    input board, thread_id
  */

  /*TODO: Delete thread (DELETE /api/threads/:board)
    input board, thread_id, password
  */

  app.route('/api/replies/:board');
  /*TODO: New reply (POST /api/replies/:board) 
    input board, thread_id, body, password
  */

  /*TODO: Report reply (PUT /api/replies/:board)
    input board, threadId, replyId 
  */

  /*TODO: Delete reply (DELETE /api/replies/:board)
    input board, threadId, replyId, password
  */

  /*TODO: Get thread (GET /api/replies/:board?thread_id=:thread_id)
    return thread, all replies.
  */

};
