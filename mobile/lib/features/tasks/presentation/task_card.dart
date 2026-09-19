import 'dart:async';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'package:omnitask_mobile/core/theme/app_theme.dart';
import 'package:omnitask_mobile/core/widgets/haptics.dart';
import 'package:omnitask_mobile/features/tasks/domain/task.dart';
import 'package:omnitask_mobile/features/tasks/presentation/task_status_badge.dart';
import 'package:omnitask_mobile/l10n/app_localizations.dart';

enum TaskAction { edit, delete }

final class TaskCard extends StatelessWidget {
  const TaskCard({
    required this.task,
    required this.index,
    required this.onEdit,
    required this.onDelete,
    super.key,
  });

  final Task task;
  final int index;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final theme = Theme.of(context);
    final colors = theme.extension<OmniTaskColors>()!;
    final disableAnimations = MediaQuery.of(context).disableAnimations;
    final date = DateFormat.MMMd(
      Localizations.localeOf(context).toLanguageTag(),
    ).add_Hm().format(task.updatedAt.toLocal());

    return TweenAnimationBuilder<double>(
      key: ValueKey('${task.id}-${task.version}'),
      duration: disableAnimations
          ? Duration.zero
          : Duration(milliseconds: 280 + (index * 35)),
      curve: Curves.easeOutCubic,
      tween: Tween<double>(begin: 0, end: 1),
      builder: (context, value, child) => Opacity(
        opacity: value,
        child: Transform.translate(
          offset: Offset(0, 12 * (1 - value)),
          child: child,
        ),
      ),
      child: Card(
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () {
            unawaited(Haptics.selection());
            onEdit();
          },
          child: Padding(
            padding: const EdgeInsets.fromLTRB(18, 17, 10, 17),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  width: 4,
                  height: 54,
                  decoration: BoxDecoration(
                    color: _statusColor(theme, task.status),
                    borderRadius: BorderRadius.circular(99),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Expanded(
                            child: Text(
                              task.title,
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w800,
                                decoration: task.status == TaskStatus.done
                                    ? TextDecoration.lineThrough
                                    : null,
                                decorationColor: colors.muted,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          TaskStatusBadge(status: task.status),
                        ],
                      ),
                      if (task.description case final description?
                          when description.isNotEmpty) ...<Widget>[
                        const SizedBox(height: 8),
                        Text(
                          description,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: colors.muted,
                          ),
                        ),
                      ],
                      const SizedBox(height: 10),
                      Text(
                        date,
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: colors.muted,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                PopupMenuButton<TaskAction>(
                  tooltip: l10n.taskActions,
                  onSelected: (action) {
                    unawaited(Haptics.selection());
                    switch (action) {
                      case TaskAction.edit:
                        onEdit();
                      case TaskAction.delete:
                        onDelete();
                    }
                  },
                  itemBuilder: (context) => <PopupMenuEntry<TaskAction>>[
                    PopupMenuItem<TaskAction>(
                      value: TaskAction.edit,
                      child: ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: const Icon(Icons.edit_outlined),
                        title: Text(l10n.edit),
                      ),
                    ),
                    PopupMenuItem<TaskAction>(
                      value: TaskAction.delete,
                      child: ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: Icon(
                          Icons.delete_outline_rounded,
                          color: theme.colorScheme.error,
                        ),
                        title: Text(
                          l10n.delete,
                          style: TextStyle(color: theme.colorScheme.error),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Color _statusColor(ThemeData theme, TaskStatus status) {
    return switch (status) {
      TaskStatus.todo => theme.colorScheme.primary,
      TaskStatus.inProgress => AppColors.warning,
      TaskStatus.done => AppColors.success,
    };
  }
}
