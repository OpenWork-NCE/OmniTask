import 'package:omnitask_mobile/features/tasks/domain/task.dart';
import 'package:omnitask_mobile/l10n/app_localizations.dart';

String taskStatusLabel(AppLocalizations l10n, TaskStatus status) {
  return switch (status) {
    TaskStatus.todo => l10n.statusTodo,
    TaskStatus.inProgress => l10n.statusInProgress,
    TaskStatus.done => l10n.statusDone,
  };
}
