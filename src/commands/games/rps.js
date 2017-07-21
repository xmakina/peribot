
var commando = require('discord.js-commando')

module.exports = class GetQuoteCommand extends commando.Command {
  constructor (client) {
    super(client, {
      name: 'rock-paper-scissors',
      aliases: ['rps'],
      group: 'games',
      memberName: 'rps',
      description: 'Plays Rock/Paper/Scissors',
      details: 'A great way to pick a winner quickly',
      examples: ['rps paper'],
      args: [
        {
          key: 'opponent',
          label: 'opponent',
          prompt: 'Who will you challenge?',
          type: 'user',
          infinite: false
        }
      ]
    })
  }

  async run (msg, args) {
    await msg.author.createDM().then(async function (dmChannel) {
      dmChannel.send('Choose your weapon!')
      const responses = await dmChannel.awaitMessages(msg2 => msg2.author.id === msg.author.id, {maxMatches: 1, time: 20e3})
      if (responses.size === 0) {
        msg.reply('nope')
      }

      console.log('responses', responses)

      var RockPaperScissors = require('rpslib')
      var result = RockPaperScissors(responses.first().content)

      msg.reply(result.message
      .replace('beats', '**beats**')
      .replace('loses', '__loses__')
      .replace('ties', '*ties*'))
    })
  }
}
