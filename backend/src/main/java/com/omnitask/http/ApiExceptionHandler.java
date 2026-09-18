package com.omnitask.http;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {
  private static final Logger LOG = LoggerFactory.getLogger(ApiExceptionHandler.class);

  @ExceptionHandler(ApiException.class)
  public ResponseEntity<Object> application(ApiException exception, WebRequest request) {
    return response(exception.status(), exception.code(), exception.getMessage(), request);
  }

  @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
  public ResponseEntity<Object> conflict(WebRequest request) {
    return response(
        HttpStatus.CONFLICT,
        "TASK_VERSION_CONFLICT",
        "Task changed; reload before editing",
        request);
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<Object> constraint(WebRequest request) {
    return response(
        HttpStatus.CONFLICT, "DATA_CONFLICT", "Operation conflicts with stored data", request);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Object> unexpected(Exception exception, WebRequest request) {
    LOG.error("Unexpected request failure: {}", exception.getClass().getSimpleName());
    return response(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "INTERNAL_ERROR",
        "An unexpected error occurred",
        request);
  }

  @Override
  protected ResponseEntity<Object> handleMethodArgumentNotValid(
      MethodArgumentNotValidException exception,
      HttpHeaders headers,
      HttpStatusCode status,
      WebRequest request) {
    var problem =
        ProblemResponses.create(
            status, "VALIDATION_FAILED", "Request validation failed", path(request));
    problem.setProperty(
        "errors",
        exception.getBindingResult().getFieldErrors().stream()
            .map(
                error ->
                    Map.of(
                        "field",
                        error.getField(),
                        "message",
                        error.getDefaultMessage() == null
                            ? "Invalid value"
                            : error.getDefaultMessage()))
            .toList());
    return ResponseEntity.status(status)
        .contentType(MediaType.APPLICATION_PROBLEM_JSON)
        .body(problem);
  }

  @Override
  protected ResponseEntity<Object> handleExceptionInternal(
      Exception exception,
      Object body,
      HttpHeaders headers,
      HttpStatusCode status,
      WebRequest request) {
    var problem =
        ProblemResponses.create(
            status, "REQUEST_INVALID", "Request cannot be processed", path(request));
    return ResponseEntity.status(status)
        .headers(headers)
        .contentType(MediaType.APPLICATION_PROBLEM_JSON)
        .body(problem);
  }

  private ResponseEntity<Object> response(
      HttpStatus status, String code, String detail, WebRequest request) {
    return ResponseEntity.status(status)
        .contentType(MediaType.APPLICATION_PROBLEM_JSON)
        .body(ProblemResponses.create(status, code, detail, path(request)));
  }

  private static String path(WebRequest request) {
    return ((ServletWebRequest) request).getRequest().getRequestURI();
  }
}
