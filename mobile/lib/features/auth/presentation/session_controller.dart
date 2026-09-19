import 'dart:async';

import 'package:flutter/foundation.dart';

import 'package:omnitask_mobile/features/auth/data/token_store.dart';
import 'package:omnitask_mobile/features/auth/domain/session.dart';

final class SessionController extends ChangeNotifier {
  SessionController(this._tokenStore);

  final TokenStore _tokenStore;
  Session? _session;
  Timer? _expiryTimer;
  bool _sessionExpired = false;

  String? get accessToken => _session?.accessToken;
  bool get isAuthenticated => _session != null && !_session!.isExpired;
  bool get sessionExpired => _sessionExpired;

  Future<void> restore() async {
    final storedSession = await _tokenStore.read();
    if (storedSession == null || storedSession.isExpired) {
      await _tokenStore.clear();
      return;
    }
    _session = storedSession;
    _scheduleExpiry();
  }

  Future<void> authenticate(Session session) async {
    _sessionExpired = false;
    _session = session;
    await _tokenStore.write(session);
    _scheduleExpiry();
    notifyListeners();
  }

  Future<void> signOut({bool expired = false}) async {
    _expiryTimer?.cancel();
    _session = null;
    _sessionExpired = expired;
    await _tokenStore.clear();
    notifyListeners();
  }

  void acknowledgeExpiry() {
    if (!_sessionExpired) return;
    _sessionExpired = false;
    notifyListeners();
  }

  void _scheduleExpiry() {
    _expiryTimer?.cancel();
    final duration = _session!.expiresAt.difference(DateTime.now().toUtc());
    _expiryTimer = Timer(duration, () => unawaited(signOut(expired: true)));
  }

  @override
  void dispose() {
    _expiryTimer?.cancel();
    super.dispose();
  }
}
