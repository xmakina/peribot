(function () {
  const mongoose = require('mongoose')

  const scoreboardSchema = new mongoose.Schema({
    playerId: String,
    scores: [{
      gameId: String,
      score: Number
    }]
  })

  scoreboardSchema.methods.findScore = function (gameId) {
    let found = this.scores.filter((game) => {
      return game.gameId === gameId
    })

    if (found.length === 1) {
      return found[0]
    }

    return null
  }

  scoreboardSchema.methods.findGameIndex = function (gameId) {
    let found = this.scores.filter((game) => {
      return game.gameId === gameId
    })

    if (found.length === 1) {
      return this.scores.indexOf(found[0])
    }

    return null
  }

  const Scoreboard = mongoose.model('Scoreboard', scoreboardSchema)

  class Scoreboards {
    getPlayer (playerId) {
      return Scoreboard.findOne({playerId})
    }

    getGame (gameId) {
      return Scoreboard.find({'scores.gameId': gameId})
    }

    async addToScore (playerId, gameId, amount) {
      let player = await this.getPlayer(playerId)
      if (player === null) {
        return await this.updateScore(playerId, gameId, amount)
      }
      let index = player.findGameIndex(gameId)
      player.scores[index].score += amount

      await player.save()
    }

    async setScore (playerId, gameId, score) {
      let player = await this.getPlayer(playerId)
      let index = player.findGameIndex(gameId)
      player.scores[index].score = score
      await player.save()
    }

    async updateScore (playerId, gameId, score) {
      let scoreboard = await Scoreboard.findOne({playerId})

      if (scoreboard === null) {
        scoreboard = new Scoreboard({
          playerId,
          scores: [{
            gameId,
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
