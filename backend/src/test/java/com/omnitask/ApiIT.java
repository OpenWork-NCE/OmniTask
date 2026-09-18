package com.omnitask;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.mysql.MySQLContainer;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class ApiIT {
  @Container static final MySQLContainer MYSQL = new MySQLContainer("mysql:8.4.11");
  static final KeyPair KEYS = keys();
  @Autowired MockMvc mvc;
  @Autowired ObjectMapper json;
  @Autowired JdbcTemplate jdbc;

  @DynamicPropertySource
  static void properties(DynamicPropertyRegistry registry) throws Exception {
    Path directory = Files.createTempDirectory("omnitask-test-keys-");
    Path privateKey = directory.resolve("private.pem");
    Path publicKey = directory.resolve("public.pem");
    Files.writeString(privateKey, pem("PRIVATE KEY", KEYS.getPrivate().getEncoded()));
    Files.writeString(publicKey, pem("PUBLIC KEY", KEYS.getPublic().getEncoded()));
    registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
    registry.add("spring.datasource.username", MYSQL::getUsername);
    registry.add("spring.datasource.password", MYSQL::getPassword);
    registry.add("app.jwt.private-key", () -> privateKey.toUri().toString());
    registry.add("app.jwt.public-key", () -> publicKey.toUri().toString());
  }

  @Test
  void registrationNormalizesEmailAndDoesNotExposePassword() throws Exception {
    String email = UUID.randomUUID() + "@EXAMPLE.COM";
    mvc.perform(
            post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    json.writeValueAsString(
                        Map.of("email", " " + email + " ", "password", "Correct horse battery!"))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.email").value(email.toLowerCase()))
        .andExpect(jsonPath("$.id").isNotEmpty())
        .andExpect(jsonPath("$.passwordHash").doesNotExist());
    String hash =
        jdbc.queryForObject(
            "select password_hash from users where email = ?", String.class, email.toLowerCase());
    assertThat(hash).isNotEqualTo("Correct horse battery!").startsWith("{scrypt}");
  }

  @Test
  void duplicateRegistrationReturnsConflict() throws Exception {
    String email = email();
    register(email);
    mvc.perform(
            post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    json.writeValueAsString(
                        Map.of(
                            "email", email.toUpperCase(), "password", "Correct horse battery!"))))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.code").value("EMAIL_ALREADY_REGISTERED"));
  }

  @Test
  void invalidCredentialsReturnSanitizedProblem() throws Exception {
    String email = email();
    register(email);
    for (String account : new String[] {email, email()}) {
      mvc.perform(
              post("/api/auth/login")
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(
                      json.writeValueAsString(
                          Map.of("email", account, "password", "Wrong password!"))))
          .andExpect(status().isUnauthorized())
          .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
          .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"))
          .andExpect(jsonPath("$.correlationId").isNotEmpty())
          .andExpect(jsonPath("$.trace").doesNotExist());
    }
  }

  @Test
  void taskLifecyclePersistsServerOwnedTimestampsAndVersion() throws Exception {
    String token = account();
    JsonNode task = create(token, "  Prepare report  ", "TODO");
    assertThat(task.path("title").asString()).isEqualTo("Prepare report");
    assertThat(task.path("createdAt").asString()).endsWith("Z");
    assertThat(task.path("updatedAt").asString()).isEqualTo(task.path("createdAt").asString());
    String id = task.path("id").asString();
    mvc.perform(
            put("/api/tasks/" + id)
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    "{\"title\":\"Publish report\",\"description\":null,\"status\":\"DONE\",\"version\":0}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.version").value(1))
        .andExpect(jsonPath("$.status").value("DONE"));
    mvc.perform(get("/api/tasks").header("Authorization", bearer(token)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalElements").value(1))
        .andExpect(jsonPath("$.items[0].title").value("Publish report"));
    mvc.perform(delete("/api/tasks/" + id).header("Authorization", bearer(token)))
        .andExpect(status().isNoContent());
    mvc.perform(delete("/api/tasks/" + id).header("Authorization", bearer(token)))
        .andExpect(status().isNotFound());
    mvc.perform(get("/api/tasks").header("Authorization", bearer(token)))
        .andExpect(jsonPath("$.totalElements").value(0));
  }

  @Test
  void anotherUserCannotListUpdateOrDeleteOwnedTasks() throws Exception {
    String alice = account();
    String bob = account();
    String id = create(alice, "Private task", "TODO").path("id").asString();
    mvc.perform(get("/api/tasks").header("Authorization", bearer(bob)))
        .andExpect(jsonPath("$.totalElements").value(0));
    mvc.perform(
            put("/api/tasks/" + id)
                .header("Authorization", bearer(bob))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Stolen\",\"status\":\"DONE\",\"version\":0}"))
        .andExpect(status().isNotFound());
    mvc.perform(delete("/api/tasks/" + id).header("Authorization", bearer(bob)))
        .andExpect(status().isNotFound());
    mvc.perform(get("/api/tasks").header("Authorization", bearer(alice)))
        .andExpect(jsonPath("$.items[0].title").value("Private task"));
  }

  @Test
  void staleUpdateReturnsConflictWithoutOverwritingData() throws Exception {
    String token = account();
    String id = create(token, "Original", "TODO").path("id").asString();
    String body = "{\"title\":\"First edit\",\"status\":\"DONE\",\"version\":0}";
    mvc.perform(
            put("/api/tasks/" + id)
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
        .andExpect(status().isOk());
    mvc.perform(
            put("/api/tasks/" + id)
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body.replace("First edit", "Lost edit")))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.code").value("TASK_VERSION_CONFLICT"));
    mvc.perform(get("/api/tasks").header("Authorization", bearer(token)))
        .andExpect(jsonPath("$.items[0].title").value("First edit"));
  }

  @Test
  void searchAndStatusApplyBeforePagination() throws Exception {
    String token = account();
    create(token, "Quarterly report", "TODO");
    create(token, "Monthly report", "DONE");
    create(token, "Other", "TODO");
    mvc.perform(
            get("/api/tasks")
                .param("q", "REPORT")
                .param("status", "TODO")
                .param("size", "1")
                .header("Authorization", bearer(token)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalElements").value(1))
        .andExpect(jsonPath("$.items[0].title").value("Quarterly report"));
  }

  @Test
  void invalidTaskAndUnknownOwnerAreRejected() throws Exception {
    String token = account();
    for (String body :
        new String[] {
          "{\"title\":\"   \"}",
          "{\"title\":\"Valid\",\"status\":\"INVALID\"}",
          "{\"title\":\"Valid\",\"ownerId\":\"forged\"}"
        }) {
      mvc.perform(
              post("/api/tasks")
                  .header("Authorization", bearer(token))
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(body))
          .andExpect(status().isBadRequest())
          .andExpect(content().contentTypeCompatibleWith("application/problem+json"));
    }
  }

  @Test
  void missingAndMalformedTokensCannotAccessTasks() throws Exception {
    mvc.perform(get("/api/tasks"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
    mvc.perform(get("/api/tasks").header("Authorization", "Bearer invalid"))
        .andExpect(status().isUnauthorized())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.trace").doesNotExist());
  }

  @org.junit.jupiter.params.ParameterizedTest
  @org.junit.jupiter.params.provider.ValueSource(
      strings = {
        "expired",
        "issuer",
        "audience",
        "signature",
        "algorithm",
        "future",
        "subject",
        "missing-expiration",
        "missing-audience",
        "missing-issuer",
        "missing-issued-at",
        "missing-subject"
      })
  void rejectsUntrustedJwtClaims(String fault) throws Exception {
    java.time.Instant now = java.time.Instant.now();
    com.nimbusds.jwt.JWTClaimsSet.Builder claims =
        new com.nimbusds.jwt.JWTClaimsSet.Builder()
            .issuer(fault.equals("issuer") ? "attacker" : "omnitask")
            .audience(fault.equals("audience") ? "other-api" : "omnitask-api")
            .subject(fault.equals("subject") ? "not-a-uuid" : UUID.randomUUID().toString())
            .issueTime(java.util.Date.from(now.minusSeconds(10)))
            .notBeforeTime(
                java.util.Date.from(
                    fault.equals("future") ? now.plusSeconds(600) : now.minusSeconds(10)));
    if (fault.equals("missing-audience")) claims.audience((java.util.List<String>) null);
    if (fault.equals("missing-issuer")) claims.issuer(null);
    if (fault.equals("missing-issued-at")) claims.issueTime(null);
    if (fault.equals("missing-subject")) claims.subject(null);
    if (!fault.equals("missing-expiration")) {
      claims.expirationTime(
          java.util.Date.from(
              fault.equals("expired") ? now.minusSeconds(120) : now.plusSeconds(600)));
    }
    com.nimbusds.jose.JWSAlgorithm algorithm =
        fault.equals("algorithm")
            ? com.nimbusds.jose.JWSAlgorithm.RS512
            : com.nimbusds.jose.JWSAlgorithm.RS256;
    com.nimbusds.jwt.SignedJWT token =
        new com.nimbusds.jwt.SignedJWT(new com.nimbusds.jose.JWSHeader(algorithm), claims.build());
    token.sign(
        new com.nimbusds.jose.crypto.RSASSASigner(
            fault.equals("signature") ? keys().getPrivate() : KEYS.getPrivate()));
    mvc.perform(get("/api/tasks").header("Authorization", bearer(token.serialize())))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
  }

  @Test
  void rejectsInvalidPaginationAndUnknownStatus() throws Exception {
    String token = account();
    for (String query :
        new String[] {"size=0", "size=101", "page=-1", "page=1000001", "status=INVALID"}) {
      mvc.perform(get("/api/tasks?" + query).header("Authorization", bearer(token)))
          .andExpect(status().isBadRequest())
          .andExpect(content().contentTypeCompatibleWith("application/problem+json"));
    }
  }

  @Test
  void searchTreatsWildcardsAsLiteralText() throws Exception {
    String token = account();
    create(token, "100% complete", "TODO");
    create(token, "Other", "TODO");
    mvc.perform(get("/api/tasks").param("q", "%").header("Authorization", bearer(token)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalElements").value(1))
        .andExpect(jsonPath("$.items[0].title").value("100% complete"));
  }

  @Test
  void numericStatusIsRejectedInsteadOfUsingEnumOrdinal() throws Exception {
    String token = account();
    mvc.perform(
            post("/api/tasks")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Task\",\"status\":1}"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void validatesRegistrationAndTaskFieldBoundaries() throws Exception {
    for (Map<String, String> input :
        java.util.List.of(
            Map.of("email", "invalid", "password", "Valid passphrase!"),
            Map.of("email", email(), "password", "short"),
            Map.of("email", email(), "password", "p".repeat(129)))) {
      mvc.perform(
              post("/api/auth/register")
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(json.writeValueAsString(input)))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.errors").isArray());
    }
    String token = account();
    for (Map<String, String> input :
        java.util.List.of(
            Map.of("title", "a".repeat(201)),
            Map.of("title", "Valid", "description", "a".repeat(5001)))) {
      mvc.perform(
              post("/api/tasks")
                  .header("Authorization", bearer(token))
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(json.writeValueAsString(input)))
          .andExpect(status().isBadRequest());
    }
    mvc.perform(
            post("/api/tasks")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    json.writeValueAsString(
                        Map.of("title", "a".repeat(200), "description", "a".repeat(5000)))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.status").value("TODO"));
  }

  @Test
  void updateRequiresVersionAndMalformedRequestsHaveUniformErrors() throws Exception {
    String token = account();
    String id = create(token, "Versioned", "TODO").path("id").asString();
    mvc.perform(
            put("/api/tasks/" + id)
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Edit\",\"status\":\"DONE\"}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    mvc.perform(delete("/api/tasks/not-a-uuid").header("Authorization", bearer(token)))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"));
    mvc.perform(
            post("/api/tasks")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{invalid"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.detail").value("Request cannot be processed"));
    mvc.perform(
            post("/api/tasks")
                .header("Authorization", bearer(token))
                .contentType(MediaType.TEXT_PLAIN)
                .content("private text"))
        .andExpect(status().isUnsupportedMediaType())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"));
    mvc.perform(patch("/api/tasks/" + id).header("Authorization", bearer(token)))
        .andExpect(status().isMethodNotAllowed())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"));
  }

  @Test
  void corsAllowsOnlyConfiguredOriginsAndUsesProblemResponses() throws Exception {
    mvc.perform(
            options("/api/tasks")
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "authorization,content-type"))
        .andExpect(status().isOk())
        .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
        .andExpect(header().doesNotExist("Access-Control-Allow-Credentials"));
    mvc.perform(
            options("/api/tasks")
                .header("Origin", "https://untrusted.example")
                .header("Access-Control-Request-Method", "POST"))
        .andExpect(status().isForbidden())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
  }

  @Test
  void cookieAndQueryTokensDoNotAuthenticate() throws Exception {
    String token = account();
    mvc.perform(get("/api/tasks").cookie(new jakarta.servlet.http.Cookie("accessToken", token)))
        .andExpect(status().isUnauthorized());
    mvc.perform(get("/api/tasks").param("access_token", token))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void healthDoesNotDiscloseComponentsAndAdministrationIsNotExposed() throws Exception {
    for (String path :
        new String[] {
          "/actuator/health", "/actuator/health/liveness", "/actuator/health/readiness"
        }) {
      mvc.perform(get(path))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.status").value("UP"))
          .andExpect(jsonPath("$.components").doesNotExist())
          .andExpect(jsonPath("$.details").doesNotExist());
    }
    mvc.perform(get("/actuator/env")).andExpect(status().isUnauthorized());
    mvc.perform(get("/actuator/env").header("Authorization", bearer(account())))
        .andExpect(status().isNotFound());
  }

  @Test
  void correlationIdIsReturnedWithoutTrustingArbitraryHeaderText() throws Exception {
    String id = "57d7c426-bafe-4bc1-9f9d-9e720bad10a7";
    mvc.perform(get("/api/tasks").header("X-Correlation-ID", id))
        .andExpect(header().string("X-Correlation-ID", id))
        .andExpect(jsonPath("$.correlationId").value(id));
    String actual =
        mvc.perform(get("/api/tasks").header("X-Correlation-ID", "untrusted-text"))
            .andExpect(status().isUnauthorized())
            .andReturn()
            .getResponse()
            .getHeader("X-Correlation-ID");
    assertThat(UUID.fromString(actual)).isNotNull();
    assertThat(org.slf4j.MDC.get("correlationId")).isNull();
  }

  @Test
  void migrationsEnforceUniquenessForeignKeysAndTaskInvariants() throws Exception {
    String email = email();
    register(email);
    org.assertj.core.api.Assertions.assertThatThrownBy(
            () ->
                jdbc.update(
                    "insert into users (id,email,password_hash,created_at,updated_at) values (?,?,?,UTC_TIMESTAMP(6),UTC_TIMESTAMP(6))",
                    UUID.randomUUID().toString(),
                    email,
                    "unused"))
        .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
    org.assertj.core.api.Assertions.assertThatThrownBy(
            () ->
                jdbc.update(
                    "insert into tasks (id,owner_id,title,status,created_at,updated_at,version) values (?,?,?, ?,UTC_TIMESTAMP(6),UTC_TIMESTAMP(6),0)",
                    UUID.randomUUID().toString(),
                    UUID.randomUUID().toString(),
                    "Orphan",
                    "TODO"))
        .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
    String owner = jdbc.queryForObject("select id from users where email = ?", String.class, email);
    for (String status : new String[] {"UNKNOWN", null}) {
      org.assertj.core.api.Assertions.assertThatThrownBy(
              () ->
                  jdbc.update(
                      "insert into tasks (id,owner_id,title,status,created_at,updated_at,version) values (?,?,?, ?,UTC_TIMESTAMP(6),UTC_TIMESTAMP(6),0)",
                      UUID.randomUUID().toString(),
                      owner,
                      "Task",
                      status))
          .hasRootCauseInstanceOf(java.sql.SQLException.class)
          .rootCause()
          .extracting("errorCode")
          .isEqualTo(status == null ? 1048 : 3819);
    }
    assertThat(
            jdbc.queryForObject(
                "select count(*) from flyway_schema_history where success = 1", Integer.class))
        .isEqualTo(1);
  }

  @org.junit.jupiter.params.ParameterizedTest
  @org.junit.jupiter.params.provider.ValueSource(strings = {"/api/tasks;bad"})
  void firewallRejectionsUseTheSameProblemContract(String path) throws Exception {
    mvc.perform(
            get("/api/tasks")
                .with(
                    request -> {
                      request.setRequestURI(path);
                      return request;
                    })
                .header("X-Correlation-ID", "57d7c426-bafe-4bc1-9f9d-9e720bad10a7"))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.code").value("REQUEST_INVALID"))
        .andExpect(jsonPath("$.correlationId").value("57d7c426-bafe-4bc1-9f9d-9e720bad10a7"));
  }

  @Test
  @org.junit.jupiter.api.extension.ExtendWith(
      org.springframework.boot.test.system.OutputCaptureExtension.class)
  void databaseConstraintFailuresDoNotLogPersonalData(
      org.springframework.boot.test.system.CapturedOutput output) throws Exception {
    String address = email();
    register(address);
    org.assertj.core.api.Assertions.assertThatThrownBy(
            () ->
                userRepository.saveAndFlush(
                    new com.omnitask.users.User(address, "private-hash", java.time.Instant.now())))
        .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
    assertThat(output.getAll()).doesNotContain(address, "private-hash");
  }

  @Autowired com.omnitask.users.UserRepository userRepository;

  @Autowired jakarta.persistence.EntityManagerFactory entityManagers;

  @Test
  void overlappingDatabaseTransactionsCannotSilentlyOverwriteEachOther() throws Exception {
    String token = account();
    UUID id = UUID.fromString(create(token, "Original", "TODO").path("id").asString());
    try (var first = entityManagers.createEntityManager();
        var second = entityManagers.createEntityManager()) {
      first.getTransaction().begin();
      second.getTransaction().begin();
      var firstCopy = first.find(com.omnitask.tasks.Task.class, id);
      var secondCopy = second.find(com.omnitask.tasks.Task.class, id);
      firstCopy.update(
          "First committed edit",
          null,
          com.omnitask.tasks.TaskStatus.DONE,
          java.time.Instant.parse("2026-09-18T12:00:00Z"));
      secondCopy.update(
          "Lost edit",
          null,
          com.omnitask.tasks.TaskStatus.IN_PROGRESS,
          java.time.Instant.parse("2026-09-18T12:00:01Z"));
      first.getTransaction().commit();
      org.assertj.core.api.Assertions.assertThatThrownBy(() -> second.getTransaction().commit())
          .isInstanceOf(jakarta.persistence.RollbackException.class)
          .hasCauseInstanceOf(jakarta.persistence.OptimisticLockException.class);
    }
    mvc.perform(get("/api/tasks").header("Authorization", bearer(token)))
        .andExpect(jsonPath("$.items[0].title").value("First committed edit"))
        .andExpect(jsonPath("$.items[0].version").value(1));
  }

  @Test
  void allTaskMutationsRequireAuthentication() throws Exception {
    String id = "57d7c426-bafe-4bc1-9f9d-9e720bad10a7";
    for (var request :
        java.util.List.of(
            post("/api/tasks"), put("/api/tasks/" + id), delete("/api/tasks/" + id))) {
      mvc.perform(request.contentType(MediaType.APPLICATION_JSON).content("{}"))
          .andExpect(status().isUnauthorized())
          .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
    }
  }

  private void register(String email) throws Exception {
    mvc.perform(
            post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    json.writeValueAsString(
                        Map.of("email", email, "password", "Correct horse battery!"))))
        .andExpect(status().isCreated());
  }

  private String account() throws Exception {
    String email = email();
    register(email);
    String response =
        mvc.perform(
                post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        json.writeValueAsString(
                            Map.of("email", email, "password", "Correct horse battery!"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.tokenType").value("Bearer"))
            .andExpect(jsonPath("$.expiresIn").value(900))
            .andReturn()
            .getResponse()
            .getContentAsString();
    return json.readTree(response).path("accessToken").asString();
  }

  private JsonNode create(String token, String title, String status) throws Exception {
    String response =
        mvc.perform(
                post("/api/tasks")
                    .header("Authorization", bearer(token))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json.writeValueAsString(Map.of("title", title, "status", status))))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();
    return json.readTree(response);
  }

  private static String email() {
    return UUID.randomUUID() + "@example.com";
  }

  private static String bearer(String token) {
    return "Bearer " + token;
  }

  private static KeyPair keys() {
    try {
      KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
      generator.initialize(2048);
      return generator.generateKeyPair();
    } catch (java.security.GeneralSecurityException exception) {
      throw new IllegalStateException(exception);
    }
  }

  private static String pem(String label, byte[] bytes) {
    return "-----BEGIN "
        + label
        + "-----\n"
        + Base64.getMimeEncoder(64, new byte[] {'\n'}).encodeToString(bytes)
        + "\n-----END "
        + label
        + "-----\n";
  }
}
