import 'package:flutter/material.dart';

abstract final class AppColors {
  static const canvasLight = Color(0xFFF5F4F0);
  static const surfaceLight = Color(0xFFFFFFFF);
  static const textLight = Color(0xFF0B0D12);
  static const mutedLight = Color(0xFF566174);
  static const canvasDark = Color(0xFF0B0D12);
  static const surfaceDark = Color(0xFF151922);
  static const textDark = Color(0xFFF5F4F0);
  static const mutedDark = Color(0xFFB8BFCD);
  static const brand = Color(0xFF3159DB);
  static const brandBright = Color(0xFF4169F5);
  static const success = Color(0xFF0A9E78);
  static const warning = Color(0xFFE09F3E);
  static const danger = Color(0xFFC43D36);
}

abstract final class AppTheme {
  static ThemeData light() => _theme(Brightness.light);

  static ThemeData dark() => _theme(Brightness.dark);

  static ThemeData _theme(Brightness brightness) {
    final dark = brightness == Brightness.dark;
    final canvas = dark ? AppColors.canvasDark : AppColors.canvasLight;
    final surface = dark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final text = dark ? AppColors.textDark : AppColors.textLight;
    final muted = dark ? AppColors.mutedDark : AppColors.mutedLight;
    final brand = dark ? AppColors.brandBright : AppColors.brand;
    final scheme = ColorScheme.fromSeed(
      seedColor: brand,
      brightness: brightness,
      surface: surface,
      error: AppColors.danger,
    );
    final inputBorder = OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: BorderSide(color: muted.withValues(alpha: 0.35)),
    );

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: scheme,
      scaffoldBackgroundColor: canvas,
      fontFamily: 'Funnel Display',
      splashFactory: InkSparkle.splashFactory,
      textTheme: ThemeData(brightness: brightness).textTheme.apply(
        bodyColor: text,
        displayColor: text,
        fontFamily: 'Funnel Display',
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: canvas.withValues(alpha: 0.92),
        foregroundColor: text,
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
      cardTheme: CardThemeData(
        color: surface.withValues(alpha: 0.97),
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(22),
          side: BorderSide(color: muted.withValues(alpha: 0.18)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surface.withValues(alpha: 0.94),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 18,
          vertical: 16,
        ),
        border: inputBorder,
        enabledBorder: inputBorder,
        focusedBorder: inputBorder.copyWith(
          borderSide: BorderSide(color: brand, width: 2),
        ),
        errorBorder: inputBorder.copyWith(
          borderSide: const BorderSide(color: AppColors.danger),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          minimumSize: const Size.fromHeight(54),
          backgroundColor: brand,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: const TextStyle(
            fontFamily: 'Funnel Display',
            fontSize: 16,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: dark
            ? const Color(0xFF242B3A)
            : const Color(0xFF101728),
        contentTextStyle: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w600,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      dividerColor: muted.withValues(alpha: 0.2),
      extensions: <ThemeExtension<dynamic>>[
        OmniTaskColors(
          muted: muted,
          canvas: canvas,
          surface: surface,
          brand: brand,
        ),
      ],
    );
  }
}

@immutable
final class OmniTaskColors extends ThemeExtension<OmniTaskColors> {
  const OmniTaskColors({
    required this.muted,
    required this.canvas,
    required this.surface,
    required this.brand,
  });

  final Color muted;
  final Color canvas;
  final Color surface;
  final Color brand;

  @override
  OmniTaskColors copyWith({
    Color? muted,
    Color? canvas,
    Color? surface,
    Color? brand,
  }) {
    return OmniTaskColors(
      muted: muted ?? this.muted,
      canvas: canvas ?? this.canvas,
      surface: surface ?? this.surface,
      brand: brand ?? this.brand,
    );
  }

  @override
  OmniTaskColors lerp(OmniTaskColors? other, double t) {
    if (other == null) return this;
    return OmniTaskColors(
      muted: Color.lerp(muted, other.muted, t)!,
      canvas: Color.lerp(canvas, other.canvas, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      brand: Color.lerp(brand, other.brand, t)!,
    );
  }
}
