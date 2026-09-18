package com.omnitask.tasks;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
  private final TaskService tasks;

  public TaskController(TaskService tasks) {
    this.tasks = tasks;
  }

  @GetMapping
  public TaskPage list(
      @AuthenticationPrincipal Jwt identity,
      @RequestParam(required = false) TaskStatus status,
      @RequestParam(name = "q", required = false) @Size(max = 200) String search,
      @RequestParam(defaultValue = "0") @Min(0) @Max(1000000) int page,
      @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
    return tasks.list(UUID.fromString(identity.getSubject()), status, search, page, size);
  }

  @PostMapping
  public ResponseEntity<TaskResponse> create(
      @AuthenticationPrincipal Jwt identity, @Valid @RequestBody CreateTaskRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(tasks.create(UUID.fromString(identity.getSubject()), request));
  }

  @PutMapping("/{id}")
  public TaskResponse update(
      @AuthenticationPrincipal Jwt identity,
      @PathVariable UUID id,
      @Valid @RequestBody UpdateTaskRequest request) {
    return tasks.update(UUID.fromString(identity.getSubject()), id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@AuthenticationPrincipal Jwt identity, @PathVariable UUID id) {
    tasks.delete(UUID.fromString(identity.getSubject()), id);
  }
}
