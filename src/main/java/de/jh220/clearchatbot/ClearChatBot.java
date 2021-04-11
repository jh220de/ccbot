package de.jh220.clearchatbot;

import de.jh220.clearchatbot.commands.ClearCommand;
import de.jh220.clearchatbot.commands.HelpCommand;
import de.jh220.clearchatbot.commands.InviteCommand;
import de.jh220.clearchatbot.interfaces.DefaultCommand;
import de.jh220.clearchatbot.listeners.GuildJoinLeaveListener;
import de.jh220.clearchatbot.listeners.ReadyListener;
import de.jh220.clearchatbot.utils.LoadToken;
import de.jh220.clearchatbot.utils.MySQL;
import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.JDABuilder;
import net.dv8tion.jda.api.Permission;
import net.dv8tion.jda.api.entities.Activity;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.exceptions.InsufficientPermissionException;

import javax.security.auth.login.LoginException;
import java.awt.*;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class ClearChatBot {
    public static String token;
    private static JDA instance;
    private static MySQL mySQL;
    private static List<DefaultCommand> commands;

    public static void main(String[] args) throws LoginException {
        System.out.println("Starting bot...");
        long start = System.currentTimeMillis();

        token = LoadToken.getToken(); // Just provide your token here
        JDABuilder builder = JDABuilder.createDefault(token);
        builder.setActivity(Activity.watching("cc help | ChatClear Bot!"));

        builder.addEventListeners(new GuildJoinLeaveListener());
        builder.addEventListeners(new ReadyListener());

        commands = new ArrayList<>();
        commands.add(new HelpCommand());
        commands.add(new InviteCommand());
        commands.add(new ClearCommand());

        for (DefaultCommand command : commands) {
            builder.addEventListeners(command);
        }

        instance = builder.build();

        loadMySQL();

        long time = System.currentTimeMillis() - start;
        System.out.println("Bot started! Startup process took " + time + " ms.");
    }

    private static void loadMySQL() {
        mySQL = new MySQL("localhost", "discord_clearchatbot", "discord", System.getenv("MYSQL_DISCORD_PASSWORD"));
        mySQL.executeQuery("CREATE TABLE IF NOT EXISTS guilds(id VARCHAR(18), name VARCHAR(100))");
    }

    public static JDA getJDA() {
        return instance;
    }

    public static List<DefaultCommand> getCommands() {
        return commands;
    }

    public static void sendNoPermissionMessage(MessageReceivedEvent event, String command, Permission permission) {
        try {
            EmbedBuilder builder = new EmbedBuilder();
            builder.setColor(new Color(255, 57, 35));
            builder.setTitle("Error: Insufficient permissions");
            builder.setDescription("You need the permission " + permission.getName());
            builder.addField("User » ", event.getAuthor().getAsMention(), false);
            builder.addField("Permission » ", permission.getName(), false);
            builder.addField("Command » ", command, false);
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

    public static int getSelfDestructionTime(String guildId) {
        //This will delete sent messages from the bot.
        //Notice that the Help and Invite commands are not affected by this.
        return -1;
    }
}