package de.jh220.clearchatbot.listeners;

import de.jh220.clearchatbot.ClearChatBot;
import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.entities.Guild;
import net.dv8tion.jda.api.entities.TextChannel;
import net.dv8tion.jda.api.events.guild.GuildJoinEvent;
import net.dv8tion.jda.api.events.guild.GuildLeaveEvent;
import net.dv8tion.jda.api.exceptions.InsufficientPermissionException;
import net.dv8tion.jda.api.hooks.ListenerAdapter;

import java.awt.*;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

public class GuildJoinLeaveListener extends ListenerAdapter {
    @Override
    public void onGuildJoin(GuildJoinEvent event) {
        String guild = event.getGuild().getName();
        String guildId = event.getGuild().getId();

        System.out.print(new Timestamp(new Date().getTime()) + ": [\u001B[33mINFO\u001B[0m] \"" + guild + "\" (" + guildId + ") » ");
        System.out.println("Bot joined the server.");

        List<Guild> servers = ClearChatBot.getJDA().getGuilds();
        System.out.println(new Timestamp(new Date().getTime()) + ": The bot is now on " + servers.size() + " servers.");

        TextChannel defaultChannel = event.getGuild().getDefaultChannel();
        if (defaultChannel == null) {
            return;
        }
        try {
            EmbedBuilder builder = new EmbedBuilder();
            builder.setColor(new Color(0, 255, 0));
            builder.setTitle("ClearChat Bot");
            builder.setDescription("Thanks for inviting the Discord bot to your server!\n" +
                    "See the commands of the bot with \"cc help\"!");
            builder.addField("If you also want to get this bot on your server, go on this website:", "https://www.jh220.de/ccbot", false);
            defaultChannel.sendMessage(builder.build()).queue();
        } catch (InsufficientPermissionException exception) {
        }
    }

    @Override
    public void onGuildLeave(GuildLeaveEvent event) {
        String guild = event.getGuild().getName();
        String guildId = event.getGuild().getId();

        System.out.print(new Timestamp(new Date().getTime()) + ": \"" + guild + "\" (" + guildId + ") » ");
        System.out.println("Bot left the server.");

        List<Guild> servers = ClearChatBot.getJDA().getGuilds();
        System.out.println(new Timestamp(new Date().getTime()) + ": The bot is now on " + servers.size() + " servers.");
    }
}