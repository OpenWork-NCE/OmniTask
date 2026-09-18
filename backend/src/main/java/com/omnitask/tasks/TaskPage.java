package com.omnitask.tasks;

import java.util.List;

public record TaskPage(
    List<TaskResponse> items, int page, int size, long totalElements, int totalPages) {
  public TaskPage {
    items = List.copyOf(items);
  }
}
