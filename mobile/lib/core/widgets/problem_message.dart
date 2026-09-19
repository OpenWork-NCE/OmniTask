import 'package:flutter/material.dart';

import 'package:omnitask_mobile/core/network/api_problem.dart';
import 'package:omnitask_mobile/l10n/app_localizations.dart';

String localizedProblem(AppLocalizations l10n, ApiProblem? problem) {
  return switch (problem?.code) {
    'INVALID_CREDENTIALS' => l10n.invalidCredentials,
    'EMAIL_ALREADY_REGISTERED' => l10n.emailAlreadyRegistered,
    'TASK_NOT_FOUND' => l10n.taskMissing,
    'TASK_VERSION_CONFLICT' => l10n.conflictDescription,
    'NETWORK_ERROR' => l10n.networkError,
    _ => l10n.unexpectedError,
  };
}

final class ProblemMessage extends StatelessWidget {
  const ProblemMessage({required this.message, super.key});

  final String message;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Semantics(
      liveRegion: true,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: scheme.errorContainer,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Icon(Icons.error_outline_rounded, color: scheme.onErrorContainer),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: TextStyle(
                  color: scheme.onErrorContainer,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
