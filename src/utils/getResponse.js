(function () {
  async function getResponse (msg, prompt, milliseconds, targets, allowOffline) {
    let allResponses = {responses: [],
      abandon: function () {
        this.responses.map(response => {
          response.blocker(msg, true)
        })
      }}

    let check = msg.client.inhibited.every(elem => targets.indexOf(elem.id) > -1)
    if (!check) {
      msg.reply('One of you is already doing something else')
      return null
    }

    await Promise.all(targets.map(async target => {
      let dmChannel = await target.createDM()

      var oneBlock = (targetId, dmChannel) => {
        var inhibitor = (privateMessage, abandoned) => {
          if (abandoned) {
            let index = msg.client.inhibited.indexOf(targetId)
            msg.client.inhibited.splice(index, 1)
            msg.client.dispatcher.removeInhibitor(inhibitor)

            return dmChannel.send('Nevermind then...')
          }

          if (privateMessage.author.id === targetId && privateMessage.channel.id === dmChannel.id) {
            let index = msg.client.inhibited.indexOf(targetId)
            msg.client.inhibited.splice(index, 1)

            privateMessage.reply('Thanks, check ' + msg.channel.toString() + ' for your results!')
            msg.client.dispatcher.removeInhibitor(inhibitor)
            return true
          }
        }

        return inhibitor
      }

      msg.client.inhibited.push(target.id)
      let inhibitor = oneBlock(target.id, dmChannel)
      msg.client.dispatcher.addInhibitor(inhibitor)

      dmChannel.send(prompt + '(You have ' + milliseconds / 1000 + ' seconds)')
      const responses = await dmChannel.awaitMessages(msg2 =>
        msg2.author.id === target.id,
        {maxMatches: 1, time: milliseconds})

      if (responses.size === 0) {
        inhibitor(null, true)
        return null
      }

      allResponses.responses.push({responses: responses, blocker: inhibitor})
    }))

    return allResponses
  }

  module.exports = getResponse
})()
