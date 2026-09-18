package com.omnitask.http;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.ServletWebRequest;

class ProblemResponsesTest {
  @Test
  void malformedUntrustedPathCannotBreakAnErrorResponse() {
    var problem =
        ProblemResponses.create(
            HttpStatus.BAD_REQUEST,
            "REQUEST_INVALID",
            "Request cannot be processed",
            "/api/tasks;bad%");
    assertThat(problem.getStatus()).isEqualTo(400);
    assertThat(problem.getInstance()).isNull();
  }

  @Test
  void unexpectedExceptionsDoNotExposeTheirMessage() {
    var request = new ServletWebRequest(new MockHttpServletRequest("GET", "/api/tasks"));
    var response =
        new ApiExceptionHandler()
            .unexpected(
                new IllegalStateException("password=private-value; SELECT * FROM users"), request);
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(response.getBody()).isInstanceOf(ProblemDetail.class);
    assertThat(response.getBody().toString())
        .doesNotContain("private-value", "SELECT", "IllegalStateException");
  }
}
