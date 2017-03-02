module.exports = function (content) {
  var toMarkdown = require('to-markdown')
  var formattedLines = []
  var lines = content.match(/[^\r\n]+/g)
  for (var l in lines) {
    formattedLines.push(toMarkdown(lines[l]))
  }

  return formattedLines.join('  \r\n')
}
