package com.swiftmt.app;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swiftmt.app.dto.LoginRequest;
import com.swiftmt.app.dto.SwiftMessageRequest;
import com.swiftmt.app.service.Mt103GeneratorService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;MODE=MySQL;DATABASE_TO_LOWER=TRUE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class SwiftMtApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private Mt103GeneratorService mt103GeneratorService;

    @Test
    void testMt103GenerationFormat() {
        SwiftMessageRequest req = new SwiftMessageRequest();
        req.setMessageReference("REF2026999");
        req.setMessageType("MT103");
        req.setBankOperationCode("CRED");
        req.setTransactionDate(LocalDate.now().toString());
        req.setCurrency("USD");
        req.setAmount(new BigDecimal("12500.50"));
        req.setSenderBic("DEUTDEDB");
        req.setReceiverBic("CHASUS33");
        req.setOrderingCustomer("/DE89370400440532013000\nJOHN DOE");
        req.setBeneficiary("/US33CHAS0002012345678901\nJANE SMITH");
        req.setRemittanceInfo("TEST INVOICE");
        req.setChargesCode("SHA");

        String generated = mt103GeneratorService.generate(req);
        assertThat(generated).contains(":20:REF2026999");
        assertThat(generated).contains(":23B:CRED");
        assertThat(generated).contains("USD12500,50");
        assertThat(generated).contains(":71A:SHA");
        assertThat(generated).contains("EDUCATIONAL PREVIEW");
    }

    @Test
    void testAuthenticationAndMessageLifecycle() throws Exception {
        // 1. Unauthenticated request should be forbidden/unauthorized
        mockMvc.perform(get("/api/messages"))
                .andExpect(status().isForbidden());

        // 2. Invalid login should return 401
        LoginRequest badLogin = new LoginRequest("admin", "WrongPassword");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));

        // 3. Valid login should return 200 with JWT token
        LoginRequest validLogin = new LoginRequest("admin", "Admin@123");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .path("data").path("token").asText();

        // 4. Create and save a new MT103 message
        SwiftMessageRequest createReq = new SwiftMessageRequest();
        createReq.setMessageReference("TESTREF001");
        createReq.setMessageType("MT103");
        createReq.setBankOperationCode("CRED");
        createReq.setTransactionDate(LocalDate.now().toString());
        createReq.setCurrency("EUR");
        createReq.setAmount(new BigDecimal("5000.00"));
        createReq.setSenderBic("DEUTDEDB");
        createReq.setReceiverBic("BNPAFRPP");
        createReq.setOrderingCustomer("/DE123456\nORDERING CORP");
        createReq.setBeneficiary("/FR987654\nBENEFICIARY SARL");
        createReq.setRemittanceInfo("PAYMENT REF 001");
        createReq.setChargesCode("OUR");

        mockMvc.perform(post("/api/messages")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.messageReference").value("TESTREF001"));

        // 5. Search by reference
        mockMvc.perform(get("/api/messages/search")
                        .param("reference", "TESTREF001")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currency").value("EUR"));
    }
}
