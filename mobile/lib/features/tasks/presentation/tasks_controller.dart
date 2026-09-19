import 'package:flutter/foundation.dart';

import 'package:omnitask_mobile/core/network/api_problem.dart';
import 'package:omnitask_mobile/features/tasks/data/task_repository.dart';
import 'package:omnitask_mobile/features/tasks/domain/task.dart';
import 'package:omnitask_mobile/features/tasks/domain/task_page.dart';

enum TaskLoadState { loading, ready, failed }

final class TasksController extends ChangeNotifier {
  TasksController(this._repository);

  static const pageSize = 20;

  final TaskRepository _repository;
  TaskPage? _result;
  TaskLoadState _state = TaskLoadState.loading;
  ApiProblem? _problem;
  String _query = '';
  TaskStatus? _status;
  int _requestSequence = 0;

  TaskPage? get result => _result;
  TaskLoadState get state => _state;
  ApiProblem? get problem => _problem;
  String get query => _query;
  TaskStatus? get status => _status;

  Future<void> load({int page = 0, bool showLoader = true}) async {
    final request = ++_requestSequence;
    if (showLoader) {
      _state = TaskLoadState.loading;
      _problem = null;
      notifyListeners();
    }
    try {
      final result = await _repository.list(
        page: page,
        size: pageSize,
        query: _query,
        status: _status,
      );
      if (request != _requestSequence) return;
      _result = result;
      _state = TaskLoadState.ready;
      _problem = null;
    } on ApiProblem catch (problem) {
      if (request != _requestSequence) return;
      _problem = problem;
      _state = TaskLoadState.failed;
    }
    notifyListeners();
  }

  Future<void> setQuery(String query) async {
    if (_query == query) return;
    _query = query;
    await load();
  }

  Future<void> setStatus(TaskStatus? status) async {
    if (_status == status) return;
    _status = status;
    await load();
  }

  Future<void> create(TaskDraft draft) async {
    await _repository.create(draft);
    await load(showLoader: false);
  }

  Future<void> update(Task task, TaskDraft draft) async {
    await _repository.update(task, draft);
    await load(page: _result?.page ?? 0, showLoader: false);
  }

  Future<void> delete(Task task) async {
    await _repository.delete(task.id);
    final currentPage = _result?.page ?? 0;
    final targetPage = (_result?.items.length == 1 && currentPage > 0)
        ? currentPage - 1
        : currentPage;
    await load(page: targetPage, showLoader: false);
  }
}
