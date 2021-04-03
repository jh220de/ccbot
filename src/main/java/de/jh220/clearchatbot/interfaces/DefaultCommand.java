package de.jh220.clearchatbot.interfaces;

public interface DefaultCommand {
    String getUsage();

    boolean isCommand(String[] args);
}