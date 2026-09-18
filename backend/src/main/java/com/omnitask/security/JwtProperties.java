package com.omnitask.security;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.core.io.Resource;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties("app.jwt")
public record JwtProperties(
    @NotBlank String issuer,
    @NotBlank String audience,
    @NotNull Duration ttl,
    @NotNull Resource publicKey,
    @NotNull Resource privateKey) {
  public JwtProperties {
    if (ttl != null
        && (ttl.compareTo(Duration.ofMinutes(1)) < 0
            || ttl.compareTo(Duration.ofMinutes(30)) > 0)) {
      throw new IllegalArgumentException("JWT lifetime must be between 1 and 30 minutes");
    }
  }
}
