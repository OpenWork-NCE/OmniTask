package com.omnitask.tasks;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record UpdateTaskRequest(
    @NotBlank @Size(max = 200) String title,
    @Size(max = 5000) String description,
    @NotNull TaskStatus status,
    @NotNull @PositiveOrZero Long version) {
  public UpdateTaskRequest {
    if (title != null) title = title.strip();
  }
}
