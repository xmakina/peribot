module.exports = function () {
  var subject = require('../../src/scripts/points/setReaction')

  function when_the_message_has_an_emoji () {
    var expected = ':emoji:'
    var sentMessage = ''
    var msg = {member: {
        roles: {
          exists: function (name, role) {
            return true
          }
        },
        match: ['', expected],
        reply: function (outbound) {
          sentMessage = outbound
        }
    }}

    var result = subject(msg)

    Assert
  }
}
