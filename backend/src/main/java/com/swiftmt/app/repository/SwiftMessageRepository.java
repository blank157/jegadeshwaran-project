package com.swiftmt.app.repository;

import com.swiftmt.app.entity.SwiftMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface SwiftMessageRepository extends JpaRepository<SwiftMessage, Long> {

    Optional<SwiftMessage> findByMessageReference(String messageReference);

    boolean existsByMessageReference(String messageReference);

    @Query("SELECT m FROM SwiftMessage m WHERE " +
           "(:reference IS NULL OR LOWER(m.messageReference) LIKE LOWER(CONCAT('%', :reference, '%'))) AND " +
           "(:messageType IS NULL OR m.messageType = :messageType) AND " +
           "(:fromDate IS NULL OR m.transactionDate >= :fromDate) AND " +
           "(:toDate IS NULL OR m.transactionDate <= :toDate)")
    Page<SwiftMessage> searchMessages(
            @Param("reference") String reference,
            @Param("messageType") String messageType,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable);

    @Query("SELECT COUNT(m) FROM SwiftMessage m WHERE m.createdAt >= :startOfDay AND m.createdAt < :endOfDay")
    long countTodayMessages(@Param("startOfDay") java.time.LocalDateTime startOfDay,
                             @Param("endOfDay") java.time.LocalDateTime endOfDay);
}
