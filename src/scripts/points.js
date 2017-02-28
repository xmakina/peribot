module.exports = function (robot) {
  const brainKey = 'pointReaction'

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
  }, {expect: 'set point reaction <emoji>', description: 'sets the point scoring reaction (admins only)'})

  robot.respond(/points (.*)/i, function (msg) {
    var points = robot.brain.get('points|' + msg.match[1])
    msg.reply(msg.match[1] + ' has ' + points + ' point' + (points > 1 ? 's' : ''))
  }, {expect: 'points <mention>', description: 'reports how many points <mention> has'})

  robot.respond(/what is the point reaction/i, function (msg) {
    msg.reply('React with ' + robot.brain.get(brainKey) + ' to award that person with a point')
  }, {expect: 'what is the point reaction', description: 'tells you the current point scoring reaction'})

  robot.respond(/list point/i, function (msg) {
    var result = ''
    var userPoints = robot.brain.get('userPoints')

    for (var key in userPoints) {
      result += '<@' + key + '> : ' + userPoints[key]
    }

    msg.author.dmChannel.send(result)
  }, {expect: 'list points', description: 'lists all scores (reply via DM)'})

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
    var awarded = reaction.message.author.id
    reaction.users.array().forEach(function (awarder, index, list) {
      doneSoFar++
      if (awarded === awarder.id) {
        return
      }

      if (awards.includes(awarder.id)) {
        return
      }

      awards.push(awarder.id)
      var userPoints = robot.brain.get('userPoints')

      if (userPoints === null) {
        userPoints = {}
      }

      if (userPoints[awarded]) {
        userPoints[awarded]++
      } else {
        userPoints[awarded] = 1
      }

      robot.brain.set('userPoints', userPoints)
      console.log('point awarded', userPoints)
      if (doneSoFar === list.length) {
        robot.brain.set(messageBrainKey, awards)
      }
    })
  })
}
