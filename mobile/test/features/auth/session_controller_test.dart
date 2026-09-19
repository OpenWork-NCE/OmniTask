import 'package:flutter_test/flutter_test.dart';

import 'package:omnitask_mobile/features/auth/data/token_store.dart';
import 'package:omnitask_mobile/features/auth/domain/session.dart';
import 'package:omnitask_mobile/features/auth/presentation/session_controller.dart';

void main() {
  test('restores a valid session and removes an expired session', () async {
    final validStore = MemoryTokenStore(
      Session(
        accessToken: 'valid-token',
        expiresAt: DateTime.now().toUtc().add(const Duration(minutes: 5)),
      ),
    );
    final validController = SessionController(validStore);

    await validController.restore();

    expect(validController.isAuthenticated, isTrue);
    expect(validController.accessToken, 'valid-token');

    final expiredStore = MemoryTokenStore(
      Session(
        accessToken: 'expired-token',
        expiresAt: DateTime.now().toUtc().subtract(const Duration(seconds: 1)),
      ),
    );
    final expiredController = SessionController(expiredStore);

    await expiredController.restore();

    expect(expiredController.isAuthenticated, isFalse);
    expect(expiredStore.session, isNull);
    validController.dispose();
    expiredController.dispose();
  });

  test('clears persisted credentials and records server expiry', () async {
    final store = MemoryTokenStore();
    final controller = SessionController(store);
    await controller.authenticate(
      Session(
        accessToken: 'access-token',
        expiresAt: DateTime.now().toUtc().add(const Duration(minutes: 5)),
      ),
    );

    await controller.signOut(expired: true);

    expect(controller.isAuthenticated, isFalse);
    expect(controller.sessionExpired, isTrue);
    expect(store.session, isNull);
    controller.dispose();
  });
}

final class MemoryTokenStore implements TokenStore {
  MemoryTokenStore([this.session]);

  Session? session;

  @override
  Future<void> clear() async {
    session = null;
  }

  @override
  Future<Session?> read() async => session;

  @override
  Future<void> write(Session session) async {
    this.session = session;
  }
}
