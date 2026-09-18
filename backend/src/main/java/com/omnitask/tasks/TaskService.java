package com.omnitask.tasks;

import com.omnitask.http.ApiException;
import java.time.Clock;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskService {
  private final TaskRepository tasks;
  private final Clock clock;

  public TaskService(TaskRepository tasks, Clock clock) {
    this.tasks = tasks;
    this.clock = clock;
  }

  @Transactional(readOnly = true)
  public TaskPage list(UUID ownerId, TaskStatus status, String search, int page, int size) {
    Specification<Task> filter = (root, query, cb) -> cb.equal(root.get("ownerId"), ownerId);
    if (status != null)
      filter = filter.and((root, query, cb) -> cb.equal(root.get("status"), status));
    if (search != null && !search.isBlank()) {
      String pattern =
          "%" + search.strip().replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%";
      filter =
          filter.and(
              (root, query, cb) ->
                  cb.or(
                      cb.like(root.get("title"), pattern, '!'),
                      cb.like(root.get("description"), pattern, '!')));
    }
    var result =
        tasks.findAll(
            filter,
            PageRequest.of(
                page, size, Sort.by(Sort.Order.desc("createdAt"), Sort.Order.asc("id"))));
    return new TaskPage(
        result.getContent().stream().map(TaskResponse::from).toList(),
        page,
        size,
        result.getTotalElements(),
        result.getTotalPages());
  }

  @Transactional
  public TaskResponse create(UUID ownerId, CreateTaskRequest request) {
    var task =
        new Task(
            ownerId,
            request.title(),
            request.description(),
            request.status(),
            clock.instant().truncatedTo(ChronoUnit.MICROS));
    return TaskResponse.from(tasks.saveAndFlush(task));
  }

  @Transactional
  public TaskResponse update(UUID ownerId, UUID id, UpdateTaskRequest request) {
    Task task = ownedTask(ownerId, id);
    if (task.getVersion() != request.version()) {
      throw new ApiException(
          HttpStatus.CONFLICT, "TASK_VERSION_CONFLICT", "Task changed; reload before editing");
    }
    task.update(
        request.title(),
        request.description(),
        request.status(),
        clock.instant().truncatedTo(ChronoUnit.MICROS));
    tasks.flush();
    return TaskResponse.from(task);
  }

  @Transactional
  public void delete(UUID ownerId, UUID id) {
    tasks.delete(ownedTask(ownerId, id));
    tasks.flush();
  }

  private Task ownedTask(UUID ownerId, UUID id) {
    return tasks
        .findByIdAndOwnerId(id, ownerId)
        .orElseThrow(
            () -> new ApiException(HttpStatus.NOT_FOUND, "TASK_NOT_FOUND", "Task not found"));
  }
}
