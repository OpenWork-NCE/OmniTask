import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:omnitask_mobile/core/network/api_problem.dart';
import 'package:omnitask_mobile/features/tasks/data/task_repository.dart';
import 'package:omnitask_mobile/features/tasks/domain/task.dart';

void main() {
  test('sends literal filters and parses the paged task contract', () async {
    final adapter = StubAdapter((options) {
      expect(options.path, '/api/tasks');
      expect(options.queryParameters, <String, Object?>{
        'page': 1,
        'size': 20,
        'q': '50%_café',
        'status': 'DONE',
      });
      return jsonResponse(<String, Object?>{
        'items': <Object?>[
          taskJson(title: 'Publish report', status: 'DONE', version: 3),
        ],
        'page': 1,
        'size': 20,
        'totalElements': 21,
        'totalPages': 2,
      });
    });
    final repository = TaskRepository(testDio(adapter));

    final result = await repository.list(
      page: 1,
      size: 20,
      query: '  50%_café  ',
      status: TaskStatus.done,
    );

    expect(result.items.single.title, 'Publish report');
    expect(result.items.single.status, TaskStatus.done);
    expect(result.totalPages, 2);
  });

  test('includes the observed version in update requests', () async {
    final existing = Task.fromJson(taskJson(version: 7));
    final adapter = StubAdapter((options) {
      expect(options.method, 'PUT');
      expect(options.path, '/api/tasks/${existing.id}');
      expect(options.data, <String, Object?>{
        'title': 'Revised title',
        'description': null,
        'status': 'IN_PROGRESS',
        'version': 7,
      });
      return jsonResponse(
        taskJson(title: 'Revised title', status: 'IN_PROGRESS', version: 8),
      );
    });
    final repository = TaskRepository(testDio(adapter));

    final updated = await repository.update(
      existing,
      const TaskDraft(
        title: 'Revised title',
        description: null,
        status: TaskStatus.inProgress,
      ),
    );

    expect(updated.version, 8);
  });

  test('preserves the API conflict code for explicit recovery', () async {
    final adapter = StubAdapter(
      (_) => jsonResponse(<String, Object?>{
        'status': 409,
        'code': 'TASK_VERSION_CONFLICT',
        'detail': 'Task changed',
      }, statusCode: 409),
    );
    final repository = TaskRepository(testDio(adapter));
    final task = Task.fromJson(taskJson());

    expect(
      () => repository.update(
        task,
        const TaskDraft(
          title: 'Title',
          description: null,
          status: TaskStatus.todo,
        ),
      ),
      throwsA(
        isA<ApiProblem>().having(
          (problem) => problem.code,
          'code',
          'TASK_VERSION_CONFLICT',
        ),
      ),
    );
  });
}

Dio testDio(HttpClientAdapter adapter) {
  return Dio(BaseOptions(baseUrl: 'https://api.example.test'))
    ..httpClientAdapter = adapter;
}

Map<String, Object?> taskJson({
  String title = 'Original title',
  String status = 'TODO',
  int version = 0,
}) {
  return <String, Object?>{
    'id': 'fdbf3694-5055-4a0a-a337-2425c37f2fa8',
    'title': title,
    'description': null,
    'status': status,
    'createdAt': '2026-09-18T10:00:00Z',
    'updatedAt': '2026-09-19T09:00:00Z',
    'version': version,
  };
}

ResponseBody jsonResponse(Object body, {int statusCode = 200}) {
  return ResponseBody.fromString(
    jsonEncode(body),
    statusCode,
    headers: <String, List<String>>{
      Headers.contentTypeHeader: <String>[Headers.jsonContentType],
    },
  );
}

final class StubAdapter implements HttpClientAdapter {
  StubAdapter(this.handler);

  final ResponseBody Function(RequestOptions options) handler;

  @override
  void close({bool force = false}) {}

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    return handler(options);
  }
}
