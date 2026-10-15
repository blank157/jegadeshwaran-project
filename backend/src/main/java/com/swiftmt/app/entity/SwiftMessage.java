package com.swiftmt.app.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "swift_messages")
public class SwiftMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "message_reference", unique = true, nullable = false, length = 16)
    private String messageReference;

    @Column(name = "message_type", nullable = false, length = 10)
    private String messageType;

    @Column(name = "sender_bic", nullable = false, length = 11)
    private String senderBic;

    @Column(name = "receiver_bic", nullable = false, length = 11)
    private String receiverBic;

    @Column(name = "bank_operation_code", nullable = false, length = 4)
    private String bankOperationCode;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "ordering_customer", nullable = false, columnDefinition = "TEXT")
    private String orderingCustomer;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String beneficiary;

    @Column(name = "remittance_info", length = 140)
    private String remittanceInfo;

    @Column(name = "charges_code", nullable = false, length = 3)
    private String chargesCode;

    @Column(name = "generated_message", nullable = false, columnDefinition = "TEXT")
    private String generatedMessage;

    @Column(name = "created_by", length = 50)
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public SwiftMessage() {}

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (messageType == null) messageType = "MT103";
        if (bankOperationCode == null) bankOperationCode = "CRED";
    }

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
