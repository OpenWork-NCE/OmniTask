import 'package:dio/dio.dart';

final class ApiProblem implements Exception {
  const ApiProblem({
    required this.status,
    required this.code,
    this.detail,
    this.correlationId,
    this.validationErrors = const <FieldViolation>[],
  });

  factory ApiProblem.fromDioException(DioException exception) {
    final response = exception.response;
    final data = response?.data;
    if (data is Map<String, Object?>) {
      final rawErrors = data['errors'];
      final errors = rawErrors is List<Object?>
          ? rawErrors
                .whereType<Map<String, Object?>>()
                .map(FieldViolation.fromJson)
                .toList()
          : const <FieldViolation>[];
      return ApiProblem(
        status: response?.statusCode ?? 0,
        code: data['code'] is String
            ? data['code']! as String
            : 'UNEXPECTED_ERROR',
        detail: data['detail'] is String ? data['detail']! as String : null,
        correlationId: data['correlationId'] is String
            ? data['correlationId']! as String
            : null,
        validationErrors: errors,
      );
    }
    return ApiProblem(
      status: response?.statusCode ?? 0,
      code: response == null ? 'NETWORK_ERROR' : 'UNEXPECTED_ERROR',
    );
  }

  final int status;
  final String code;
  final String? detail;
  final String? correlationId;
  final List<FieldViolation> validationErrors;
}

final class FieldViolation {
  const FieldViolation({required this.field, required this.message});

  factory FieldViolation.fromJson(Map<String, Object?> json) {
    return FieldViolation(
      field: json['field'] is String ? json['field']! as String : '',
      message: json['message'] is String ? json['message']! as String : '',
    );
  }

  final String field;
  final String message;
}
