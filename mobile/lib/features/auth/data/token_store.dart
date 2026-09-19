import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'package:omnitask_mobile/features/auth/domain/session.dart';

abstract interface class TokenStore {
  Future<Session?> read();

  Future<void> write(Session session);

  Future<void> clear();
}

final class SecureTokenStore implements TokenStore {
  SecureTokenStore({FlutterSecureStorage? storage})
    : _storage =
          storage ??
          const FlutterSecureStorage(
            iOptions: IOSOptions(
              accessibility: KeychainAccessibility.first_unlock_this_device,
            ),
          );

  static const _accessTokenKey = 'omnitask.accessToken';
  static const _expiresAtKey = 'omnitask.expiresAt';

  final FlutterSecureStorage _storage;

  @override
  Future<Session?> read() async {
    final values = await Future.wait(<Future<String?>>[
      _storage.read(key: _accessTokenKey),
      _storage.read(key: _expiresAtKey),
    ]);
    final token = values[0];
    final expiresAt = DateTime.tryParse(values[1] ?? '');
    if (token == null || expiresAt == null) {
      await clear();
      return null;
    }
    return Session(accessToken: token, expiresAt: expiresAt.toUtc());
  }

  @override
  Future<void> write(Session session) async {
    await _storage.write(key: _accessTokenKey, value: session.accessToken);
    await _storage.write(
      key: _expiresAtKey,
      value: session.expiresAt.toIso8601String(),
    );
  }

  @override
  Future<void> clear() async {
    await Future.wait(<Future<void>>[
      _storage.delete(key: _accessTokenKey),
      _storage.delete(key: _expiresAtKey),
    ]);
  }
}
