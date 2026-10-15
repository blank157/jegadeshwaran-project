package com.swiftmt.app.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class SwiftMessageRequest {

    @NotBlank(message = "Message reference is required")
    @Size(max = 16, message = "Message reference must not exceed 16 characters")
    @Pattern(regexp = "[A-Za-z0-9/\\-?:().,'+ ]{1,16}", message = "Message reference contains invalid characters")
    private String messageReference;

    @NotBlank(message = "Bank operation code is required")
    @Pattern(regexp = "CRED|CRTS|SPAY|SPRI|SSTD", message = "Invalid bank operation code")
    private String bankOperationCode;

    @NotNull(message = "Transaction date is required")
    private String transactionDate;

    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3, message = "Currency must be exactly 3 characters")
    @Pattern(regexp = "[A-Z]{3}", message = "Currency must be 3 uppercase letters")
    private String currency;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @DecimalMax(value = "999999999999999.99", message = "Amount exceeds maximum")
    private BigDecimal amount;

    @NotBlank(message = "Ordering customer is required")
    @Size(max = 140, message = "Ordering customer must not exceed 140 characters")
    private String orderingCustomer;

    @NotBlank(message = "Beneficiary is required")
    @Size(max = 140, message = "Beneficiary must not exceed 140 characters")
    private String beneficiary;

    @Size(max = 140, message = "Remittance information must not exceed 140 characters")
    private String remittanceInfo;

    @NotBlank(message = "Charges code is required")
    @Pattern(regexp = "SHA|OUR|BEN", message = "Charges code must be SHA, OUR, or BEN")
    private String chargesCode;

    @NotBlank(message = "Sender BIC is required")
    @Pattern(regexp = "[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?", message = "Invalid sender BIC format")
    private String senderBic;

    @NotBlank(message = "Receiver BIC is required")
    @Pattern(regexp = "[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?", message = "Invalid receiver BIC format")
    private String receiverBic;

    @NotBlank(message = "Message type is required")
    private String messageType;

    public SwiftMessageRequest() {}

    public String getMessageReference() { return messageReference; }
    public void setMessageReference(String messageReference) { this.messageReference = messageReference; }
    public String getBankOperationCode() { return bankOperationCode; }
    public void setBankOperationCode(String bankOperationCode) { this.bankOperationCode = bankOperationCode; }
    public String getTransactionDate() { return transactionDate; }
    public void setTransactionDate(String transactionDate) { this.transactionDate = transactionDate; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getOrderingCustomer() { return orderingCustomer; }
    public void setOrderingCustomer(String orderingCustomer) { this.orderingCustomer = orderingCustomer; }
    public String getBeneficiary() { return beneficiary; }
    public void setBeneficiary(String beneficiary) { this.beneficiary = beneficiary; }
    public String getRemittanceInfo() { return remittanceInfo; }
    public void setRemittanceInfo(String remittanceInfo) { this.remittanceInfo = remittanceInfo; }
    public String getChargesCode() { return chargesCode; }
    public void setChargesCode(String chargesCode) { this.chargesCode = chargesCode; }
    public String getSenderBic() { return senderBic; }
    public void setSenderBic(String senderBic) { this.senderBic = senderBic; }
    public String getReceiverBic() { return receiverBic; }
    public void setReceiverBic(String receiverBic) { this.receiverBic = receiverBic; }
    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }
}
