// Description:
//   Allows hubot to pull random quotes of wikiquote
// 
// Dependencies:
//   wikiquoter installed through npm
// 
// Configuration:
//   none
// 
// Commands:
//   hubot quote <show> - says a random quote from the show
// 
// Author:
//   xmakina
//

module.exports = function(robot){
	var Wikiquoter = require('wikiquoter')
	var toMarkdown = require('to-markdown');
	var wq = new Wikiquoter()
	
	function formatToMarkdown(content, success){
		var formattedLines = []
		var lines = content.match(/[^\r\n]+/g);
		for(var l in lines){
			formattedLines.push(toMarkdown(lines[l]))
		}
		
		success(formattedLines.join('  \r\n'))
	}
	
	function saySomething(message){
		return function(content){
			formatToMarkdown(content, function(result){
				message.channel.send(result)
			})
		}
	}
	
	function logError(err){
		robot.logger.error(err)
	}
	
	robot.respond(/quote (.*)/i, function(msg){
		console.log('looking for', msg.match[1])
		wq.randomQuote(msg.match[1], 240, saySomething(msg), logError)
	})
}