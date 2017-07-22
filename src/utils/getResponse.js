(function () {
  async function getResponse (msg, prompt, milliseconds, targets, allowOffline) {
    let allResponses = {
      responses: [],
      abandon: function () {
        this.responses.map(response => {
          response.blocker(msg, true)
        })
      }
    }

    let check = msg.client.inhibited.every(elem => targets.indexOf(elem.id) > -1)
    if (!check) {
      throw new Error('one of you is already doing something else')
    }

    if (allowOffline === false) {
      let check = targets.every(elem => {
        return elem.presence.status === 'online'
      })
      if (!check) {
        throw new Error('All recipients must be online')
      }
    }

    await Promise.all(targets.map(awaitResponse(msg, allResponses, prompt, milliseconds)))

    return allResponses
  }

  function awaitResponse (msg, allResponses, prompt, milliseconds) {
    return async function (target) {
      let dmChannel = await target.createDM()

      msg.client.inhibited.push(target.id)
      let inhibitor = blockNextCommand(target.id,
        dmChannel,
        msg.client.inhibited,
        msg.client.dispatcher,
        msg.channel.toString())

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
    }
  }

  function blockNextCommand (targetId, dmChannel, inhibited, dispatcher, channel) {
    var inhibitor = (privateMessage, abandoned) => {
      if (abandoned) {
        if (inhibited.indexOf(targetId) > -1) {
          let index = inhibited.indexOf(targetId)
          inhibited.splice(index, 1)
          dispatcher.removeInhibitor(inhibitor)

          return dmChannel.send('Nevermind then...')
        }

        return null
      }

      if (privateMessage.author.id === targetId && privateMessage.channel.id === dmChannel.id) {
        let index = inhibited.indexOf(targetId)
        inhibited.splice(index, 1)

        privateMessage.reply('Thanks, check ' + channel + ' for your results!')
        dispatcher.removeInhibitor(inhibitor)
        return true
      }
    }

    return inhibitor
  }

  module.exports = getResponse
})()
