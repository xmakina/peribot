(function () {
  module.exports = runGame

  function runGame (msg) {
    console.log(`your game is running`)
    msg.reply(`the game is running: ${msg.content}`)
  }
})()
