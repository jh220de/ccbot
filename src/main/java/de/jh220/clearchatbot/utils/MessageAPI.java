package de.jh220.clearchatbot.utils;

import de.jh220.clearchatbot.ClearChatBot;
import de.jh220.clearchatbot.commands.ClearCommand;
import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.Permission;
import net.dv8tion.jda.api.entities.Message;
import net.dv8tion.jda.api.entities.TextChannel;
import net.dv8tion.jda.api.entities.User;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.exceptions.InsufficientPermissionException;

import java.awt.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class MessageAPI {
    public static void deleteMessages(MessageReceivedEvent event, int limit, User user) {
        new Thread(() -> {
            boolean working = true;
            while (working) {
                TextChannel channel = event.getTextChannel();
                List<Message> messages = new ArrayList<>();
                try {
                    for (Message message : channel.getHistoryBefore(event.getMessage(), limit).complete().getRetrievedHistory()) {
                        messages.add(message);
                    }
                } catch (InsufficientPermissionException exception) {
                    if (!exception.getPermission().equals(Permission.MESSAGE_HISTORY)) {
                        exception.printStackTrace();
                        return;
                    }
                    try {
                        EmbedBuilder builder = new EmbedBuilder();
                        builder.setColor(0xff3923);
                        builder.setTitle("Error: No permissions!");
                        builder.setDescription("The bot needs the permission to see the channel history!");
                        builder.addField("Permission »", exception.getPermission().getName(), false);
                        int selfDestructionTime = ClearChatBot.getSelfDestructionTime(event.getGuild().getId());
                        if (selfDestructionTime != -1) {
                            event.getMessage().delete().queueAfter(selfDestructionTime, TimeUnit.SECONDS);
                            event.getChannel().sendMessage(builder.build()).queue(message -> {
                                message.delete().queueAfter(selfDestructionTime, TimeUnit.SECONDS);
                            });
                        } else {
                            event.getChannel().sendMessage(builder.build()).queue();
                        }
                    } catch (InsufficientPermissionException exception2) { }
                    return;
                }
                OffsetDateTime offsetDateTime = OffsetDateTime.of(LocalDate.now().minusWeeks(2), LocalTime.NOON, ZoneOffset.UTC);
                for (Iterator<Message> iterator = messages.iterator(); iterator.hasNext(); ) {
                    Message message = iterator.next();
                    if (user != null && !message.getAuthor().getId().equals(user.getId())) {
                        iterator.remove();
                    } else if (message.isPinned()) {
                        iterator.remove();
                    } else if (message.getTimeCreated().isBefore(offsetDateTime)) {
                        iterator.remove();
                    }
                }

                if (messages.size() < 2) {
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
                        return;
                    } catch (InsufficientPermissionException exception) {
                    }
                }

                if (messages.isEmpty()) {
                    working = false;
                    return;
                }

                try {
                    channel.deleteMessages(messages).complete();
                } catch (InsufficientPermissionException exception) {
                    if (!exception.getPermission().equals(Permission.MESSAGE_HISTORY)) {
                        exception.printStackTrace();
                        return;
                    }
                    try {
                        EmbedBuilder builder = new EmbedBuilder();
                        builder.setColor(0xff3923);
                        builder.setTitle("Error: No permissions!");
                        builder.setDescription("The bot needs the permission to manage messages!");
                        builder.addField("Permission »", exception.getPermission().getName(), false);
                        int selfDestructionTime = ClearChatBot.getSelfDestructionTime(event.getGuild().getId());
                        if (selfDestructionTime != -1) {
                            event.getMessage().delete().queueAfter(selfDestructionTime, TimeUnit.SECONDS);
                            event.getChannel().sendMessage(builder.build()).queue(message -> {
                                message.delete().queueAfter(selfDestructionTime, TimeUnit.SECONDS);
                            });
                        } else {
                            event.getChannel().sendMessage(builder.build()).queue();
                        }
                    } catch (InsufficientPermissionException exception2) { }
                    return;
                }


                try {
                    EmbedBuilder builder = new EmbedBuilder();
                    builder.setColor(new Color(0, 255, 0));
                    builder.setTitle("ClearChat");
                    if (user != null) {
                        builder.setDescription("Successfully deleted last " + limit + " messages by user " + user.getAsMention() + "!");
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