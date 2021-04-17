# Clearchat-Bot | Programmed with the Discord Java API

## Description

Discord Verification Process pending.


### Introduction

At first glance a simple **ClearChat** bot you dont need, but at second glance a useful tool for moderating the deletion
of unnecessary messages on your Discord server. Take back _control of your Discord server_ now and add the bot to your
server today!

### Commands

- cc help (Get a useful overview of all commands of the bot!)
- cc invite (Send the bot's invite link to the chat!)
- cc clear [Amount] [User] (Delete a certain number of messages in the channel or leave the number blank and delete the
  last 100 messages!)

### Invite

Invite this bot [to your server now](https://www.jh220.de/ccbot/) and enjoy a worry-free day!

## Vote

Vote for us now at [top.gg](https://top.gg/bot/787789079227006976)

## Issues

### Known Issues

```
net.dv8tion.jda.api.exceptions.InsufficientPermissionException: Must have MESSAGE_MANAGE in order to bulk delete messages in this channel regardless of author.
        at net.dv8tion.jda.internal.entities.AbstractChannelImpl.checkPermission(AbstractChannelImpl.java:320)
        at net.dv8tion.jda.internal.entities.TextChannelImpl.deleteMessagesByIds(TextChannelImpl.java:150)
        at net.dv8tion.jda.internal.entities.TextChannelImpl.deleteMessages(TextChannelImpl.java:141)
        at de.jh220.clearchatbot.utils.MessageAPI.lambda$deleteMessages$4(MessageAPI.java:97)
        at java.lang.Thread.run(Thread.java:748)
```
```
Exception in thread "Thread-31" java.lang.IllegalArgumentException: Must provide at least 2 or at most 100 messages to be deleted.
        at net.dv8tion.jda.internal.entities.TextChannelImpl.deleteMessagesByIds(TextChannelImpl.java:152)
        at net.dv8tion.jda.internal.entities.TextChannelImpl.deleteMessages(TextChannelImpl.java:141)
        at de.jh220.clearchatbot.utils.MessageAPI.lambda$deleteMessages$4(MessageAPI.java:97)
        at java.lang.Thread.run(Thread.java:748)
```

### Report

For any bugs, please [create an issue](https://github.com/JH220/discord-clearchatbot/issues).
