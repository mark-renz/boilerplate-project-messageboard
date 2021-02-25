const { model, Schema } = require('mongoose');

const replySchema = Schema({
  text: String,
  delete_password: String,
  created_on:{ type: Date, default: Date.now },
  reported: Boolean
})

module.exports = model('Reply', replySchema);