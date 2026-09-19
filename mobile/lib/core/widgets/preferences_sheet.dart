import 'dart:async';

import 'package:flutter/material.dart';

import 'package:omnitask_mobile/app/app_controller.dart';
import 'package:omnitask_mobile/core/widgets/haptics.dart';
import 'package:omnitask_mobile/l10n/app_localizations.dart';

Future<void> showPreferencesSheet(
  BuildContext context, {
  required AppController appController,
  Future<void> Function()? onSignOut,
}) {
  return showModalBottomSheet<void>(
    context: context,
    showDragHandle: true,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (context) =>
        _PreferencesSheet(appController: appController, onSignOut: onSignOut),
  );
}

final class _PreferencesSheet extends StatelessWidget {
  const _PreferencesSheet({required this.appController, this.onSignOut});

  final AppController appController;
  final Future<void> Function()? onSignOut;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return ListenableBuilder(
      listenable: appController,
      builder: (context, _) {
        return SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 28),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                l10n.settings,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontFamily: 'Unbounded',
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                l10n.language,
                style: Theme.of(context).textTheme.titleSmall,
              ),
              const SizedBox(height: 10),
              SegmentedButton<String>(
                segments: <ButtonSegment<String>>[
                  ButtonSegment<String>(value: 'en', label: Text(l10n.english)),
                  ButtonSegment<String>(value: 'fr', label: Text(l10n.french)),
                ],
                selected: <String>{appController.locale.languageCode},
                onSelectionChanged: (selection) {
                  unawaited(Haptics.selection());
                  unawaited(appController.setLocale(Locale(selection.single)));
                },
              ),
              const SizedBox(height: 24),
              Text(l10n.theme, style: Theme.of(context).textTheme.titleSmall),
              const SizedBox(height: 10),
              SegmentedButton<ThemeMode>(
                segments: <ButtonSegment<ThemeMode>>[
                  ButtonSegment<ThemeMode>(
                    value: ThemeMode.system,
                    icon: const Icon(Icons.brightness_auto_rounded),
                    label: Text(l10n.themeSystem),
                  ),
                  ButtonSegment<ThemeMode>(
                    value: ThemeMode.light,
                    icon: const Icon(Icons.light_mode_rounded),
                    label: Text(l10n.themeLight),
                  ),
                  ButtonSegment<ThemeMode>(
                    value: ThemeMode.dark,
                    icon: const Icon(Icons.dark_mode_rounded),
                    label: Text(l10n.themeDark),
                  ),
                ],
                selected: <ThemeMode>{appController.themeMode},
                showSelectedIcon: false,
                onSelectionChanged: (selection) {
                  unawaited(Haptics.selection());
                  unawaited(appController.setThemeMode(selection.single));
                },
              ),
              if (onSignOut != null) ...<Widget>[
                const SizedBox(height: 28),
                const Divider(),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () async {
                      unawaited(Haptics.subtle());
                      Navigator.of(context).pop();
                      await onSignOut!();
                    },
                    icon: const Icon(Icons.logout_rounded),
                    label: Text(l10n.signOut),
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}
