(function () {
  const details = {
    players: {
      min: 2,
      max: 6,
      recommended: 4
    },
    title: 'Other Game',
    description: 'Play the other game for fun!',
    invite: 'Let\'s do something else?',
    intro: 'You can quit by typing quit at anytime',
    rules: 'http://www.google.com/?q=you%20do%20it'
  }

  module.exports = {run, details, init}

  function init (players) {
    return {
      players,
      currentPlayer: 0
    }
  }

  function run (playerId, content, gameState) {
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
