package de.jh220.clearchatbot.commands;

import de.jh220.clearchatbot.ClearChatBot;
import de.jh220.clearchatbot.interfaces.DefaultCommand;
import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.exceptions.InsufficientPermissionException;
import net.dv8tion.jda.api.hooks.ListenerAdapter;

import java.awt.*;

public class HelpCommand extends ListenerAdapter implements DefaultCommand {
    @Override
    public String getUsage() {
        return "cc help";
    }

    @Override
    public boolean isCommand(String[] args) {
        if (args.length < 1) {
            return false;
        }
        if (!args[0].equalsIgnoreCase("cc")) {
            return false;
        }
        for (DefaultCommand command : ClearChatBot.getCommands()) {
            if (!(command instanceof HelpCommand)) {
                if (command.isCommand(args)) {
                    return false;
                }
            }
        }
        return true;
    }

    @Override
    public void onMessageReceived(MessageReceivedEvent event) {
        if (event.getAuthor().isBot()) {
            return;
        }
        String[] args = event.getMessage().getContentRaw().split(" ");
        if (!isCommand(args)) {
            return;
        }

        try {
            EmbedBuilder builder = new EmbedBuilder();
            builder.setColor(new Color(255, 255, 0));
            builder.setTitle("ClearChat Help");
            builder.setDescription("Detailed help of the ClearChat Bot commands.");
            builder.addField(new ClearCommand().getUsage() + " »", "Clears :recycle: the message history by a specified amount of messages.", false);
            builder.addField(new InviteCommand().getUsage() + " »", "Sends the bot's invite link to put it on your own server. :sparkles:", false);
            event.getChannel().sendMessage(builder.build()).queue();
        } catch (InsufficientPermissionException exception) {
        }
    }
}