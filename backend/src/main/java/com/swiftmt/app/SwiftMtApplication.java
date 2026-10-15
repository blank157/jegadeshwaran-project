package com.swiftmt.app;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.net.InetSocketAddress;
import java.net.Socket;

@SpringBootApplication
public class SwiftMtApplication {

    private static final Logger log = LoggerFactory.getLogger(SwiftMtApplication.class);

    public static void main(String[] args) {
        configureDataSourceFallbackIfNeeded();
        SpringApplication.run(SwiftMtApplication.class, args);
    }

    private static void configureDataSourceFallbackIfNeeded() {
        // If explicit datasource URL is provided via env or system property, respect it
        if (System.getenv("SPRING_DATASOURCE_URL") != null || System.getProperty("spring.datasource.url") != null) {
            return;
        }
        String host = System.getenv().getOrDefault("MYSQL_HOST", "localhost");
        int port = Integer.parseInt(System.getenv().getOrDefault("MYSQL_PORT", "3306"));
        if (!isPortOpen(host, port, 600)) {
            log.warn("MySQL server not detected at {}:{} — activating persistent file-based MySQL-compatible store (./data/swift_mt_db). " +
                     "Start MySQL on {}:{} at any time to use live MySQL server.", host, port, host, port);
            System.setProperty("spring.datasource.url",
                    "jdbc:h2:file:./data/swift_mt_db;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;AUTO_SERVER=TRUE");
            System.setProperty("spring.datasource.driver-class-name", "org.h2.Driver");
            System.setProperty("spring.datasource.username", "root");
            System.setProperty("spring.datasource.password", "root");
            System.setProperty("spring.jpa.database-platform", "org.hibernate.dialect.H2Dialect");
        } else {
            log.info("MySQL server detected at {}:{} — connecting to MySQL swift_mt_db", host, port);
        }
    }

    private static boolean isPortOpen(String host, int port, int timeoutMs) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), timeoutMs);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
