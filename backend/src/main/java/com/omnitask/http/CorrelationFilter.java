package com.omnitask.http;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationFilter extends OncePerRequestFilter {
  private static final Logger LOG = LoggerFactory.getLogger(CorrelationFilter.class);
  private static final Pattern UUID_PATTERN =
      Pattern.compile(
          "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}");

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    String supplied = request.getHeader("X-Correlation-ID");
    String id =
        supplied != null && UUID_PATTERN.matcher(supplied).matches()
            ? UUID.fromString(supplied).toString()
            : UUID.randomUUID().toString();
    MDC.put("correlationId", id);
    response.setHeader("X-Correlation-ID", id);
    long started = System.nanoTime();
    try {
      chain.doFilter(request, response);
    } finally {
      LOG.info(
          "HTTP {} status={} durationMs={}",
          request.getMethod(),
          response.getStatus(),
          TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - started));
      MDC.remove("correlationId");
    }
  }
}
