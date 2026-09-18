package com.omnitask.tasks;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTaskRequest(
    @NotBlank @Size(max = 200) String title,
    @Size(max = 5000) String description,
    TaskStatus status) {
  public CreateTaskRequest {
    if (title != null) title = title.strip();
    if (status == null) status = TaskStatus.TODO;
  }
}
