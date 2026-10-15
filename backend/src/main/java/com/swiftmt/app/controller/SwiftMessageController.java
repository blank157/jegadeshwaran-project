package com.swiftmt.app.controller;

import com.swiftmt.app.dto.*;
import com.swiftmt.app.service.SwiftMessageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messages")
public class SwiftMessageController {

    @Autowired
    private SwiftMessageService messageService;

    @GetMapping("/types")
    public ResponseEntity<ApiResponse<java.util.List<String>>> getMessageTypes() {
        try {
            DashboardStatsResponse stats = messageService.getDashboardStats();
            return ResponseEntity.ok(ApiResponse.success(stats.getMessageTypes()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        try {
            return ResponseEntity.ok(ApiResponse.success(messageService.getDashboardStats()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/preview")
    public ResponseEntity<ApiResponse<String>> previewMessage(
            @Valid @RequestBody SwiftMessageRequest request) {
        try {
            String preview = messageService.previewMessage(request);
            return ResponseEntity.ok(ApiResponse.success("Preview generated", preview));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SwiftMessageResponse>> saveMessage(
            @Valid @RequestBody SwiftMessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String username = userDetails != null ? userDetails.getUsername() : "system";
            SwiftMessageResponse response = messageService.saveMessage(request, username);
            return ResponseEntity.ok(ApiResponse.success("Message saved successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<SwiftMessageResponse>>> getMessages(
            @RequestParam(required = false) String reference,
            @RequestParam(required = false) String messageType,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            PagedResponse<SwiftMessageResponse> response =
                    messageService.searchMessages(reference, messageType, fromDate, toDate, page, size);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SwiftMessageResponse>> getMessageById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ApiResponse.success(messageService.getById(id)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<SwiftMessageResponse>> searchByReference(
            @RequestParam String reference) {
        try {
            return ResponseEntity.ok(ApiResponse.success(messageService.getByReference(reference)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
    }
}
