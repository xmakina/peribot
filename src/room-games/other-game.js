(function () {
  module.exports = runGame

  function runGame (content, gameState) {
    if (gameState.statistics === undefined) {
      gameState.statistics = {runAmount: 0}
    }

    console.log(`the other game is running ${gameState.statistics.runAmount}`)
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

    gameState.statistics.runAmount++

    return {
      message: `the other game is running: ${content}. The game has run ${gameState.statistics.runAmount} times`,
      gameState
    }
  }
})()
