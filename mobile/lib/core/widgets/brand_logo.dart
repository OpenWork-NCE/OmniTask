import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

final class BrandLogo extends StatelessWidget {
  const BrandLogo({this.height = 30, super.key});

  final double height;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    return SvgPicture.asset(
      dark ? 'assets/brand/logo-white.svg' : 'assets/brand/logo-primary.svg',
      height: height,
      semanticsLabel: 'OmniTask',
    );
  }
}
