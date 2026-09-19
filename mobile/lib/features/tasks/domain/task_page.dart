import 'package:omnitask_mobile/features/tasks/domain/task.dart';

final class TaskPage {
  const TaskPage({
    required this.items,
    required this.page,
    required this.size,
    required this.totalElements,
    required this.totalPages,
  });

  factory TaskPage.fromJson(Map<String, Object?> json) {
    final rawItems = json['items'];
    if (rawItems is! List<Object?>) {
      throw const FormatException('Missing task items');
    }
    return TaskPage(
      items: rawItems
          .map((item) {
            if (item is! Map<String, Object?>) {
              throw const FormatException('Invalid task item');
            }
            return Task.fromJson(item);
          })
          .toList(growable: false),
      page: _requiredInt(json, 'page'),
      size: _requiredInt(json, 'size'),
      totalElements: _requiredInt(json, 'totalElements'),
      totalPages: _requiredInt(json, 'totalPages'),
    );
  }

  final List<Task> items;
  final int page;
  final int size;
  final int totalElements;
  final int totalPages;
}

int _requiredInt(Map<String, Object?> json, String key) {
  final value = json[key];
  if (value is! num) throw FormatException('Missing numeric field: $key');
  return value.toInt();
}
