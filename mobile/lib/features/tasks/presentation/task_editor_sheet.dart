import 'dart:async';

import 'package:flutter/material.dart';

import 'package:omnitask_mobile/core/network/api_problem.dart';
import 'package:omnitask_mobile/core/widgets/haptics.dart';
import 'package:omnitask_mobile/core/widgets/problem_message.dart';
import 'package:omnitask_mobile/features/tasks/domain/task.dart';
import 'package:omnitask_mobile/features/tasks/presentation/task_labels.dart';
import 'package:omnitask_mobile/l10n/app_localizations.dart';

Future<bool?> showTaskEditorSheet(
  BuildContext context, {
  required Future<void> Function(TaskDraft draft) onSave,
  required Future<void> Function() onConflictReload,
  Task? task,
}) {
  return showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    useSafeArea: true,
    builder: (context) => TaskEditorSheet(
      task: task,
      onSave: onSave,
      onConflictReload: onConflictReload,
    ),
  );
}

final class TaskEditorSheet extends StatefulWidget {
  const TaskEditorSheet({
    required this.onSave,
    required this.onConflictReload,
    this.task,
    super.key,
  });

  final Task? task;
  final Future<void> Function(TaskDraft draft) onSave;
  final Future<void> Function() onConflictReload;

  @override
  State<TaskEditorSheet> createState() => _TaskEditorSheetState();
}

final class _TaskEditorSheetState extends State<TaskEditorSheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _titleController = TextEditingController(
    text: widget.task?.title,
  );
  late final TextEditingController _descriptionController =
      TextEditingController(text: widget.task?.description);
  late TaskStatus _status = widget.task?.status ?? TaskStatus.todo;
  bool _submitting = false;
  ApiProblem? _problem;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final editing = widget.task != null;
    return PopScope(
      canPop: !_submitting,
      child: AnimatedPadding(
        duration: const Duration(milliseconds: 180),
        curve: Curves.easeOut,
        padding: EdgeInsets.only(
          bottom: MediaQuery.viewInsetsOf(context).bottom,
        ),
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 28),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                Text(
                  editing ? l10n.editTask : l10n.newTask,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontFamily: 'Unbounded',
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 20),
                if (_problem != null) ...<Widget>[
                  ProblemMessage(message: localizedProblem(l10n, _problem)),
                  if (_problem!.code == 'TASK_VERSION_CONFLICT') ...<Widget>[
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      onPressed: _submitting ? null : _reloadAfterConflict,
                      icon: const Icon(Icons.refresh_rounded),
                      label: Text(l10n.reloadTasks),
                    ),
                  ],
                  const SizedBox(height: 16),
                ],
                TextFormField(
                  controller: _titleController,
                  enabled: !_submitting,
                  autofocus: !editing,
                  maxLength: 200,
                  textInputAction: TextInputAction.next,
                  decoration: InputDecoration(
                    labelText: l10n.taskTitleLabel,
                    hintText: l10n.taskTitleHint,
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return l10n.taskTitleRequired;
                    }
                    if (value.trim().length > 200) return l10n.taskTitleLength;
                    return null;
                  },
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _descriptionController,
                  enabled: !_submitting,
                  maxLength: 5000,
                  minLines: 3,
                  maxLines: 6,
                  keyboardType: TextInputType.multiline,
                  decoration: InputDecoration(
                    labelText: l10n.taskDescriptionLabel,
                    hintText: l10n.taskDescriptionHint,
                    alignLabelWithHint: true,
                  ),
                  validator: (value) {
                    if ((value?.length ?? 0) > 5000) {
                      return l10n.taskDescriptionLength;
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<TaskStatus>(
                  initialValue: _status,
                  decoration: InputDecoration(labelText: l10n.taskStatusLabel),
                  items: TaskStatus.values
                      .map(
                        (status) => DropdownMenuItem<TaskStatus>(
                          value: status,
                          child: Text(taskStatusLabel(l10n, status)),
                        ),
                      )
                      .toList(growable: false),
                  onChanged: _submitting
                      ? null
                      : (status) {
                          if (status == null) return;
                          unawaited(Haptics.selection());
                          setState(() => _status = status);
                        },
                ),
                const SizedBox(height: 22),
                Row(
                  children: <Widget>[
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _submitting
                            ? null
                            : () => Navigator.of(context).pop(),
                        child: Text(l10n.cancel),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton(
                        onPressed: _submitting ? null : _submit,
                        child: _submitting
                            ? const SizedBox.square(
                                dimension: 22,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                ),
                              )
                            : Text(editing ? l10n.saveChanges : l10n.saveTask),
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

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) {
      unawaited(Haptics.warning());
      return;
    }
    setState(() {
      _submitting = true;
      _problem = null;
    });
    final description = _descriptionController.text.trim();
    try {
      await widget.onSave(
        TaskDraft(
          title: _titleController.text.trim(),
          description: description.isEmpty ? null : description,
          status: _status,
        ),
      );
      unawaited(Haptics.success());
      if (mounted) Navigator.of(context).pop(true);
    } on ApiProblem catch (problem) {
      unawaited(Haptics.warning());
      if (mounted) setState(() => _problem = problem);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<void> _reloadAfterConflict() async {
    setState(() => _submitting = true);
    await widget.onConflictReload();
    if (!mounted) return;
    Navigator.of(context).pop();
  }
}
