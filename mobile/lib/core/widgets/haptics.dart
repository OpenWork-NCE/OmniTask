import 'package:flutter/services.dart';

abstract final class Haptics {
  static Future<void> selection() => HapticFeedback.selectionClick();

  static Future<void> success() => HapticFeedback.mediumImpact();

  static Future<void> warning() => HapticFeedback.heavyImpact();

  static Future<void> subtle() => HapticFeedback.lightImpact();
}
