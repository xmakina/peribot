(function () {
  const mongoose = require('mongoose')

  const scoreboardSchema = new mongoose.Schema({
    playerId: String,
    scores: [{
      gameId: String,
      discriminator: String,
      score: Number
    }]
  })

  const Scoreboard = mongoose.model('Scoreboard', scoreboardSchema)

  class Scoreboards {
    getPlayer (playerId) {
      return Scoreboard.findOne({playerId})
    }

    getGame (gameId) {
      return Scoreboard.find({'scores.gameId': gameId})
    }

    async setScore (playerId, gameId, discriminator, score) {
      let scoreboard = await Scoreboard.findOne({playerId, 'scores.gameId': gameId, 'scores.discriminator': discriminator})
      scoreboard.scores.score = score
      await scoreboard.save()
    }

    async updateScore (playerId, gameId, discriminator, score) {
      let scoreboard = await Scoreboard.findOne({playerId, 'scores.gameId': gameId, 'scores.discriminator': discriminator})

      if (scoreboard === null) {
        scoreboard = new Scoreboard({
          playerId,
          scores: [{
            gameId,
            discriminator,
            score
          }]
        })

        await scoreboard.save()
      }

      if (scoreboard.scores[0].score < score) {
        scoreboard.scores[0].score = score
        await scoreboard.save()
      }
    }
  }

  module.exports = new Scoreboards()
})()
