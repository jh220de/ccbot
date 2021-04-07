package de.jh220.clearchatbot.commands;

import de.jh220.clearchatbot.ClearChatBot;
import de.jh220.clearchatbot.interfaces.DefaultCommand;
import de.jh220.clearchatbot.utils.MessageAPI;
import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.Permission;
import net.dv8tion.jda.api.entities.Member;
import net.dv8tion.jda.api.entities.User;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.exceptions.InsufficientPermissionException;
import net.dv8tion.jda.api.hooks.ListenerAdapter;

import java.util.List;
import java.util.concurrent.TimeUnit;

public class ClearCommand extends ListenerAdapter implements DefaultCommand {
    @Override
    public String getUsage() {
        return "cc clear [Amount] [Member]";
    }

    @Override
    public boolean isCommand(String[] args) {
        if (args.length >= 2 && args.length <= 4) {
            if (args[0].equalsIgnoreCase("cc") && args[1].equalsIgnoreCase("clear")) {
                return true;
            }
        }
        if (args.length == 1 && args[0].equalsIgnoreCase("!clearchat")) {
            return true;
        }
        return false;
    }

    private void sendInvalidNumberMessage(MessageReceivedEvent event) {
        try {
            EmbedBuilder builder = new EmbedBuilder();
            builder.setColor(0xff3923);
            builder.setTitle("Error: Invalid number!");
            builder.setDescription("Please enter a valid number!");
            builder.addField("User »", event.getAuthor().getAsMention(), false);
            builder.addField("Command »", getUsage(), false);
            builder.addField("Requirements »", "Only numbers in the range 3-100!", false);
            int selfDestructionTime = ClearChatBot.getSelfDestructionTime(event.getGuild().getId());
            if (selfDestructionTime != -1) {
                event.getMessage().delete().queueAfter(selfDestructionTime, TimeUnit.SECONDS);
                event.getChannel().sendMessage(builder.build()).queue(message -> {
                    message.delete().queueAfter(selfDestructionTime, TimeUnit.SECONDS);
                });
            } else {
                event.getChannel().sendMessage(builder.build()).queue();
            }
        } catch (InsufficientPermissionException exception) {
        }
    }

    private void sendNoMentionsMessage(MessageReceivedEvent event) {
        try {
            EmbedBuilder builder = new EmbedBuilder();
            builder.setColor(0xff3923);
            builder.setTitle("Error: Only Mentions!");
            builder.setDescription("Please provide a valid mention of the member!");
            builder.addField("User »", event.getAuthor().getAsMention(), false);
            builder.addField("Command »", getUsage(), false);
            int selfDestructionTime = ClearChatBot.getSelfDestructionTime(event.getGuild().getId());
            if (selfDestructionTime != -1) {
                event.getMessage().delete().queueAfter(selfDestructionTime, TimeUnit.SECONDS);
                event.getChannel().sendMessage(builder.build()).queue(message -> {
                    message.delete().queueAfter(selfDestructionTime, TimeUnit.SECONDS);
                });
            } else {
                event.getChannel().sendMessage(builder.build()).queue();
            }
        } catch (InsufficientPermissionException exception) {
        }
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

        if (!event.getMember().hasPermission(Permission.MESSAGE_MANAGE)) {
            ClearChatBot.sendNoPermissionMessage(event, getUsage(), Permission.MESSAGE_MANAGE);
            return;
        }

        int limit = 100;
        if (args.length == 3 || args.length == 4) {
            try {
                limit = Integer.parseInt(args[2]);
            } catch (NumberFormatException exception) {
                sendInvalidNumberMessage(event);
                return;
            }
            if (limit <= 2 || limit > 100) {
                sendInvalidNumberMessage(event);
                return;
            }
        }

        User user = null;
        if (args.length == 4) {
            List<Member> mentions = event.getMessage().getMentionedMembers();
            if (mentions.size() != 1) {
                sendNoMentionsMessage(event);
                return;
            }
            user = mentions.get(0).getUser();
        }

        MessageAPI.deleteMessages(event, limit, user);
        return;
    }
}