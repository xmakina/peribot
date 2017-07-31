(function () {
  const details = {
    players: {
      min: 1,
      max: 4,
      recommended: 2
    },
    title: 'Test Game',
    description: 'Play a game for fun!',
    invite: 'Would you like to play a game?',
    intro: 'Type Start to get started!',
    rules: 'none'
  }

  module.exports = {run, details, init}

  function init (players) {
    let gameState = {
      players
    }

    gameState.currentPlayer = Math.floor(Math.random() * gameState.players.length)
    return {
      message: `${gameState.players[gameState.currentPlayer]} is the start player`,
      gameState
    }
  }

  function run (playerId, content, gameState) {
    if (gameState.count === undefined) {
      gameState.count = 0
    }

    console.log(`your game is running ${gameState.count}`)

    if (playerId !== gameState.players[gameState.currentPlayer]) {
      return {
        message: `${playerId}, it's not your turn yet`,
        gameState
      }
    }

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

    gameState.currentPlayer++
    if (gameState.currentPlayer >= gameState.players.length) {
      gameState.currentPlayer = 0
    }

    return {
      message: `the game is running: ${content}. The game has run ${gameState.count} times. It's ${gameState.players[gameState.currentPlayer]} turn.`,
      gameState
    }
  }
})()
