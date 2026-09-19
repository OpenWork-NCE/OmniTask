import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:omnitask_mobile/app/app_controller.dart';
import 'package:omnitask_mobile/core/storage/app_preferences.dart';
import 'package:omnitask_mobile/core/theme/app_theme.dart';
import 'package:omnitask_mobile/features/auth/data/auth_repository.dart';
import 'package:omnitask_mobile/features/auth/data/token_store.dart';
import 'package:omnitask_mobile/features/auth/domain/session.dart';
import 'package:omnitask_mobile/features/auth/presentation/auth_screen.dart';
import 'package:omnitask_mobile/features/auth/presentation/session_controller.dart';
import 'package:omnitask_mobile/l10n/app_localizations.dart';
import 'package:shared_preferences_platform_interface/in_memory_shared_preferences_async.dart';
import 'package:shared_preferences_platform_interface/shared_preferences_async_platform_interface.dart';

void main() {
  testWidgets('renders the English light authentication surface', (
    tester,
  ) async {
    await _loadAppFonts();
    SharedPreferencesAsyncPlatform.instance =
        InMemorySharedPreferencesAsync.empty();
    await tester.binding.setSurfaceSize(const Size(390, 844));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    final sessionController = SessionController(EmptyTokenStore());
    addTearDown(sessionController.dispose);
    final appController = AppController(
      preferences: AppPreferences(),
      locale: const Locale('en'),
      themeMode: ThemeMode.light,
    );
    addTearDown(appController.dispose);

    await tester.pumpWidget(
      MaterialApp(
        locale: const Locale('en'),
        supportedLocales: AppLocalizations.supportedLocales,
        localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
        ],
        theme: AppTheme.light(),
        home: Builder(
          builder: (context) => MediaQuery(
            data: MediaQuery.of(context).copyWith(disableAnimations: true),
            child: AuthScreen(
              repository: AuthRepository(Dio()),
              sessionController: sessionController,
              appController: appController,
            ),
          ),
        ),
      ),
    );
    await tester.pump(const Duration(milliseconds: 700));

    await expectLater(
      find.byType(AuthScreen),
      matchesGoldenFile('goldens/auth_en_light.png'),
    );
  });
}

Future<void> _loadAppFonts() async {
  await Future.wait(<Future<void>>[
    (FontLoader('Funnel Display')
          ..addFont(rootBundle.load('assets/fonts/FunnelDisplay-Variable.ttf')))
        .load(),
    (FontLoader(
      'Unbounded',
    )..addFont(rootBundle.load('assets/fonts/Unbounded-Variable.ttf'))).load(),
    (FontLoader(
      'MaterialIcons',
    )..addFont(rootBundle.load('fonts/MaterialIcons-Regular.otf'))).load(),
  ]);
}

final class EmptyTokenStore implements TokenStore {
  @override
  Future<void> clear() async {}

  @override
  Future<Session?> read() async => null;

  @override
  Future<void> write(Session session) async {}
}
