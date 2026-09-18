package com.omnitask.auth;

import com.omnitask.http.ApiException;
import com.omnitask.security.JwtProperties;
import com.omnitask.users.User;
import com.omnitask.users.UserRepository;
import java.time.Clock;
import java.time.temporal.ChronoUnit;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
  private final UserRepository users;
  private final PasswordEncoder passwords;
  private final JwtEncoder jwtEncoder;
  private final JwtProperties jwt;
  private final Clock clock;
  private final String dummyPasswordHash;

  public AuthService(
      UserRepository users,
      PasswordEncoder passwords,
      JwtEncoder jwtEncoder,
      JwtProperties jwt,
      Clock clock) {
    this.users = users;
    this.passwords = passwords;
    this.jwtEncoder = jwtEncoder;
    this.jwt = jwt;
    this.clock = clock;
    this.dummyPasswordHash = passwords.encode(java.util.UUID.randomUUID().toString());
  }

  @Transactional
  public UserResponse register(RegisterRequest request) {
    if (users.existsByEmail(request.email())) throw duplicateEmail();
    var now = clock.instant().truncatedTo(ChronoUnit.MICROS);
    User user = new User(request.email(), passwords.encode(request.password()), now);
    try {
      users.saveAndFlush(user);
    } catch (DataIntegrityViolationException exception) {
      // The unique constraint also protects concurrent registrations.
      throw duplicateEmail();
    }
    return new UserResponse(user.getId(), user.getEmail(), user.getCreatedAt());
  }

  @Transactional(readOnly = true)
  public TokenResponse login(LoginRequest request) {
    var user = users.findByEmail(request.email());
    String hash = user.map(User::getPasswordHash).orElse(dummyPasswordHash);
    boolean matches = passwords.matches(request.password(), hash);
    if (user.isEmpty() || !matches) {
      throw new ApiException(
          HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password");
    }
    var now = clock.instant();
    var claims =
        JwtClaimsSet.builder()
            .issuer(jwt.issuer())
            .audience(java.util.List.of(jwt.audience()))
            .subject(user.orElseThrow().getId().toString())
            .issuedAt(now)
            .notBefore(now)
            .expiresAt(now.plus(jwt.ttl()))
            .build();
    String token =
        jwtEncoder
            .encode(
                JwtEncoderParameters.from(JwsHeader.with(SignatureAlgorithm.RS256).build(), claims))
            .getTokenValue();
    return new TokenResponse(token, "Bearer", jwt.ttl().toSeconds());
  }

  private static ApiException duplicateEmail() {
    return new ApiException(
        HttpStatus.CONFLICT, "EMAIL_ALREADY_REGISTERED", "Email is already registered");
  }
}
