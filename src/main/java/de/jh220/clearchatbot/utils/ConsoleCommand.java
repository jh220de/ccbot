package de.jh220.clearchatbot.utils;

import de.jh220.clearchatbot.ClearChatBot;

import java.util.Scanner;

public class ConsoleCommand {
    public static void startReading() {
        new Thread(() -> {
            Scanner scanner = new Scanner(System.in);
            String input;
            while (true) {
                if (!scanner.hasNextLine()) {
                    return;
                }
                input = scanner.nextLine();

                if (input.equalsIgnoreCase("shutdown")) {
                    System.out.println("The bot will now shut down...");
                    ClearChatBot.getJDA().shutdownNow();
                    break;
                } else if (input.equalsIgnoreCase("reload")) {
                    System.out.println("Reloading...");
                    ClearChatBot.token = LoadToken.getToken();
                } else {
                    System.out.println("Unknown command.");
                }
            }
        }).start();
    }
}