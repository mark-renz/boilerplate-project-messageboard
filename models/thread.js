const { model, Schema } = require('mongoose');

const threadSchema = Schema({
  text: String,
  delete_password: String,
  created_on:{ type: Date, default: Date.now },
  bumped_on:{ type: Date, default: Date.now },
  reported: { type: Boolean, default: false },
  replies: [{
    type: Schema.Types.ObjectId, ref:'Reply'
  }]
})

module.exports = model('Thread', threadSchema);