import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import 'package:omnitask_mobile/app/app_controller.dart';
import 'package:omnitask_mobile/core/network/api_problem.dart';
import 'package:omnitask_mobile/core/theme/app_theme.dart';
import 'package:omnitask_mobile/core/widgets/brand_backdrop.dart';
import 'package:omnitask_mobile/core/widgets/brand_logo.dart';
import 'package:omnitask_mobile/core/widgets/haptics.dart';
import 'package:omnitask_mobile/core/widgets/preferences_sheet.dart';
import 'package:omnitask_mobile/core/widgets/problem_message.dart';
import 'package:omnitask_mobile/features/auth/presentation/session_controller.dart';
import 'package:omnitask_mobile/features/tasks/data/task_repository.dart';
import 'package:omnitask_mobile/features/tasks/domain/task.dart';
import 'package:omnitask_mobile/features/tasks/presentation/task_card.dart';
import 'package:omnitask_mobile/features/tasks/presentation/task_editor_sheet.dart';
import 'package:omnitask_mobile/features/tasks/presentation/task_labels.dart';
import 'package:omnitask_mobile/features/tasks/presentation/tasks_controller.dart';
import 'package:omnitask_mobile/l10n/app_localizations.dart';

final class TasksScreen extends StatefulWidget {
  const TasksScreen({
    required this.repository,
    required this.sessionController,
    required this.appController,
    super.key,
  });

  final TaskRepository repository;
  final SessionController sessionController;
  final AppController appController;

  @override
  State<TasksScreen> createState() => _TasksScreenState();
}

final class _TasksScreenState extends State<TasksScreen> {
  late final TasksController _controller = TasksController(widget.repository);
  final _searchController = TextEditingController();
  Timer? _searchTimer;

  @override
  void initState() {
    super.initState();
    unawaited(_controller.load());
  }

  @override
  void dispose() {
    _searchTimer?.cancel();
    _searchController.dispose();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final theme = Theme.of(context);
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const BrandLogo(height: 28),
        actions: <Widget>[
          IconButton(
            tooltip: l10n.refresh,
            onPressed: () {
              unawaited(Haptics.selection());
              unawaited(_controller.load(showLoader: false));
            },
            icon: const Icon(Icons.refresh_rounded),
          ),
          IconButton(
            tooltip: l10n.settings,
            onPressed: () {
              unawaited(Haptics.selection());
              unawaited(
                showPreferencesSheet(
                  context,
                  appController: widget.appController,
                  onSignOut: () => widget.sessionController.signOut(),
                ),
              );
            },
            icon: const Icon(Icons.tune_rounded),
          ),
          const SizedBox(width: 6),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openEditor(),
        backgroundColor: theme.colorScheme.primary,
        foregroundColor: theme.colorScheme.onPrimary,
        icon: const Icon(Icons.add_rounded),
        label: Text(
          l10n.newTask,
          style: const TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
      body: Stack(
        children: <Widget>[
          const BrandBackdrop(variant: BrandBackdropVariant.matrix),
          SafeArea(
            bottom: false,
            child: ListenableBuilder(
              listenable: _controller,
              builder: (context, _) => RefreshIndicator(
                onRefresh: () async {
                  unawaited(Haptics.subtle());
                  await _controller.load(showLoader: false);
                },
                child: CustomScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  keyboardDismissBehavior:
                      ScrollViewKeyboardDismissBehavior.onDrag,
                  slivers: <Widget>[
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(20, 26, 20, 8),
                      sliver: SliverToBoxAdapter(child: _buildHeader(l10n)),
                    ),
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(20, 14, 20, 14),
                      sliver: SliverToBoxAdapter(child: _buildToolbar(l10n)),
                    ),
                    ..._buildTaskContent(l10n),
                    const SliverPadding(padding: EdgeInsets.only(bottom: 108)),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(AppLocalizations l10n) {
    final theme = Theme.of(context);
    final colors = theme.extension<OmniTaskColors>()!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          l10n.tasksEyebrow,
          style: theme.textTheme.labelMedium?.copyWith(
            color: theme.colorScheme.primary,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.6,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          l10n.tasksTitle,
          style: theme.textTheme.displaySmall?.copyWith(
            fontFamily: 'Unbounded',
            fontWeight: FontWeight.w800,
            letterSpacing: -1.6,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          l10n.tasksDescription,
          style: theme.textTheme.titleMedium?.copyWith(color: colors.muted),
        ),
      ],
    );
  }

  Widget _buildToolbar(AppLocalizations l10n) {
    final statuses = <TaskStatus?>[null, ...TaskStatus.values];
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            TextField(
              controller: _searchController,
              maxLength: 200,
              textInputAction: TextInputAction.search,
              decoration: InputDecoration(
                labelText: l10n.searchTasks,
                hintText: l10n.searchHint,
                counterText: '',
                prefixIcon: const Icon(Icons.search_rounded),
                suffixIcon: _searchController.text.isEmpty
                    ? null
                    : IconButton(
                        tooltip: l10n.close,
                        onPressed: () {
                          _searchController.clear();
                          _queueSearch('');
                          setState(() {});
                        },
                        icon: const Icon(Icons.close_rounded),
                      ),
              ),
              onChanged: (value) {
                _queueSearch(value);
                setState(() {});
              },
            ),
            const SizedBox(height: 12),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: statuses
                    .map((status) {
                      final selected = _controller.status == status;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: FilterChip(
                          selected: selected,
                          showCheckmark: false,
                          avatar: selected
                              ? const Icon(Icons.check_rounded, size: 16)
                              : null,
                          label: Text(
                            status == null
                                ? l10n.filterAll
                                : taskStatusLabel(l10n, status),
                          ),
                          onSelected: (_) {
                            unawaited(Haptics.selection());
                            unawaited(_controller.setStatus(status));
                          },
                        ),
                      );
                    })
                    .toList(growable: false),
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildTaskContent(AppLocalizations l10n) {
    if (_controller.state == TaskLoadState.loading) {
      return <Widget>[
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          sliver: SliverList.builder(
            itemCount: 4,
            itemBuilder: (context, index) => const Padding(
              padding: EdgeInsets.only(bottom: 12),
              child: _TaskSkeleton(),
            ),
          ),
        ),
      ];
    }
    if (_controller.state == TaskLoadState.failed) {
      return <Widget>[
        SliverPadding(
          padding: const EdgeInsets.all(20),
          sliver: SliverToBoxAdapter(
            child: Column(
              children: <Widget>[
                ProblemMessage(
                  message: localizedProblem(l10n, _controller.problem),
                ),
                const SizedBox(height: 14),
                OutlinedButton.icon(
                  onPressed: () => _controller.load(),
                  icon: const Icon(Icons.refresh_rounded),
                  label: Text(l10n.retry),
                ),
              ],
            ),
          ),
        ),
      ];
    }

    final result = _controller.result!;
    if (result.items.isEmpty) {
      return <Widget>[
        SliverFillRemaining(
          hasScrollBody: false,
          child: _EmptyTasks(
            filtered:
                _controller.query.isNotEmpty || _controller.status != null,
          ),
        ),
      ];
    }
    return <Widget>[
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
        sliver: SliverToBoxAdapter(
          child: Text(
            l10n.taskCount(result.totalElements),
            style: Theme.of(context).textTheme.labelLarge
                ?.copyWith(fontWeight: FontWeight.w800),
          ),
        ),
      ),
      SliverPadding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        sliver: SliverList.builder(
          itemCount: result.items.length,
          itemBuilder: (context, index) {
            final task = result.items[index];
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: TaskCard(
                task: task,
                index: index,
                onEdit: () => _openEditor(task),
                onDelete: () => _confirmDelete(task),
              ),
            );
          },
        ),
      ),
      if (result.totalPages > 1)
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
          sliver: SliverToBoxAdapter(
            child: Row(
              children: <Widget>[
                IconButton.filledTonal(
                  tooltip: l10n.previousPage,
                  onPressed: result.page > 0
                      ? () => _controller.load(page: result.page - 1)
                      : null,
                  icon: const Icon(Icons.arrow_back_rounded),
                ),
                Expanded(
                  child: Text(
                    '${result.page + 1} / ${result.totalPages}',
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontWeight: FontWeight.w800),
                  ),
                ),
                IconButton.filledTonal(
                  tooltip: l10n.nextPage,
                  onPressed: result.page + 1 < result.totalPages
                      ? () => _controller.load(page: result.page + 1)
                      : null,
                  icon: const Icon(Icons.arrow_forward_rounded),
                ),
              ],
            ),
          ),
        ),
    ];
  }

  void _queueSearch(String value) {
    _searchTimer?.cancel();
    _searchTimer = Timer(const Duration(milliseconds: 350), () {
      unawaited(_controller.setQuery(value));
    });
  }

  Future<void> _openEditor([Task? task]) async {
    unawaited(Haptics.selection());
    final created = task == null;
    final saved = await showTaskEditorSheet(
      context,
      task: task,
      onSave: (draft) =>
          created ? _controller.create(draft) : _controller.update(task, draft),
      onConflictReload: () => _controller.load(showLoader: false),
    );
    if (!mounted || saved != true) return;
    _showMessage(
      created
          ? AppLocalizations.of(context).taskCreated
          : AppLocalizations.of(context).taskUpdated,
    );
  }

  Future<void> _confirmDelete(Task task) async {
    final l10n = AppLocalizations.of(context);
    unawaited(Haptics.warning());
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        icon: Icon(
          Icons.delete_outline_rounded,
          color: Theme.of(context).colorScheme.error,
        ),
        title: Text(l10n.deleteTaskQuestion(task.title)),
        content: Text(l10n.deleteTaskDescription),
        actions: <Widget>[
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(l10n.cancel),
          ),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
              foregroundColor: Theme.of(context).colorScheme.onError,
            ),
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(l10n.deleteTask),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await _controller.delete(task);
      unawaited(Haptics.success());
      if (mounted) _showMessage(l10n.taskDeleted);
    } on ApiProblem catch (problem) {
      unawaited(Haptics.warning());
      if (mounted) _showMessage(localizedProblem(l10n, problem));
    }
  }

  void _showMessage(String message) {
    final messenger = ScaffoldMessenger.of(context);
    messenger
      ..clearSnackBars()
      ..showSnackBar(
        SnackBar(
          content: Row(
            children: <Widget>[
              const Icon(
                Icons.check_circle_outline_rounded,
                color: Colors.white,
              ),
              const SizedBox(width: 10),
              Expanded(child: Text(message)),
            ],
          ),
        ),
      );
  }
}

final class _EmptyTasks extends StatelessWidget {
  const _EmptyTasks({required this.filtered});

  final bool filtered;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final colors = Theme.of(context).extension<OmniTaskColors>()!;
    return Center(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(36, 18, 36, 100),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            SvgPicture.asset(
              'assets/graphics/orbit-blue.svg',
              width: 92,
              height: 92,
              excludeFromSemantics: true,
            ),
            const SizedBox(height: 20),
            Text(
              filtered ? l10n.filteredEmptyTitle : l10n.emptyTitle,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontFamily: 'Unbounded',
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              filtered ? l10n.filteredEmptyDescription : l10n.emptyDescription,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge
                  ?.copyWith(color: colors.muted),
            ),
          ],
        ),
      ),
    );
  }
}

final class _TaskSkeleton extends StatelessWidget {
  const _TaskSkeleton();

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme.onSurface
        .withValues(alpha: 0.07);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Container(width: 190, height: 18, decoration: _decoration(color)),
            const SizedBox(height: 13),
            Container(
              width: double.infinity,
              height: 12,
              decoration: _decoration(color),
            ),
            const SizedBox(height: 8),
            Container(width: 130, height: 12, decoration: _decoration(color)),
          ],
        ),
      ),
    );
  }

  BoxDecoration _decoration(Color color) {
    return BoxDecoration(color: color, borderRadius: BorderRadius.circular(99));
  }
}
