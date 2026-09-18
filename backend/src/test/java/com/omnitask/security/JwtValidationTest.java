package com.omnitask.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPublicKey;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Date;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidationException;

class JwtValidationTest {
  private static final Instant NOW = Instant.parse("2026-09-18T12:00:00Z");
  private static final String SUBJECT = "57d7c426-bafe-4bc1-9f9d-9e720bad10a7";
  private static KeyPair keys;
  private static JwtDecoder decoder;

  @BeforeAll
  static void configure() throws Exception {
    var generator = KeyPairGenerator.getInstance("RSA");
    generator.initialize(2048);
    keys = generator.generateKeyPair();
    var unusedResource = new ByteArrayResource(new byte[0]);
    var properties =
        new JwtProperties(
            "omnitask", "omnitask-api", Duration.ofMinutes(15), unusedResource, unusedResource);
    decoder =
        new SecurityConfiguration()
            .jwtDecoder(
                (RSAPublicKey) keys.getPublic(), properties, Clock.fixed(NOW, ZoneOffset.UTC));
  }

  @Test
  void rejectsTokenAtItsExactExpirationInstant() throws Exception {
    String expired = signedToken(NOW);
    assertThatThrownBy(() -> decoder.decode(expired)).isInstanceOf(JwtValidationException.class);
  }

  @Test
  void acceptsTokenBeforeExpiration() throws Exception {
    assertThat(decoder.decode(signedToken(NOW.plusSeconds(1))).getSubject()).isEqualTo(SUBJECT);
  }

  @Test
  void rejectsTokenWithoutAudienceAsAValidationFailure() throws Exception {
    var claims =
        new JWTClaimsSet.Builder()
            .issuer("omnitask")
            .subject(SUBJECT)
            .issueTime(Date.from(NOW.minusSeconds(10)))
            .expirationTime(Date.from(NOW.plusSeconds(60)))
            .build();
    var token = new SignedJWT(new JWSHeader(JWSAlgorithm.RS256), claims);
    token.sign(new RSASSASigner(keys.getPrivate()));
    assertThatThrownBy(() -> decoder.decode(token.serialize()))
        .isInstanceOf(JwtValidationException.class);
  }

  private static String signedToken(Instant expiresAt) throws Exception {
    var claims =
        new JWTClaimsSet.Builder()
            .issuer("omnitask")
            .audience("omnitask-api")
            .subject(SUBJECT)
            .issueTime(Date.from(NOW.minusSeconds(10)))
            .notBeforeTime(Date.from(NOW.minusSeconds(10)))
            .expirationTime(Date.from(expiresAt))
            .build();
    var jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.RS256), claims);
    jwt.sign(new RSASSASigner(keys.getPrivate()));
    return jwt.serialize();
  }
}
