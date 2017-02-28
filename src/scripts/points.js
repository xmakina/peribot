module.exports = function (robot) {
  const brainKey = 'pointReaction'

  function getPointDiscriminator (user) {
    return 'points|' + user.toString()
  }

  function getMessageDiscriminator (message) {
    return 'reactMessage|' + message.id
  }

  robot.respond(/set point reaction (.*)/i, function (msg) {
    var isAdmin = msg.member.roles.exists('name', 'Admin')
    if (isAdmin === false) {
      return
    }

    var react = msg.match[1]
    robot.brain.set(brainKey, msg.match[1])
    msg.reply('Setting ' + msg.match[1] + ' as point')
  })

  robot.respond(/points (.*)/i, function (msg) {
    var points = robot.brain.get('points|' + msg.match[1])
    msg.reply(msg.match[1] + ' has ' + points + ' point' + (points > 1 ? 's' : ''))
  })

  robot.on('messageReactionAdd', function (reaction) {
    if (reaction.emoji.name === robot.brain.get(brainKey) === false) {
      return
    }

    var messageBrainKey = getMessageDiscriminator(reaction.message)
    var awards = robot.brain.get(messageBrainKey)
    if (awards === null) {
      awards = []
    }

    var doneSoFar = 0
    reaction.users.array().forEach(function (awarder, index, list) {
      doneSoFar++
      if (awards.includes(awarder.id)) {
        return
      }

      awards.push(awarder.id)
      var pointBrainKey = getPointDiscriminator(reaction.message.author)
      var points = robot.brain.get(pointBrainKey)
      points++
      robot.brain.set(pointBrainKey, points)

      if (doneSoFar === list.length) {
        robot.brain.set(messageBrainKey, awards)
      }
    })
  })
}
