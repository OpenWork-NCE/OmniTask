import 'package:dio/dio.dart';

import 'package:omnitask_mobile/core/config/app_config.dart';

typedef AccessTokenProvider = String? Function();
typedef UnauthorizedCallback = Future<void> Function();

final class ApiClient {
  ApiClient({
    required AccessTokenProvider accessTokenProvider,
    required UnauthorizedCallback onUnauthorized,
    Dio? dio,
  }) : dio =
           dio ??
           Dio(
             BaseOptions(
               baseUrl: AppConfig.apiBaseUrl.toString(),
               connectTimeout: const Duration(seconds: 10),
               receiveTimeout: const Duration(seconds: 15),
               sendTimeout: const Duration(seconds: 10),
               contentType: Headers.jsonContentType,
               responseType: ResponseType.json,
               headers: const <String, Object>{
                 'Accept': Headers.jsonContentType,
               },
             ),
           ) {
    this.dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          final token = accessTokenProvider();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401 &&
              error.requestOptions.headers.containsKey('Authorization')) {
            await onUnauthorized();
          }
          handler.next(error);
        },
      ),
    );
  }

  final Dio dio;
}
