import 'package:flutter/foundation.dart';

import 'package:omnitask_mobile/core/network/api_problem.dart';
import 'package:omnitask_mobile/features/auth/data/auth_repository.dart';
import 'package:omnitask_mobile/features/auth/presentation/session_controller.dart';

enum AuthMode { login, register }

final class AuthController extends ChangeNotifier {
  AuthController(this._repository, this._sessionController);

  final AuthRepository _repository;
  final SessionController _sessionController;

  AuthMode _mode = AuthMode.login;
  bool _submitting = false;
  ApiProblem? _problem;
  bool _accountCreated = false;

  AuthMode get mode => _mode;
  bool get submitting => _submitting;
  ApiProblem? get problem => _problem;
  bool get accountCreated => _accountCreated;

  void selectMode(AuthMode mode) {
    if (_mode == mode) return;
    _mode = mode;
    _problem = null;
    _accountCreated = false;
    notifyListeners();
  }

  Future<bool> submit({required String email, required String password}) async {
    _submitting = true;
    _problem = null;
    _accountCreated = false;
    notifyListeners();
    try {
      if (_mode == AuthMode.register) {
        await _repository.register(email: email, password: password);
        _mode = AuthMode.login;
        _accountCreated = true;
        return true;
      }
      final session = await _repository.login(email: email, password: password);
      await _sessionController.authenticate(session);
      return true;
    } on ApiProblem catch (problem) {
      _problem = problem;
      return false;
    } finally {
      _submitting = false;
      notifyListeners();
    }
  }
}
