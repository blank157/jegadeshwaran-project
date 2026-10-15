package com.swiftmt.app.dto;

import java.util.List;

public class DashboardStatsResponse {
    private long totalMessages;
    private long todayMessages;
    private long availableMessageTypes;
    private List<String> messageTypes;

    public DashboardStatsResponse() {}

    public DashboardStatsResponse(long totalMessages, long todayMessages, long availableMessageTypes, List<String> messageTypes) {
        this.totalMessages = totalMessages;
        this.todayMessages = todayMessages;
        this.availableMessageTypes = availableMessageTypes;
        this.messageTypes = messageTypes;
    }

    public long getTotalMessages() { return totalMessages; }
    public void setTotalMessages(long totalMessages) { this.totalMessages = totalMessages; }
    public long getTodayMessages() { return todayMessages; }
    public void setTodayMessages(long todayMessages) { this.todayMessages = todayMessages; }
    public long getAvailableMessageTypes() { return availableMessageTypes; }
    public void setAvailableMessageTypes(long availableMessageTypes) { this.availableMessageTypes = availableMessageTypes; }
    public List<String> getMessageTypes() { return messageTypes; }
    public void setMessageTypes(List<String> messageTypes) { this.messageTypes = messageTypes; }
}
