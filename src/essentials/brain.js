var Brain, EventEmitter, User, extend,
  extend1 = function (child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor () { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice

EventEmitter = require('events').EventEmitter

User = require('./user')

Brain = (function (superClass) {
  extend1(Brain, superClass)

  function Brain (robot) {
    this.data = {
      users: {},
      _private: {}
    }
    this.autoSave = true
    robot.on('running', (function (_this) {
      return function () {
        return _this.resetSaveInterval(5)
      }
    })(this))
  }

  Brain.prototype.set = function (key, value) {
    var pair
    if (key === Object(key)) {
      pair = key
    } else {
      pair = {}
      pair[key] = value
    }
    extend(this.data._private, pair)
    this.emit('loaded', this.data)
    return this
  }

  Brain.prototype.get = function (key) {
    var ref
    return (ref = this.data._private[key]) != null ? ref : null
  }

  Brain.prototype.remove = function (key) {
    if (this.data._private[key] != null) {
      delete this.data._private[key]
    }
    return this
  }

  Brain.prototype.save = function () {
    return this.emit('save', this.data)
  }

  Brain.prototype.close = function () {
    clearInterval(this.saveInterval)
    this.save()
    return this.emit('close')
  }

  Brain.prototype.setAutoSave = function (enabled) {
    return this.autoSave = enabled
  }

  Brain.prototype.resetSaveInterval = function (seconds) {
    if (this.saveInterval) {
      clearInterval(this.saveInterval)
    }
    return this.saveInterval = setInterval((function (_this) {
      return function () {
        if (_this.autoSave) {
          return _this.save()
        }
      }
    })(this), seconds * 1000)
  }

  Brain.prototype.mergeData = function (data) {
    var k
    for (k in data || {}) {
      this.data[k] = data[k]
    }
    return this.emit('loaded', this.data)
  }

  Brain.prototype.users = function () {
    return this.data.users
  }

  Brain.prototype.userForId = function (id, options) {
    var user
    user = this.data.users[id]
    if (!user) {
      user = new User(id, options)
      this.data.users[id] = user
    }
    if (options && options.room && (!user.room || user.room !== options.room)) {
      user = new User(id, options)
      this.data.users[id] = user
    }
    return user
  }

  Brain.prototype.userForName = function (name) {
    var k, lowerName, result, userName
    result = null
    lowerName = name.toLowerCase()
    for (k in this.data.users || {}) {
      userName = this.data.users[k]['name']
      if ((userName != null) && userName.toString().toLowerCase() === lowerName) {
        result = this.data.users[k]
      }
    }
    return result
  }

  Brain.prototype.usersForRawFuzzyName = function (fuzzyName) {
    var key, lowerFuzzyName, ref, results, user
    lowerFuzzyName = fuzzyName.toLowerCase()
    ref = this.data.users || {}
    results = []
    for (key in ref) {
      user = ref[key]
      if (user.name.toLowerCase().lastIndexOf(lowerFuzzyName, 0) === 0) {
        results.push(user)
      }
    }
    return results
  }

  Brain.prototype.usersForFuzzyName = function (fuzzyName) {
    var i, len, lowerFuzzyName, matchedUsers, user
    matchedUsers = this.usersForRawFuzzyName(fuzzyName)
    lowerFuzzyName = fuzzyName.toLowerCase()
    for (i = 0, len = matchedUsers.length; i < len; i++) {
      user = matchedUsers[i]
      if (user.name.toLowerCase() === lowerFuzzyName) {
        return [user]
      }
    }
    return matchedUsers
  }

  return Brain
})(EventEmitter)

extend = function () {
  var i, key, len, obj, source, sources, value
  obj = arguments[0], sources = 2 <= arguments.length ? slice.call(arguments, 1) : []
  for (i = 0, len = sources.length; i < len; i++) {
    source = sources[i]
    for (key in source) {
      if (!hasProp.call(source, key)) continue
      value = source[key]
      obj[key] = value
    }
  }
  return obj
}

module.exports = Brain
