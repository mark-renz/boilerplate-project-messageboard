'use strict';

/*TODO: create Model
  
  Board
  board_name:String
  created_on: date & time
  threads: [{
    type: Schema.Types.ObjectId, ref: 'Thread'
  }]

  Thread
  _id: ID
  text: String
  delete_password: String
  created_on: date & time
  bumped_on: date & time
  reported: BOOL
  replies: [{
    type: Schema.Types.ObjectId, ref: 'Reply'
  }]

  Reply
  _id: ID
  text: String
  delete_password: String
  created_on: date & time
  reported: BOOL
*/

module.exports = function (app) {
  
  app.route('/api/threads/:board');
  /*TODO: New thread (POST /api/threads/:board)
    input board, body, password
   */

  /*TODO: Report thread (PUT /api/threads/:board) 
    input board, thread_id
  */

  /*TODO: Delete thread (DELETE /api/threads/:board)
    input board, thread_id, password
  */
  
  /*TODO: Get thread (GET /api/replies/:board)
    return thread[10] - bumped, replies[3] - recent
  */

  /*TODO: Get thread (GET /api/replies/:board?thread_id=:thread_id)
    return thread, all replies.
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

};
