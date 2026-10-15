package com.swiftmt.app.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "message_types")
public class MessageType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 10)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Boolean enabled;

    public MessageType() {}

    public MessageType(String code, String name, String description, Boolean enabled) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.enabled = enabled;
    }

    @PrePersist
    protected void onCreate() {
        if (enabled == null) enabled = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
}
