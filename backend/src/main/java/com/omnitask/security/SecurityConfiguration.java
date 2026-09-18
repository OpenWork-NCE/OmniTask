package com.omnitask.security;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.omnitask.http.ProblemResponses;
import jakarta.servlet.DispatcherType;
import java.io.IOException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Clock;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.converter.RsaKeyConverters;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.scrypt.SCryptPasswordEncoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtAudienceValidator;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtIssuerValidator;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.DefaultCorsProcessor;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(JwtProperties.class)
public class SecurityConfiguration {
  @Bean
  Clock clock() {
    return Clock.systemUTC();
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return new DelegatingPasswordEncoder(
        "scrypt", Map.of("scrypt", SCryptPasswordEncoder.defaultsForSpringSecurity_v5_8()));
  }

  @Bean
  RSAPublicKey publicKey(JwtProperties properties) throws IOException {
    try (var input = properties.publicKey().getInputStream()) {
      RSAPublicKey key = RsaKeyConverters.x509().convert(input);
      if (key == null || key.getModulus().bitLength() < 2048)
        throw new IllegalArgumentException("RSA key must have at least 2048 bits");
      return key;
    }
  }

  @Bean
  JwtEncoder jwtEncoder(JwtProperties properties, RSAPublicKey publicKey) throws IOException {
    try (var input = properties.privateKey().getInputStream()) {
      RSAPrivateKey privateKey = RsaKeyConverters.pkcs8().convert(input);
      if (privateKey == null || !privateKey.getModulus().equals(publicKey.getModulus()))
        throw new IllegalArgumentException("JWT key pair does not match");
      var key = new RSAKey.Builder(publicKey).privateKey(privateKey).build();
      return new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(key)));
    }
  }

  @Bean
  JwtDecoder jwtDecoder(RSAPublicKey publicKey, JwtProperties properties, Clock clock) {
    var decoder =
        NimbusJwtDecoder.withPublicKey(publicKey)
            .signatureAlgorithm(SignatureAlgorithm.RS256)
            .build();
    var timestamps = new JwtTimestampValidator(Duration.ZERO);
    timestamps.setClock(clock);
    OAuth2TokenValidator<Jwt> requiredClaims =
        token -> {
          boolean validSubject =
              token.getSubject() != null
                  && token
                      .getSubject()
                      .matches(
                          "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}");
          if (token.getExpiresAt() == null
              || token.getIssuedAt() == null
              || token.getIssuedAt().isAfter(clock.instant())
              || !token.getExpiresAt().isAfter(token.getIssuedAt())
              || !token.getExpiresAt().isAfter(clock.instant())
              || !validSubject) {
            return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token"));
          }
          return OAuth2TokenValidatorResult.success();
        };
    decoder.setJwtValidator(
        new DelegatingOAuth2TokenValidator<>(
            timestamps,
            new JwtIssuerValidator(properties.issuer()),
            new JwtAudienceValidator(properties.audience()),
            requiredClaims));
    return decoder;
  }

  @Bean
  WebSecurityCustomizer requestRejections(ProblemResponses problems) {
    return web ->
        web.requestRejectedHandler(
            (request, response, exception) ->
                problems.write(
                    request,
                    response,
                    HttpStatus.BAD_REQUEST,
                    "REQUEST_INVALID",
                    "Request cannot be processed"));
  }

  @Bean
  SecurityFilterChain securityFilterChain(
      HttpSecurity http, ProblemResponses problems, CorsFilter corsFilter) throws Exception {
    AuthenticationEntryPoint unauthenticated =
        (request, response, exception) -> {
          response.setHeader(HttpHeaders.WWW_AUTHENTICATE, "Bearer");
          problems.write(
              request,
              response,
              HttpStatus.UNAUTHORIZED,
              "UNAUTHENTICATED",
              "Authentication is required");
        };
    // Only explicit Bearer headers authenticate requests; cookies and sessions are never used.
    http.csrf(csrf -> csrf.disable())
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .requestCache(cache -> cache.disable())
        .logout(logout -> logout.disable())
        .addFilterBefore(
            corsFilter, org.springframework.security.web.authentication.logout.LogoutFilter.class)
        .authorizeHttpRequests(
            authorize ->
                authorize
                    .dispatcherTypeMatchers(DispatcherType.ERROR)
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login")
                    .permitAll()
                    .requestMatchers(
                        HttpMethod.GET,
                        "/actuator/health",
                        "/actuator/health/liveness",
                        "/actuator/health/readiness")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .exceptionHandling(
            errors ->
                errors
                    .authenticationEntryPoint(unauthenticated)
                    .accessDeniedHandler(
                        (request, response, exception) ->
                            problems.write(
                                request,
                                response,
                                HttpStatus.FORBIDDEN,
                                "ACCESS_DENIED",
                                "Access is denied")))
        .oauth2ResourceServer(
            resource ->
                resource.jwt(Customizer.withDefaults()).authenticationEntryPoint(unauthenticated));
    return http.build();
  }

  @Bean
  CorsFilter corsFilter(
      @Value("${app.cors.allowed-origins}") List<String> origins, ProblemResponses problems) {
    if (origins.stream().anyMatch(origin -> origin.contains("*")))
      throw new IllegalArgumentException("CORS origins must be explicit");
    var cors = new CorsConfiguration();
    cors.setAllowedOrigins(origins);
    cors.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    cors.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Correlation-ID"));
    cors.setExposedHeaders(List.of("X-Correlation-ID"));
    cors.setAllowCredentials(false);
    cors.setMaxAge(3600L);
    var source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", cors);
    var filter = new CorsFilter(source);
    filter.setCorsProcessor(
        new DefaultCorsProcessor() {
          @Override
          protected void rejectRequest(org.springframework.http.server.ServerHttpResponse response)
              throws IOException {
            response.setStatusCode(HttpStatus.FORBIDDEN);
            response.getHeaders().setContentType(MediaType.APPLICATION_PROBLEM_JSON);
            var servletResponse =
                ((org.springframework.http.server.ServletServerHttpResponse) response)
                    .getServletResponse();
            problems.write(
                null,
                servletResponse,
                HttpStatus.FORBIDDEN,
                "ACCESS_DENIED",
                "Origin is not allowed");
          }
        });
    return filter;
  }

  @Bean
  org.springframework.boot.web.servlet.FilterRegistrationBean<CorsFilter> corsRegistration(
      CorsFilter filter) {
    var registration = new org.springframework.boot.web.servlet.FilterRegistrationBean<>(filter);
    registration.setEnabled(false);
    return registration;
  }
}
