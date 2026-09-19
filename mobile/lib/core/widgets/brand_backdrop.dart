import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

enum BrandBackdropVariant { horizon, eclipse, matrix }

final class BrandBackdrop extends StatefulWidget {
  const BrandBackdrop({required this.variant, super.key});

  final BrandBackdropVariant variant;

  @override
  State<BrandBackdrop> createState() => _BrandBackdropState();
}

final class _BrandBackdropState extends State<BrandBackdrop>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 18),
  );

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final disableAnimations = MediaQuery.disableAnimationsOf(context);
    if (disableAnimations) {
      _controller.stop();
      _controller.value = 0;
    } else if (!_controller.isAnimating) {
      _controller.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final disableAnimations = MediaQuery.disableAnimationsOf(context);
    final name = widget.variant.name;
    final asset = 'assets/graphics/$name-${dark ? 'dark' : 'light'}.svg';
    final image = SvgPicture.asset(
      asset,
      fit: BoxFit.cover,
      excludeFromSemantics: true,
    );

    return Positioned.fill(
      child: IgnorePointer(
        child: Opacity(
          opacity: widget.variant == BrandBackdropVariant.matrix ? 0.07 : 0.18,
          child: disableAnimations
              ? image
              : AnimatedBuilder(
                  animation: _controller,
                  builder: (context, child) {
                    final value = Curves.easeInOut.transform(_controller.value);
                    return Transform.translate(
                      offset: Offset(5 * value, -4 * value),
                      child: Transform.scale(
                        scale: 1 + (0.018 * value),
                        child: child,
                      ),
                    );
                  },
                  child: image,
                ),
        ),
      ),
    );
  }
}
