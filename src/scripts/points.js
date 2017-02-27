module.exports = function (robot) {
  const brainKey = 'pointReaction'
  robot.respond(/set point reaction (.*)/i, function (msg) {
    var isAdmin = msg.member.roles.exists('name', 'Admin')
    if (isAdmin === false) {
      return
    }

    var react = msg.match[1]
    robot.brain.set(brainKey, msg.match[1])
    msg.reply('Setting ' + msg.match[1] + ' as point')
  })

  robot.on('messageReactionAdd', function (reaction) {
    console.log('reaction', reaction.emoji.name === robot.brain.get(brainKey))
  })
}
