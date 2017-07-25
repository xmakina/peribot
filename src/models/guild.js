(function () {
  const mongoose = require('mongoose')
  const Schema = mongoose.Schema

  const guildSchema = new mongoose.Schema({
    id: String,
    settings: Schema.Types.Mixed
  })

  module.exports = mongoose.model('Guild', guildSchema)
})()
