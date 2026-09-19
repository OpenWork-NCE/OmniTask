import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'package:omnitask_mobile/app/app_controller.dart';
import 'package:omnitask_mobile/core/storage/app_preferences.dart';
import 'package:omnitask_mobile/core/theme/app_theme.dart';
import 'package:omnitask_mobile/features/auth/data/auth_repository.dart';
import 'package:omnitask_mobile/features/auth/presentation/auth_screen.dart';
import 'package:omnitask_mobile/features/auth/presentation/session_controller.dart';
import 'package:omnitask_mobile/features/tasks/data/task_repository.dart';
import 'package:omnitask_mobile/features/tasks/presentation/tasks_screen.dart';
import 'package:omnitask_mobile/l10n/app_localizations.dart';

final class OmniTaskApp extends StatefulWidget {
  const OmniTaskApp({
    required this.preferences,
    required this.initialLocale,
    required this.initialThemeMode,
    required this.sessionController,
    required this.authRepository,
    required this.taskRepository,
    super.key,
  });

  final AppPreferences preferences;
  final Locale initialLocale;
  final ThemeMode initialThemeMode;
  final SessionController sessionController;
  final AuthRepository authRepository;
  final TaskRepository taskRepository;

  @override
  State<OmniTaskApp> createState() => _OmniTaskAppState();
}

final class _OmniTaskAppState extends State<OmniTaskApp> {
  late final AppController _appController = AppController(
    preferences: widget.preferences,
    locale: widget.initialLocale,
    themeMode: widget.initialThemeMode,
  );

  @override
  void dispose() {
    _appController.dispose();
    widget.sessionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: Listenable.merge(<Listenable>[
        _appController,
        widget.sessionController,
      ]),
      builder: (context, _) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          onGenerateTitle: (context) => AppLocalizations.of(context).appName,
          locale: _appController.locale,
          supportedLocales: AppLocalizations.supportedLocales,
          localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
          ],
          theme: AppTheme.light(),
          darkTheme: AppTheme.dark(),
          themeMode: _appController.themeMode,
          home: AnimatedSwitcher(
            duration: const Duration(milliseconds: 280),
            switchInCurve: Curves.easeOutCubic,
            switchOutCurve: Curves.easeInCubic,
            child: widget.sessionController.isAuthenticated
                ? TasksScreen(
                    key: const ValueKey('tasks'),
                    repository: widget.taskRepository,
                    sessionController: widget.sessionController,
                    appController: _appController,
                  )
                : AuthScreen(
                    key: const ValueKey('auth'),
                    repository: widget.authRepository,
                    sessionController: widget.sessionController,
                    appController: _appController,
                  ),
          ),
        );
      },
    );
  }
}
