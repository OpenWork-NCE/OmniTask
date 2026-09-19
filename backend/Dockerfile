FROM eclipse-temurin:21.0.12_8-jdk-noble@sha256:27931d05af4bc4f93f14b3af4ac01805c223f3830d925ea7839320a7bf9123f5 AS build

RUN apt-get update \
    && apt-get install --no-install-recommends --yes unzip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
COPY config/ config/
COPY src/ src/

# CI runs the complete verify lifecycle, including Testcontainers integration tests.
RUN --mount=type=cache,target=/root/.m2 ./mvnw -B -ntp -DskipTests package

FROM eclipse-temurin:21.0.12_8-jre-noble@sha256:b5ded0266ce893266854c6fe5726cc7627c68b1f0cc7cb06f6546122dc5e1777 AS runtime

RUN apt-get update \
    && apt-get install --no-install-recommends --yes curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 10001 omnitask \
    && useradd --system --uid 10001 --gid omnitask \
        --home-dir /app --shell /usr/sbin/nologin omnitask

WORKDIR /app

COPY --from=build --chown=10001:10001 \
    /workspace/target/omnitask-api-0.1.0-SNAPSHOT.jar /app/app.jar

USER 10001:10001

ENV PORT=8080

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=5 \
  CMD curl --fail --silent --show-error "http://localhost:${PORT}/actuator/health/readiness"

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
