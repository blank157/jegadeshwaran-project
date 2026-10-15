-- Sample data for SWIFT MT Message Generator
USE swift_mt_db;

-- Insert message types
INSERT IGNORE INTO message_types (code, name, description, enabled) VALUES
('MT103', 'Single Customer Credit Transfer', 'Used for international customer credit transfers', TRUE),
('MT202', 'General Financial Institution Transfer', 'Used for bank-to-bank transfers', TRUE),
('MT700', 'Issue of a Documentary Credit', 'Used for letter of credit issuance', TRUE),
('MT910', 'Confirmation of Credit', 'Used to confirm credit to account', TRUE);

-- Insert demo users (passwords are BCrypt hashed; DataInitializer also verifies/seeds these on startup)
-- admin / Admin@123
-- operator / Operator@123
INSERT IGNORE INTO users (username, password_hash, full_name, email, role, enabled) VALUES
('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj7oK8HpVSNy', 'System Administrator', 'admin@swiftbank.com', 'ADMIN', TRUE),
('operator', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj7oK8HpVSNy', 'SWIFT Operator', 'operator@swiftbank.com', 'USER', TRUE);

-- Sample SWIFT messages
INSERT IGNORE INTO swift_messages (
    message_reference, message_type, sender_bic, receiver_bic,
    bank_operation_code, transaction_date, currency, amount,
    ordering_customer, beneficiary, remittance_info, charges_code,
    generated_message, created_by
) VALUES
(
    'REF20261012001',
    'MT103',
    'DEUTDEDB',
    'CHASUS33',
    'CRED',
    '2026-10-12',
    'USD',
    15000.00,
    '/DE89370400440532013000\nJOHN DOE\n123 MAIN ST\nBERLIN GERMANY',
    '/US33CHAS0002012345678901\nJANE SMITH\n456 PARK AVE\nNEW YORK US',
    'INVOICE INV-2026-001 PAYMENT',
    'SHA',
    '{1:F01DEUTDEDBXXXAXXX0000000000}\n{2:I103CHASUS33XXXAXXXN}\n{3:{108:REF20261012001}}\n{4:\n:20:REF20261012001\n:23B:CRED\n:32A:261012USD15000,00\n:50K:/DE89370400440532013000\nJOHN DOE\n123 MAIN ST\nBERLIN GERMANY\n:59:/US33CHAS0002012345678901\nJANE SMITH\n456 PARK AVE\nNEW YORK US\n:70:INVOICE INV-2026-001 PAYMENT\n:71A:SHA\n-}\n\n*** EDUCATIONAL PREVIEW — NOT VALIDATED FOR ACTUAL SWIFT NETWORK TRANSMISSION ***\n*** This message format is for demonstration purposes only. ***\n',
    'admin'
),
(
    'REF20261012002',
    'MT103',
    'BARCGB22',
    'BNPAFRPP',
    'CRED',
    '2026-10-12',
    'EUR',
    8500.50,
    '/GB29NWBK60161331926819\nACME CORPORATION\n10 DOWNING ST\nLONDON UK',
    '/FR7614508059000000000000000\nDUPONT SARL\n25 RUE DE LA PAIX\nPARIS FRANCE',
    'CONTRACT PAYMENT Q4',
    'OUR',
    '{1:F01BARCGB22XXXAXXX0000000000}\n{2:I103BNPAFRPPXXXAXXXN}\n{3:{108:REF20261012002}}\n{4:\n:20:REF20261012002\n:23B:CRED\n:32A:261012EUR8500,50\n:50K:/GB29NWBK60161331926819\nACME CORPORATION\n10 DOWNING ST\nLONDON UK\n:59:/FR7614508059000000000000000\nDUPONT SARL\n25 RUE DE LA PAIX\nPARIS FRANCE\n:70:CONTRACT PAYMENT Q4\n:71A:OUR\n-}\n\n*** EDUCATIONAL PREVIEW — NOT VALIDATED FOR ACTUAL SWIFT NETWORK TRANSMISSION ***\n*** This message format is for demonstration purposes only. ***\n',
    'operator'
);
