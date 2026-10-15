package com.swiftmt.app.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class SwiftMessageResponse {
    private Long id;
    private String messageReference;
    private String messageType;
    private String senderBic;
    private String receiverBic;
    private String bankOperationCode;
    private LocalDate transactionDate;
    private String currency;
    private BigDecimal amount;
    private String orderingCustomer;
    private String beneficiary;
    private String remittanceInfo;
    private String chargesCode;
    private String generatedMessage;
    private String createdBy;
    private LocalDateTime createdAt;

    public SwiftMessageResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMessageReference() { return messageReference; }
    public void setMessageReference(String messageReference) { this.messageReference = messageReference; }
    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }
    public String getSenderBic() { return senderBic; }
    public void setSenderBic(String senderBic) { this.senderBic = senderBic; }
    public String getReceiverBic() { return receiverBic; }
    public void setReceiverBic(String receiverBic) { this.receiverBic = receiverBic; }
    public String getBankOperationCode() { return bankOperationCode; }
    public void setBankOperationCode(String bankOperationCode) { this.bankOperationCode = bankOperationCode; }
    public LocalDate getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDate transactionDate) { this.transactionDate = transactionDate; }
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
    public String getGeneratedMessage() { return generatedMessage; }
    public void setGeneratedMessage(String generatedMessage) { this.generatedMessage = generatedMessage; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
