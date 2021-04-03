package de.jh220.clearchatbot.commands;

import de.jh220.clearchatbot.interfaces.DefaultCommand;
import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.exceptions.InsufficientPermissionException;
import net.dv8tion.jda.api.hooks.ListenerAdapter;

import java.awt.*;

public class InviteCommand extends ListenerAdapter implements DefaultCommand {
    @Override
    public String getUsage() {
        return "cc invite";
    }

    @Override
    public boolean isCommand(String[] args) {
        if (args.length != 2) {
            return false;
        }
        if (!args[0].equalsIgnoreCase("cc")) {
            return false;
        }
        if (!args[1].equalsIgnoreCase("invite")) {
            return false;
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
            builder.setColor(new Color(0, 255, 255));
            builder.setTitle("ClearChat-Bot Invite");
            builder.setDescription("Here's an invite link so you too can get this bot on your server!");
            builder.addField("We are glad about any support.", "https://www.jh220.de/ccbot", false);
            event.getChannel().sendMessage(builder.build()).queue();
        } catch (InsufficientPermissionException exception) {
        }
    }
}