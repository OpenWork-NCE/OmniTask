import 'dart:io';

abstract final class AppConfig {
  static const _configuredBaseUrl = String.fromEnvironment('API_BASE_URL');

  static Uri get apiBaseUrl {
    final rawUrl = _configuredBaseUrl.isNotEmpty
        ? _configuredBaseUrl
        : Platform.isAndroid
        ? 'http://10.0.2.2:8080'
        : 'http://127.0.0.1:8080';
    final uri = Uri.tryParse(rawUrl);
    if (uri == null || !uri.hasScheme || uri.host.isEmpty) {
      throw const FormatException('API_BASE_URL must be an absolute URL');
    }
    return uri;
  }
}
