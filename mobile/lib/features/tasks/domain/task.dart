enum TaskStatus {
  todo('TODO'),
  inProgress('IN_PROGRESS'),
  done('DONE');

  const TaskStatus(this.apiValue);

  factory TaskStatus.fromApi(String value) {
    return TaskStatus.values.firstWhere(
      (status) => status.apiValue == value,
      orElse: () => throw FormatException('Unknown task status: $value'),
    );
  }

  final String apiValue;
}

final class Task {
  const Task({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    required this.version,
  });

  factory Task.fromJson(Map<String, Object?> json) {
    return Task(
      id: _requiredString(json, 'id'),
      title: _requiredString(json, 'title'),
      description: json['description'] as String?,
      status: TaskStatus.fromApi(_requiredString(json, 'status')),
      createdAt: DateTime.parse(_requiredString(json, 'createdAt')).toUtc(),
      updatedAt: DateTime.parse(_requiredString(json, 'updatedAt')).toUtc(),
      version: _requiredInt(json, 'version'),
    );
  }

  final String id;
  final String title;
  final String? description;
  final TaskStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int version;
}

final class TaskDraft {
  const TaskDraft({
    required this.title,
    required this.description,
    required this.status,
  });

  final String title;
  final String? description;
  final TaskStatus status;

  Map<String, Object?> toJson() => <String, Object?>{
    'title': title,
    'description': description,
    'status': status.apiValue,
  };
}

String _requiredString(Map<String, Object?> json, String key) {
  final value = json[key];
  if (value is! String) throw FormatException('Missing string field: $key');
  return value;
}

int _requiredInt(Map<String, Object?> json, String key) {
  final value = json[key];
  if (value is! num) throw FormatException('Missing numeric field: $key');
  return value.toInt();
}
