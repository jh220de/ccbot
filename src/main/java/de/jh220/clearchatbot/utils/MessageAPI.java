package de.jh220.clearchatbot.utils;

import de.jh220.clearchatbot.ClearChatBot;
import de.jh220.clearchatbot.commands.ClearCommand;
import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.entities.Member;
import net.dv8tion.jda.api.entities.Message;
import net.dv8tion.jda.api.entities.TextChannel;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.exceptions.InsufficientPermissionException;

import java.awt.*;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class MessageAPI {
    public static void deleteMessages(TextChannel channel, int limit) {
        new Thread(() -> {
            boolean working = true;
            while (working) {
                List<Message> messages = channel.getHistory().retrievePast(limit).complete();
                messages.removeIf(message -> message.isPinned());

                if (messages.isEmpty()) {
                    working = false;
                    return;
                }

                channel.deleteMessages(messages).complete();
                working = false;
                return;
            }
        }).start();
    }

    public static void deleteMessages(MessageReceivedEvent event, int limit, Member member) {
        new Thread(() -> {
            boolean working = true;
            while (working) {
                TextChannel channel = event.getTextChannel();
                List<Message> messages = new ArrayList<>();
                for (Message message : channel.getHistoryBefore(event.getMessage(), limit).complete().getRetrievedHistory()) {
                    messages.add(message);
                }
                if (member != null) {
                    messages.removeIf(message -> !message.getMember().getId().equals(member.getId()));
                }
                messages.removeIf(message -> message.isPinned());

                if (messages.size() < 2 && member != null) {
                    try {
                        EmbedBuilder builder = new EmbedBuilder();
                        builder.setColor(0xff3923);
                        builder.setTitle("Error: Not enough messages!");
                        builder.setDescription("The specified user must have written at least two messages in the channel!");
                        builder.addField("User »", event.getAuthor().getAsMention(), false);
                        builder.addField("Command »", new ClearCommand().getUsage(), false);
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

                if (messages.isEmpty()) {
                    working = false;
                    return;
                }

                channel.deleteMessages(messages).complete();

                try {
                    EmbedBuilder builder = new EmbedBuilder();
                    builder.setColor(new Color(0, 255, 0));
                    builder.setTitle("ClearChat");
                    if (member != null) {
                        builder.setDescription("Successfully deleted last " + limit + " messages by user " + member.getAsMention() + "!");
                    } else {
                        builder.setDescription("Successfully deleted last " + limit + " messages" + "!");
                    }
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

                working = false;
                return;
            }
        }).start();
    }
}