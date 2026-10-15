-- SWIFT MT Message Generator Database Schema
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS swift_mt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE swift_mt_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Message types table
CREATE TABLE IF NOT EXISTS message_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Swift messages table
CREATE TABLE IF NOT EXISTS swift_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message_reference VARCHAR(16) NOT NULL UNIQUE,
    message_type VARCHAR(10) NOT NULL DEFAULT 'MT103',
    sender_bic VARCHAR(11) NOT NULL,
    receiver_bic VARCHAR(11) NOT NULL,
    bank_operation_code VARCHAR(4) NOT NULL DEFAULT 'CRED',
    transaction_date DATE NOT NULL,
    currency VARCHAR(3) NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    ordering_customer TEXT NOT NULL,
    beneficiary TEXT NOT NULL,
    remittance_info VARCHAR(140),
    charges_code VARCHAR(3) NOT NULL DEFAULT 'SHA',
    generated_message TEXT NOT NULL,
    created_by VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_message_reference (message_reference),
    INDEX idx_message_type (message_type),
    INDEX idx_transaction_date (transaction_date),
    INDEX idx_created_at (created_at),
    CONSTRAINT chk_currency CHECK (LENGTH(currency) = 3),
    CONSTRAINT chk_amount CHECK (amount > 0),
    CONSTRAINT chk_charges_code CHECK (charges_code IN ('SHA', 'OUR', 'BEN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
