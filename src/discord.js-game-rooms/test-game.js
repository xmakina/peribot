(function () {
  module.exports = runGame

  function runGame (content, gameState) {
    if (gameState.count === undefined) {
      gameState.count = 0
    }
    console.log(`your game is running ${gameState.count}`)
    if (content === 'quit') {
      return false
    }

    if (content === 'no quit') {
      return 'false'
    }

    if (content === 'error') {
      throw new Error('An error was summoned!')
    }

    if (content === 'null') {
      return
    }

    gameState.count++

    return {
      message: `the game is running: ${content}. The game has run ${gameState.count} times`,
      gameState
    }
  }
})()
