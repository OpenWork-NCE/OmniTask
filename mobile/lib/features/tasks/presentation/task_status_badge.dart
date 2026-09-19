import 'package:flutter/material.dart';

import 'package:omnitask_mobile/core/theme/app_theme.dart';
import 'package:omnitask_mobile/features/tasks/domain/task.dart';
import 'package:omnitask_mobile/features/tasks/presentation/task_labels.dart';
import 'package:omnitask_mobile/l10n/app_localizations.dart';

final class TaskStatusBadge extends StatelessWidget {
  const TaskStatusBadge({required this.status, super.key});

  final TaskStatus status;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final color = switch (status) {
      TaskStatus.todo => Theme.of(context).colorScheme.primary,
      TaskStatus.inProgress => AppColors.warning,
      TaskStatus.done => AppColors.success,
    };
    return AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withValues(alpha: 0.28)),
      ),
      child: Text(
        taskStatusLabel(l10n, status),
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}
