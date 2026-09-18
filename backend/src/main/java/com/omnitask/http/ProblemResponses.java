package com.omnitask.http;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.ObjectWriter;

@Component
public class ProblemResponses {
  private final ObjectWriter json;

  public ProblemResponses(ObjectMapper json) {
    this.json = json.writer();
  }

  public static ProblemDetail create(
      HttpStatusCode status, String code, String detail, String path) {
    var problem = ProblemDetail.forStatusAndDetail(status, detail);
    if (path != null) {
      try {
        problem.setInstance(URI.create(path));
      } catch (IllegalArgumentException invalidPath) {
        // A rejected request can contain a path that is not a valid URI.
        problem.setInstance(null);
      }
    }
    problem.setProperty("code", code);
    problem.setProperty("correlationId", MDC.get("correlationId"));
    return problem;
  }

  public void write(
      HttpServletRequest request,
      HttpServletResponse response,
      HttpStatus status,
      String code,
      String detail)
      throws IOException {
    response.setStatus(status.value());
    response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
    response.setHeader("Cache-Control", "no-store");
    json.writeValue(
        response.getOutputStream(),
        create(status, code, detail, request == null ? null : request.getRequestURI()));
  }
}
