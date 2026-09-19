import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

final class AppPreferences {
  AppPreferences({SharedPreferencesAsync? preferences})
    : _preferences = preferences ?? SharedPreferencesAsync();

  static const _localeKey = 'omnitask.locale';
  static const _themeKey = 'omnitask.theme';

  final SharedPreferencesAsync _preferences;

  Future<Locale> readLocale() async {
    final languageCode = await _preferences.getString(_localeKey);
    return Locale(languageCode == 'fr' ? 'fr' : 'en');
  }

  Future<void> writeLocale(Locale locale) {
    return _preferences.setString(_localeKey, locale.languageCode);
  }

  Future<ThemeMode> readThemeMode() async {
    final value = await _preferences.getString(_themeKey);
    return switch (value) {
      'light' => ThemeMode.light,
      'dark' => ThemeMode.dark,
      _ => ThemeMode.system,
    };
  }

  Future<void> writeThemeMode(ThemeMode themeMode) {
    return _preferences.setString(_themeKey, themeMode.name);
  }
}
