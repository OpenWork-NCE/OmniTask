import 'package:dio/dio.dart';

import 'package:omnitask_mobile/core/network/api_problem.dart';
import 'package:omnitask_mobile/features/auth/domain/session.dart';

final class AuthRepository {
  const AuthRepository(this._dio);

  final Dio _dio;

  Future<Session> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post<Map<String, Object?>>(
        '/api/auth/login',
        data: <String, Object?>{'email': email, 'password': password},
      );
      final data = response.data;
      final token = data?['accessToken'];
      final expiresIn = data?['expiresIn'];
      if (token is! String || expiresIn is! num) {
        throw const ApiProblem(status: 0, code: 'INVALID_RESPONSE');
      }
      return Session(
        accessToken: token,
        expiresAt: DateTime.now().toUtc().add(
          Duration(seconds: expiresIn.toInt()),
        ),
      );
    } on DioException catch (error) {
      throw ApiProblem.fromDioException(error);
    }
  }

  Future<void> register({
    required String email,
    required String password,
  }) async {
    try {
      await _dio.post<void>(
        '/api/auth/register',
        data: <String, Object?>{'email': email, 'password': password},
      );
    } on DioException catch (error) {
      throw ApiProblem.fromDioException(error);
    }
  }
}
