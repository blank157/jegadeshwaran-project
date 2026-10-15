package com.swiftmt.app.repository;

import com.swiftmt.app.entity.MessageType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageTypeRepository extends JpaRepository<MessageType, Long> {
    List<MessageType> findByEnabledTrue();
}
