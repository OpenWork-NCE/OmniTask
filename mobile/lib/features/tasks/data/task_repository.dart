import 'package:dio/dio.dart';

import 'package:omnitask_mobile/core/network/api_problem.dart';
import 'package:omnitask_mobile/features/tasks/domain/task.dart';
import 'package:omnitask_mobile/features/tasks/domain/task_page.dart';

final class TaskRepository {
  const TaskRepository(this._dio);

  final Dio _dio;

  Future<TaskPage> list({
    required int page,
    required int size,
    String query = '',
    TaskStatus? status,
  }) async {
    try {
      final parameters = <String, Object?>{'page': page, 'size': size};
      if (query.trim().isNotEmpty) {
        parameters['q'] = query.trim();
      }
      if (status != null) {
        parameters['status'] = status.apiValue;
      }
      final response = await _dio.get<Map<String, Object?>>(
        '/api/tasks',
        queryParameters: parameters,
      );
      final data = response.data;
      if (data == null) {
        throw const ApiProblem(status: 0, code: 'INVALID_RESPONSE');
      }
      return TaskPage.fromJson(data);
    } on DioException catch (error) {
      throw ApiProblem.fromDioException(error);
    } on FormatException {
      throw const ApiProblem(status: 0, code: 'INVALID_RESPONSE');
    }
  }

  Future<Task> create(TaskDraft draft) async {
    return _write('/api/tasks', draft.toJson());
  }

  Future<Task> update(Task task, TaskDraft draft) async {
    return _write('/api/tasks/${task.id}', <String, Object?>{
      ...draft.toJson(),
      'version': task.version,
    }, update: true);
  }

  Future<void> delete(String taskId) async {
    try {
      await _dio.delete<void>('/api/tasks/$taskId');
    } on DioException catch (error) {
      throw ApiProblem.fromDioException(error);
    }
  }

  Future<Task> _write(
    String path,
    Map<String, Object?> body, {
    bool update = false,
  }) async {
    try {
      final response = update
          ? await _dio.put<Map<String, Object?>>(path, data: body)
          : await _dio.post<Map<String, Object?>>(path, data: body);
      final data = response.data;
      if (data == null) {
        throw const ApiProblem(status: 0, code: 'INVALID_RESPONSE');
      }
      return Task.fromJson(data);
    } on DioException catch (error) {
      throw ApiProblem.fromDioException(error);
    } on FormatException {
      throw const ApiProblem(status: 0, code: 'INVALID_RESPONSE');
    }
  }
}
