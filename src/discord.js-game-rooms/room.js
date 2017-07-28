(function () {
  const mongoose = require('mongoose')

  const roomSchema = new mongoose.Schema({
    id: String,
    require: String
  })

  module.exports = mongoose.model('Room', roomSchema)
})()
