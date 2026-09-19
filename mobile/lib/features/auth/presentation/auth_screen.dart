import 'dart:async';

import 'package:flutter/material.dart';

import 'package:omnitask_mobile/app/app_controller.dart';
import 'package:omnitask_mobile/core/widgets/brand_backdrop.dart';
import 'package:omnitask_mobile/core/widgets/brand_logo.dart';
import 'package:omnitask_mobile/core/widgets/haptics.dart';
import 'package:omnitask_mobile/core/widgets/preferences_sheet.dart';
import 'package:omnitask_mobile/core/widgets/problem_message.dart';
import 'package:omnitask_mobile/features/auth/data/auth_repository.dart';
import 'package:omnitask_mobile/features/auth/presentation/auth_controller.dart';
import 'package:omnitask_mobile/features/auth/presentation/session_controller.dart';
import 'package:omnitask_mobile/l10n/app_localizations.dart';

final class AuthScreen extends StatefulWidget {
  const AuthScreen({
    required this.repository,
    required this.sessionController,
    required this.appController,
    super.key,
  });

  final AuthRepository repository;
  final SessionController sessionController;
  final AppController appController;

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

final class _AuthScreenState extends State<AuthScreen>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  late final AuthController _controller = AuthController(
    widget.repository,
    widget.sessionController,
  );
  late final AnimationController _entranceController = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 650),
  )..forward();
  bool _passwordVisible = false;

  @override
  void initState() {
    super.initState();
    if (widget.sessionController.sessionExpired) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        final l10n = AppLocalizations.of(context);
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(l10n.sessionExpired)));
        widget.sessionController.acknowledgeExpiry();
      });
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _entranceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final theme = Theme.of(context);
    return Scaffold(
      body: Stack(
        children: <Widget>[
          ListenableBuilder(
            listenable: _controller,
            builder: (context, _) => BrandBackdrop(
              key: ValueKey(_controller.mode),
              variant: _controller.mode == AuthMode.login
                  ? BrandBackdropVariant.horizon
                  : BrandBackdropVariant.eclipse,
            ),
          ),
          SafeArea(
            child: Column(
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 14, 12, 4),
                  child: Row(
                    children: <Widget>[
                      const BrandLogo(),
                      const Spacer(),
                      IconButton(
                        tooltip: l10n.settings,
                        onPressed: () {
                          unawaited(Haptics.selection());
                          unawaited(
                            showPreferencesSheet(
                              context,
                              appController: widget.appController,
                            ),
                          );
                        },
                        icon: const Icon(Icons.tune_rounded),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      return SingleChildScrollView(
                        padding: const EdgeInsets.fromLTRB(20, 28, 20, 36),
                        child: ConstrainedBox(
                          constraints: BoxConstraints(
                            minHeight: constraints.maxHeight - 64,
                          ),
                          child: Center(
                            child: AnimatedBuilder(
                              animation: _entranceController,
                              builder: (context, child) {
                                final value = Curves.easeOutCubic.transform(
                                  MediaQuery.of(context).disableAnimations
                                      ? 1
                                      : _entranceController.value,
                                );
                                return Opacity(
                                  opacity: value,
                                  child: Transform.translate(
                                    offset: Offset(0, 18 * (1 - value)),
                                    child: child,
                                  ),
                                );
                              },
                              child: ConstrainedBox(
                                constraints: const BoxConstraints(
                                  maxWidth: 520,
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: <Widget>[
                                    Text(
                                      l10n.loginEyebrow,
                                      style: theme.textTheme.labelMedium
                                          ?.copyWith(
                                            color: theme.colorScheme.primary,
                                            fontWeight: FontWeight.w800,
                                            letterSpacing: 1.6,
                                          ),
                                    ),
                                    const SizedBox(height: 10),
                                    Text(
                                      l10n.loginTitle,
                                      style: theme.textTheme.displaySmall
                                          ?.copyWith(
                                            fontFamily: 'Unbounded',
                                            fontWeight: FontWeight.w800,
                                            letterSpacing: -1.6,
                                            height: 1.08,
                                          ),
                                    ),
                                    const SizedBox(height: 14),
                                    Text(
                                      l10n.loginDescription,
                                      style: theme.textTheme.titleMedium
                                          ?.copyWith(
                                            color: theme
                                                .colorScheme
                                                .onSurfaceVariant,
                                          ),
                                    ),
                                    const SizedBox(height: 30),
                                    _buildAuthCard(l10n),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAuthCard(AppLocalizations l10n) {
    return ListenableBuilder(
      listenable: _controller,
      builder: (context, _) {
        final registering = _controller.mode == AuthMode.register;
        return Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: <Widget>[
                  SegmentedButton<AuthMode>(
                    segments: <ButtonSegment<AuthMode>>[
                      ButtonSegment<AuthMode>(
                        value: AuthMode.login,
                        label: Text(l10n.loginTab),
                      ),
                      ButtonSegment<AuthMode>(
                        value: AuthMode.register,
                        label: Text(l10n.registerTab),
                      ),
                    ],
                    selected: <AuthMode>{_controller.mode},
                    showSelectedIcon: false,
                    onSelectionChanged: _controller.submitting
                        ? null
                        : (selection) {
                            unawaited(Haptics.selection());
                            _controller.selectMode(selection.single);
                          },
                  ),
                  const SizedBox(height: 22),
                  if (_controller.accountCreated) ...<Widget>[
                    _SuccessMessage(message: l10n.accountCreated),
                    const SizedBox(height: 16),
                  ],
                  if (_controller.problem != null) ...<Widget>[
                    ProblemMessage(
                      message: localizedProblem(l10n, _controller.problem),
                    ),
                    const SizedBox(height: 16),
                  ],
                  TextFormField(
                    controller: _emailController,
                    enabled: !_controller.submitting,
                    autofillHints: const <String>[AutofillHints.email],
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    autocorrect: false,
                    decoration: InputDecoration(
                      labelText: l10n.emailLabel,
                      hintText: l10n.emailHint,
                      prefixIcon: const Icon(Icons.alternate_email_rounded),
                    ),
                    validator: (value) => _validateEmail(l10n, value),
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _passwordController,
                    enabled: !_controller.submitting,
                    autofillHints: registering
                        ? const <String>[AutofillHints.newPassword]
                        : const <String>[AutofillHints.password],
                    obscureText: !_passwordVisible,
                    textInputAction: TextInputAction.done,
                    onFieldSubmitted: (_) => _submit(),
                    decoration: InputDecoration(
                      labelText: l10n.passwordLabel,
                      hintText: l10n.passwordHint,
                      prefixIcon: const Icon(Icons.lock_outline_rounded),
                      suffixIcon: IconButton(
                        tooltip: _passwordVisible
                            ? l10n.hidePassword
                            : l10n.showPassword,
                        onPressed: () {
                          unawaited(Haptics.selection());
                          setState(() => _passwordVisible = !_passwordVisible);
                        },
                        icon: Icon(
                          _passwordVisible
                              ? Icons.visibility_off_outlined
                              : Icons.visibility_outlined,
                        ),
                      ),
                    ),
                    validator: (value) => _validatePassword(l10n, value),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: _controller.submitting ? null : _submit,
                    child: _controller.submitting
                        ? const SizedBox.square(
                            dimension: 22,
                            child: CircularProgressIndicator(strokeWidth: 2.5),
                          )
                        : Text(registering ? l10n.createAccount : l10n.signIn),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  String? _validateEmail(AppLocalizations l10n, String? value) {
    final email = value?.trim() ?? '';
    if (email.isEmpty) return l10n.emailRequired;
    if (email.length > 254 ||
        !RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email)) {
      return l10n.emailInvalid;
    }
    return null;
  }

  String? _validatePassword(AppLocalizations l10n, String? value) {
    if (value == null || value.isEmpty) return l10n.passwordRequired;
    if (value.length < 12 || value.length > 128) return l10n.passwordLength;
    return null;
  }

  Future<void> _submit() async {
    FocusManager.instance.primaryFocus?.unfocus();
    if (!(_formKey.currentState?.validate() ?? false)) {
      unawaited(Haptics.warning());
      return;
    }
    final success = await _controller.submit(
      email: _emailController.text.trim(),
      password: _passwordController.text,
    );
    if (!mounted) return;
    if (success) {
      unawaited(Haptics.success());
      if (_controller.accountCreated) _passwordController.clear();
    } else {
      unawaited(Haptics.warning());
    }
  }
}

final class _SuccessMessage extends StatelessWidget {
  const _SuccessMessage({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      liveRegion: true,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFF0A9E78).withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: <Widget>[
            const Icon(
              Icons.check_circle_outline_rounded,
              color: Color(0xFF0A9E78),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
