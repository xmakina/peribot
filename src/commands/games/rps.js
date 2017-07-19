
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
          key: 'choice',
          label: 'choice',
          prompt: 'What action do you use?',
          type: 'string',
          infinite: false
        }
      ]
    })
  }

  async run (msg, args) {
    var RockPaperScissors = require('rpslib')
    var result = RockPaperScissors(args.choice)

    msg.reply(result.message
      .replace('beats', '**beats**')
      .replace('loses', '__loses__')
      .replace('ties', '*ties*'))
  }
}
