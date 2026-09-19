import 'package:flutter/material.dart';

import 'package:omnitask_mobile/core/storage/app_preferences.dart';

final class AppController extends ChangeNotifier {
  factory AppController({
    required AppPreferences preferences,
    required Locale locale,
    required ThemeMode themeMode,
  }) => AppController._(preferences, locale, themeMode);

  AppController._(this._preferences, this._locale, this._themeMode);

  final AppPreferences _preferences;
  Locale _locale;
  ThemeMode _themeMode;

  Locale get locale => _locale;
  ThemeMode get themeMode => _themeMode;

  Future<void> setLocale(Locale locale) async {
    if (_locale == locale) return;
    _locale = locale;
    notifyListeners();
    await _preferences.writeLocale(locale);
  }

  Future<void> setThemeMode(ThemeMode themeMode) async {
    if (_themeMode == themeMode) return;
    _themeMode = themeMode;
    notifyListeners();
    await _preferences.writeThemeMode(themeMode);
  }
}
