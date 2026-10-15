package com.swiftmt.app.service;

import com.swiftmt.app.dto.*;
import com.swiftmt.app.entity.MessageType;
import com.swiftmt.app.entity.SwiftMessage;
import com.swiftmt.app.repository.MessageTypeRepository;
import com.swiftmt.app.repository.SwiftMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SwiftMessageService {

    @Autowired
    private SwiftMessageRepository messageRepository;

    @Autowired
    private MessageTypeRepository messageTypeRepository;

    @Autowired
    private Mt103GeneratorService mt103GeneratorService;

    public String previewMessage(SwiftMessageRequest request) {
        return mt103GeneratorService.generate(request);
    }

    @Transactional
    public SwiftMessageResponse saveMessage(SwiftMessageRequest request, String createdBy) {
        if (messageRepository.existsByMessageReference(request.getMessageReference())) {
            throw new IllegalArgumentException("Message reference '" + request.getMessageReference() + "' already exists");
        }

        String generatedMessage = mt103GeneratorService.generate(request);
        LocalDate transactionDate = LocalDate.parse(request.getTransactionDate());

        SwiftMessage entity = new SwiftMessage();
        entity.setMessageReference(request.getMessageReference().trim());
        entity.setMessageType(request.getMessageType());
        entity.setSenderBic(request.getSenderBic().trim().toUpperCase());
        entity.setReceiverBic(request.getReceiverBic().trim().toUpperCase());
        entity.setBankOperationCode(request.getBankOperationCode());
        entity.setTransactionDate(transactionDate);
        entity.setCurrency(request.getCurrency().trim().toUpperCase());
        entity.setAmount(request.getAmount());
        entity.setOrderingCustomer(sanitize(request.getOrderingCustomer()));
        entity.setBeneficiary(sanitize(request.getBeneficiary()));
        entity.setRemittanceInfo(sanitize(request.getRemittanceInfo()));
        entity.setChargesCode(request.getChargesCode());
        entity.setGeneratedMessage(generatedMessage);
        entity.setCreatedBy(createdBy);

        SwiftMessage saved = messageRepository.save(entity);
        return toResponse(saved);
    }

    public SwiftMessageResponse getById(Long id) {
        SwiftMessage msg = messageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Message not found with id: " + id));
        return toResponse(msg);
    }

    public SwiftMessageResponse getByReference(String reference) {
        SwiftMessage msg = messageRepository.findByMessageReference(reference)
                .orElseThrow(() -> new IllegalArgumentException("Message not found with reference: " + reference));
        return toResponse(msg);
    }

    public PagedResponse<SwiftMessageResponse> searchMessages(
            String reference, String messageType, String fromDate, String toDate, int page, int size) {

        LocalDate from = (fromDate != null && !fromDate.isEmpty()) ? LocalDate.parse(fromDate) : null;
        LocalDate to = (toDate != null && !toDate.isEmpty()) ? LocalDate.parse(toDate) : null;
        String refParam = (reference != null && !reference.isEmpty()) ? reference : null;
        String typeParam = (messageType != null && !messageType.isEmpty()) ? messageType : null;

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<SwiftMessage> result = messageRepository.searchMessages(refParam, typeParam, from, to, pageable);

        return new PagedResponse<>(
                result.getContent().stream().map(this::toResponse).collect(Collectors.toList()),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        );
    }

    public DashboardStatsResponse getDashboardStats() {
        long total = messageRepository.count();
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        long today = messageRepository.countTodayMessages(startOfDay, endOfDay);
        List<MessageType> types = messageTypeRepository.findByEnabledTrue();

        return new DashboardStatsResponse(
                total,
                today,
                types.size(),
                types.stream().map(MessageType::getCode).collect(Collectors.toList())
        );
    }

    private String sanitize(String input) {
        if (input == null) return null;
        return input.replaceAll("[^A-Za-z0-9 /\\-?:().,'+\\n]", "").trim();
    }

    private SwiftMessageResponse toResponse(SwiftMessage msg) {
        SwiftMessageResponse resp = new SwiftMessageResponse();
        resp.setId(msg.getId());
        resp.setMessageReference(msg.getMessageReference());
        resp.setMessageType(msg.getMessageType());
        resp.setSenderBic(msg.getSenderBic());
        resp.setReceiverBic(msg.getReceiverBic());
        resp.setBankOperationCode(msg.getBankOperationCode());
        resp.setTransactionDate(msg.getTransactionDate());
        resp.setCurrency(msg.getCurrency());
        resp.setAmount(msg.getAmount());
        resp.setOrderingCustomer(msg.getOrderingCustomer());
        resp.setBeneficiary(msg.getBeneficiary());
        resp.setRemittanceInfo(msg.getRemittanceInfo());
        resp.setChargesCode(msg.getChargesCode());
        resp.setGeneratedMessage(msg.getGeneratedMessage());
        resp.setCreatedBy(msg.getCreatedBy());
        resp.setCreatedAt(msg.getCreatedAt());
        return resp;
    }
}
