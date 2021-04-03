package de.jh220.clearchatbot.listeners;

import de.jh220.clearchatbot.ClearChatBot;
import de.jh220.clearchatbot.utils.LoadToken;
import net.dv8tion.jda.api.events.ReadyEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;

public class ReadyListener extends ListenerAdapter {
    @Override
    public void onReady(ReadyEvent event) {
        ClearChatBot.token = LoadToken.getToken();
    }
}