(function () {
  const {SettingProvider} = require('discord.js-commando')
  const mergeOptions = require('merge-options')
  const Guild = require('../models/guild')
  const mongoose = require('mongoose')

  class MongoDBProvider extends SettingProvider {
    constructor (options = {}) {
      super()

      mongoose.connect(process.env.MONGODB_URI)
      mongoose.Promise = Promise

      this.options = mergeOptions(options, {
        return_buffers: true
      })

      this.listeners = new Map()
    }

    // Initialises the provider by connecting to databases and/or caching all data in memory.
    // CommandoClient#setProvider will automatically call this once the client is ready.
    async init (client) {
      this.client = client

      this.listeners
        .set('commandPrefixChange', (guild, prefix) => this.set(guild, 'prefix', prefix))
        .set('commandStatusChange', (guild, command, enabled) => this.set(guild, `cmd:${command.name}`, enabled))
        .set('groupStatusChange', (guild, group, enabled) => this.set(guild, `grp:${group.name}`, enabled))
        .set('guildCreate', async guild => {
          const settings = await this.getAll(guild)
          if (!settings) return
          this.setupGuild(guild.id, settings)
        })

      for (const [event, listener] of this.listeners) {
        client.on(event, listener)
      }

      let guilds = await Guild.find()
      for (const index in guilds) {
        let guild = guilds[index]
        if (guild.id !== 'global' && !client.guilds.has(guild.id)) {
          continue
        }

        this.setupGuild(guild.id, guild.settings)
      }
    }

    // Removes all settings in a guild
    async clear (guild) {
      console.log('clear', guild.id)
      throw new Error('Not implemented')
    }

    // Destroys the provider, removing any event listeners
    destroy () {
      console.log('destroy')
      throw new Error('Not implemented')
    }

    // Obtains a setting for a guild
    get (guild, key, defValue) {
      console.log('get', guild.id, key, defValue)
      throw new Error('Not implemented')
    }

    // Removes a setting from a guild
    remove (guild, key) {
      console.log('remove', guild.id, key)
      throw new Error('Not implemented')
    }

    // Sets a setting for a guild
    async set (guild, key, val) {
      let guildObj = await Guild.findOne({id: guild.id})
      if (guildObj === null) {
        guildObj = new Guild({
          id: guild.id,
          settings: {}
        })
      }

      guildObj.settings[key.toLowerCase()] = val

      return await guildObj.save()
    }

    setupGuild (guild, settings) {
      if (typeof guild !== 'string') throw new TypeError('The guild must be a guild ID or "global".')
      guild = this.client.guilds.get(guild) || null

      if (typeof settings.prefix !== 'undefined') {
        if (guild) guild._commandPrefix = settings.prefix
        else this.client._commandPrefix = settings.prefix
      }

      for (const command of this.client.registry.commands.values()) this.setupGuildCommand(guild, command, settings)
      for (const group of this.client.registry.groups.values()) this.setupGuildGroup(guild, group, settings)
    }

    setupGuildCommand (guild, command, settings) {
      if (typeof settings[`cmd:${command.name}`] === 'undefined') return
      if (guild) {
        if (!guild._commandsEnabled) guild._commandsEnabled = {}
        guild._commandsEnabled[command.name] = settings[`cmd:${command.name}`]
      } else {
        command._globalEnabled = settings[`cmd:${command.name}`]
      }
    }

    setupGuildGroup (guild, group, settings) {
      console.log('setupGuildGroup', settings, group.id)
      if (typeof settings[`grp:${group.id}`] === 'undefined') return
      if (guild) {
        if (!guild._groupsEnabled) guild._groupsEnabled = {}
        guild._groupsEnabled[group.id] = settings[`grp:${group.id}`]
      } else {
        group._globalEnabled = settings[`grp:${group.id}`]
      }
    }
  }

  module.exports = MongoDBProvider
})()
