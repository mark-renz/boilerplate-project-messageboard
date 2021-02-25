const { model, Schema } = require('mongoose');

const boardSchema = new Schema({
board_name: String,
created_on: {type: Date, default: Date.now},
threads: [{
  type: Schema.Types.ObjectId, ref:'Thread'
}]
});

module.exports = model('Board', boardSchema);