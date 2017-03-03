
var commando = require('discord.js-commando')

module.exports = class GetQuoteCommand extends commando.Command {
  constructor (client) {
    super(client, {
      name: 'quote-show',
      aliases: ['quote'],
      group: 'memes',
      memberName: 'quote',
      description: 'Quotes a show',
      details: 'Reaches out to wikiquote and gets a show. As stable as wikiquote is consistent.',
      examples: ['quote-show Steven Universe'],

      args: [
        {
          key: 'showName',
          label: 'show',
          prompt: 'What show do you want a quote from?',
          type: 'string',
          infinite: false
        }
      ]
    })
  }

  async run (msg, args) {
    var Wikiquoter = require('wikiquoter')
    var formatToMarkdown = require('../../utils/formatToMarkdown.js')
    var wq = new Wikiquoter()
    wq.randomQuote(args.showName, 1000, (quote) => { msg.reply(formatToMarkdown(quote)) }, console.error)
  }
}
