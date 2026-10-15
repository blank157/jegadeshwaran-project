package com.swiftmt.app.config;

import com.swiftmt.app.dto.SwiftMessageRequest;
import com.swiftmt.app.entity.MessageType;
import com.swiftmt.app.entity.SwiftMessage;
import com.swiftmt.app.entity.User;
import com.swiftmt.app.repository.MessageTypeRepository;
import com.swiftmt.app.repository.SwiftMessageRepository;
import com.swiftmt.app.repository.UserRepository;
import com.swiftmt.app.service.Mt103GeneratorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final MessageTypeRepository messageTypeRepository;
    private final SwiftMessageRepository swiftMessageRepository;
    private final PasswordEncoder passwordEncoder;
    private final Mt103GeneratorService mt103GeneratorService;

    public DataInitializer(
            UserRepository userRepository,
            MessageTypeRepository messageTypeRepository,
            SwiftMessageRepository swiftMessageRepository,
            PasswordEncoder passwordEncoder,
            Mt103GeneratorService mt103GeneratorService) {
        this.userRepository = userRepository;
        this.messageTypeRepository = messageTypeRepository;
        this.swiftMessageRepository = swiftMessageRepository;
        this.passwordEncoder = passwordEncoder;
        this.mt103GeneratorService = mt103GeneratorService;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedMessageTypes();
        seedSampleMessages();
    }

    private void seedUsers() {
        User admin = userRepository.findByUsername("admin").orElse(null);
        if (admin == null) {
            admin = new User(null, "admin", passwordEncoder.encode("Admin@123"),
                    "System Administrator", "admin@swiftbank.com", "ADMIN", true);
            userRepository.save(admin);
            log.info("Created demo user: admin");
        } else if (!passwordEncoder.matches("Admin@123", admin.getPasswordHash())) {
            admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
            userRepository.save(admin);
            log.info("Updated password hash for demo user: admin");
        }

        User operator = userRepository.findByUsername("operator").orElse(null);
        if (operator == null) {
            operator = new User(null, "operator", passwordEncoder.encode("Operator@123"),
                    "SWIFT Operator", "operator@swiftbank.com", "USER", true);
            userRepository.save(operator);
            log.info("Created demo user: operator");
        } else if (!passwordEncoder.matches("Operator@123", operator.getPasswordHash())) {
            operator.setPasswordHash(passwordEncoder.encode("Operator@123"));
            userRepository.save(operator);
            log.info("Updated password hash for demo user: operator");
        }
    }

    private void seedMessageTypes() {
        if (messageTypeRepository.count() == 0) {
            messageTypeRepository.save(new MessageType("MT103", "Single Customer Credit Transfer",
                    "Used for international customer credit transfers", true));
            messageTypeRepository.save(new MessageType("MT202", "General Financial Institution Transfer",
                    "Used for bank-to-bank transfers", true));
            messageTypeRepository.save(new MessageType("MT700", "Issue of a Documentary Credit",
                    "Used for letter of credit issuance", true));
            messageTypeRepository.save(new MessageType("MT910", "Confirmation of Credit",
                    "Used to confirm credit to account", true));
            log.info("Seeded 4 SWIFT message types");
        }
    }

    private void seedSampleMessages() {
        if (swiftMessageRepository.count() == 0) {
            LocalDate today = LocalDate.now();

            SwiftMessageRequest req1 = new SwiftMessageRequest();
            req1.setMessageReference("REF20261012001");
            req1.setMessageType("MT103");
            req1.setSenderBic("DEUTDEDB");
            req1.setReceiverBic("CHASUS33");
            req1.setBankOperationCode("CRED");
            req1.setTransactionDate(today.toString());
            req1.setCurrency("USD");
            req1.setAmount(new BigDecimal("15000.00"));
            req1.setOrderingCustomer("/DE89370400440532013000\nJOHN DOE\n123 MAIN ST\nBERLIN GERMANY");
            req1.setBeneficiary("/US33CHAS0002012345678901\nJANE SMITH\n456 PARK AVE\nNEW YORK US");
            req1.setRemittanceInfo("INVOICE INV-2026-001 PAYMENT");
            req1.setChargesCode("SHA");

            SwiftMessage msg1 = new SwiftMessage();
            msg1.setMessageReference(req1.getMessageReference());
            msg1.setMessageType(req1.getMessageType());
            msg1.setSenderBic(req1.getSenderBic());
            msg1.setReceiverBic(req1.getReceiverBic());
            msg1.setBankOperationCode(req1.getBankOperationCode());
            msg1.setTransactionDate(today);
            msg1.setCurrency(req1.getCurrency());
            msg1.setAmount(req1.getAmount());
            msg1.setOrderingCustomer(req1.getOrderingCustomer());
            msg1.setBeneficiary(req1.getBeneficiary());
            msg1.setRemittanceInfo(req1.getRemittanceInfo());
            msg1.setChargesCode(req1.getChargesCode());
            msg1.setGeneratedMessage(mt103GeneratorService.generate(req1));
            msg1.setCreatedBy("admin");
            swiftMessageRepository.save(msg1);

            SwiftMessageRequest req2 = new SwiftMessageRequest();
            req2.setMessageReference("REF20261012002");
            req2.setMessageType("MT103");
            req2.setSenderBic("BARCGB22");
            req2.setReceiverBic("BNPAFRPP");
            req2.setBankOperationCode("CRED");
            req2.setTransactionDate(today.toString());
            req2.setCurrency("EUR");
            req2.setAmount(new BigDecimal("8500.50"));
            req2.setOrderingCustomer("/GB29NWBK60161331926819\nACME CORPORATION\n10 DOWNING ST\nLONDON UK");
            req2.setBeneficiary("/FR7614508059000000000000000\nDUPONT SARL\n25 RUE DE LA PAIX\nPARIS FRANCE");
            req2.setRemittanceInfo("CONTRACT PAYMENT Q4");
            req2.setChargesCode("OUR");

            SwiftMessage msg2 = new SwiftMessage();
            msg2.setMessageReference(req2.getMessageReference());
            msg2.setMessageType(req2.getMessageType());
            msg2.setSenderBic(req2.getSenderBic());
            msg2.setReceiverBic(req2.getReceiverBic());
            msg2.setBankOperationCode(req2.getBankOperationCode());
            msg2.setTransactionDate(today);
            msg2.setCurrency(req2.getCurrency());
            msg2.setAmount(req2.getAmount());
            msg2.setOrderingCustomer(req2.getOrderingCustomer());
            msg2.setBeneficiary(req2.getBeneficiary());
            msg2.setRemittanceInfo(req2.getRemittanceInfo());
            msg2.setChargesCode(req2.getChargesCode());
            msg2.setGeneratedMessage(mt103GeneratorService.generate(req2));
            msg2.setCreatedBy("operator");
            swiftMessageRepository.save(msg2);

            log.info("Seeded 2 sample MT103 messages");
        }
    }
}
