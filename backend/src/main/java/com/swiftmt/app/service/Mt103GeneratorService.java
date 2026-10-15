package com.swiftmt.app.service;

import com.swiftmt.app.dto.SwiftMessageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class Mt103GeneratorService {

    private static final DateTimeFormatter SWIFT_DATE_FORMAT = DateTimeFormatter.ofPattern("yyMMdd");
    private static final int MAX_LINE_LENGTH = 65;

    public String generate(SwiftMessageRequest request) {
        validateRequest(request);

        String senderBic = padBic(request.getSenderBic());
        String receiverBic = padBic(request.getReceiverBic());
        String dateFormatted = formatSwiftDate(request.getTransactionDate());
        String amountFormatted = formatSwiftAmount(request.getAmount());

        StringBuilder sb = new StringBuilder();

        // Block 1: Basic Header
        sb.append("{1:F01").append(senderBic).append("0000000000}\n");

        // Block 2: Application Header
        sb.append("{2:I103").append(receiverBic).append("N}\n");

        // Block 3: User Header
        sb.append("{3:{108:").append(sanitizeField(request.getMessageReference())).append("}}\n");

        // Block 4: Text
        sb.append("{4:\n");
        sb.append(":20:").append(sanitizeField(request.getMessageReference())).append("\n");
        sb.append(":23B:").append(request.getBankOperationCode()).append("\n");
        sb.append(":32A:").append(dateFormatted)
          .append(request.getCurrency()).append(amountFormatted).append("\n");
        sb.append(":50K:").append(formatMultiline(sanitizeField(request.getOrderingCustomer()))).append("\n");
        sb.append(":59:").append(formatMultiline(sanitizeField(request.getBeneficiary()))).append("\n");
        if (request.getRemittanceInfo() != null && !request.getRemittanceInfo().isBlank()) {
            sb.append(":70:").append(sanitizeField(request.getRemittanceInfo())).append("\n");
        }
        sb.append(":71A:").append(request.getChargesCode()).append("\n");
        sb.append("-}\n");

        // Educational disclaimer
        sb.append("\n");
        sb.append("*** EDUCATIONAL PREVIEW — NOT VALIDATED FOR ACTUAL SWIFT NETWORK TRANSMISSION ***\n");
        sb.append("*** This message format is for demonstration purposes only. ***\n");

        return sb.toString();
    }

    private void validateRequest(SwiftMessageRequest request) {
        if (request.getMessageReference() == null || request.getMessageReference().isBlank()) {
            throw new IllegalArgumentException("Message reference is required");
        }
        if (request.getTransactionDate() == null || request.getTransactionDate().isBlank()) {
            throw new IllegalArgumentException("Transaction date is required");
        }
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }
        LocalDate date = LocalDate.parse(request.getTransactionDate());
        if (date.isBefore(LocalDate.now().minusDays(30))) {
            throw new IllegalArgumentException("Transaction date is too old (more than 30 days ago)");
        }
    }

    private String padBic(String bic) {
        if (bic == null) return "XXXXXXXXXX X";
        String padded = bic.length() == 8 ? bic + "XXX" : bic;
        return padded + "AXXX";
    }

    private String formatSwiftDate(String dateStr) {
        LocalDate date = LocalDate.parse(dateStr);
        return date.format(SWIFT_DATE_FORMAT);
    }

    private String formatSwiftAmount(BigDecimal amount) {
        // SWIFT amount: comma as decimal separator, no thousand separators
        String formatted = String.format("%.2f", amount);
        return formatted.replace(".", ",");
    }

    private String sanitizeField(String input) {
        if (input == null) return "";
        // Remove characters not in SWIFT character set
        return input.replaceAll("[^A-Za-z0-9 /\\-?:().,'+\\n\\r]", "").trim();
    }

    private String formatMultiline(String input) {
        if (input == null || input.isBlank()) return "";
        // Ensure each line starts on new line after the tag
        String[] lines = input.split("\n");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            if (!line.isEmpty()) {
                if (i == 0) {
                    sb.append(line);
                } else {
                    sb.append("\n").append(line);
                }
            }
        }
        return sb.toString();
    }
}
