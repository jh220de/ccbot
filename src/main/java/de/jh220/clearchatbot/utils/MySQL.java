package de.jh220.clearchatbot.utils;

import java.sql.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

public class MySQL {
    private String HOST = "";
    private String DATABASE = "";
    private String USER = "";
    private String PASSWORD = "";
    private Connection connection;

    public MySQL(String host, String database, String user, String password) {
        this.HOST = host;
        this.DATABASE = database;
        this.USER = user;
        this.PASSWORD = password;
        connect();
    }

    public void connect() {
        System.out.println(new Timestamp(new Date().getTime()) + ": Versuche Verbindung mit MySQL herzustellen...");
        try {
            connection = DriverManager.getConnection("jdbc:mysql://" + HOST + ":3306/" + DATABASE + "?autoReconnect=true", USER, PASSWORD);
            System.out.println(new Timestamp(new Date().getTime()) + ": MySQL Verbindung wurde erfolgreich hergestellt.");
        } catch (SQLException exception) {
            System.out.println(new Timestamp(new Date().getTime()) + ": MySQL Verbindung wurde nicht hergestellt!");
        }
    }

    public void close() {
        try {
            if (connection != null) {
                connection.close();
                System.out.println(new Timestamp(new Date().getTime()) + ": MySQL Verbindung wurde erfolgreich hergestellt.");
            }
        } catch (SQLException exception) {
            System.out.println(new Timestamp(new Date().getTime()) + ": MySQL Verbindung konnte nicht beendet werden!");
            exception.printStackTrace();
        }
    }

    public boolean isConnected() {
        return this.connection != null;
    }

    public ResultSet executeQuery(final String query) {
        return executeQuery(query, null);
    }

    public ResultSet executeQuery(String query, Map<Integer, String> parameters) {
        if (!this.isConnected()) {
            return null;
        }
        try {
            PreparedStatement preparedStatement = this.connection.prepareStatement(query);
            if (parameters != null && parameters.size() > 0) {
                for (int parameterKey : parameters.keySet()) {
                    preparedStatement.setString(parameterKey, parameters.get(parameterKey));
                }
            }
            List<String> prefixes = new ArrayList<>();
            prefixes.add("update");
            prefixes.add("insert");
            prefixes.add("delete");
            prefixes.add("create");
            prefixes.add("alter");
            prefixes.add("drop");
            for (String startCommands : prefixes) {
                if (query.toLowerCase().startsWith(startCommands)) {
                    preparedStatement.execute();
                    return null;
                }
            }
            return preparedStatement.executeQuery();
        } catch (SQLException exception) {
            exception.printStackTrace();
            return null;
        }
    }
}