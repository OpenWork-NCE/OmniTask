import 'package:flutter/material.dart';

import 'package:omnitask_mobile/app/omnitask_app.dart';
import 'package:omnitask_mobile/core/network/api_client.dart';
import 'package:omnitask_mobile/core/storage/app_preferences.dart';
import 'package:omnitask_mobile/features/auth/data/auth_repository.dart';
import 'package:omnitask_mobile/features/auth/data/token_store.dart';
import 'package:omnitask_mobile/features/auth/presentation/session_controller.dart';
import 'package:omnitask_mobile/features/tasks/data/task_repository.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final preferences = AppPreferences();
  final initialSettings = await Future.wait<Object>(<Future<Object>>[
    preferences.readLocale(),
    preferences.readThemeMode(),
  ]);
  final sessionController = SessionController(SecureTokenStore());
  await sessionController.restore();
  final client = ApiClient(
    accessTokenProvider: () => sessionController.accessToken,
    onUnauthorized: () => sessionController.signOut(expired: true),
  );

  runApp(
    OmniTaskApp(
      preferences: preferences,
      initialLocale: initialSettings[0] as Locale,
      initialThemeMode: initialSettings[1] as ThemeMode,
      sessionController: sessionController,
      authRepository: AuthRepository(client.dio),
      taskRepository: TaskRepository(client.dio),
    ),
  );
}
