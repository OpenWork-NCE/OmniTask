# Deployment

The no-cost deployment uses Firebase Hosting for the static web application, a Render web service for the API, and Aiven for MySQL. Each provider can be used without a payment method. Free plans have availability and resource limits and are suitable for a demonstration environment.

## 1. Create the MySQL service

Create an Aiven account and a free MySQL service. In the service overview, retain the host, port, database, user, and password shown under connection information.

The API uses the following values:

```text
DB_URL=jdbc:mysql://HOST:PORT/DATABASE?sslMode=REQUIRED&connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true
DB_USERNAME=USER
DB_PASSWORD=PASSWORD
```

Flyway creates and validates the application schema during the first API startup. No manual schema import is required.

## 2. Deploy the API

In Render, create a Blueprint from this GitHub repository. The root [render.yaml](../render.yaml) configures the free Docker service, its readiness check, resource limits, and all non-secret settings.

Provide the three Aiven values when Render prompts for them. Set `CORS_ALLOWED_ORIGINS` to the final Firebase origin, for example `https://PROJECT_ID.web.app`. Multiple explicit origins can be comma-separated.

Generate a dedicated production RSA key pair locally:

```sh
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out jwt-private.pem
openssl pkey -in jwt-private.pem -pubout -out jwt-public.pem
```

In the Render service, open **Environment**, then add these secret files:

| Filename          | Local source      |
| ----------------- | ----------------- |
| `jwt-private.pem` | `jwt-private.pem` |
| `jwt-public.pem`  | `jwt-public.pem`  |

Do not commit either key. Render mounts the files under `/etc/secrets`, which matches the paths declared in the Blueprint.

After deployment, verify both endpoints:

```sh
curl --fail https://omnitask-api.onrender.com/actuator/health/liveness
curl --fail https://omnitask-api.onrender.com/actuator/health/readiness
```

The free service sleeps after 15 minutes without incoming traffic. Its first response after sleep can take about one minute. The database is external, so API restarts do not lose application data.

## 3. Build and deploy the web application

Build the frontend with the public Render API origin:

```sh
cd frontend
npm ci
VITE_API_BASE_URL=https://omnitask-api.onrender.com npm run build
cd ..
firebase deploy --only hosting
```

The build embeds the API origin. Rebuild and redeploy whenever that origin changes.

## 4. Build the mobile application

Point the Flutter client to the same HTTPS API:

```sh
cd mobile
flutter build apk --release \
  --dart-define=API_BASE_URL=https://omnitask-api.onrender.com
```

Production signing and store publication require separate release credentials and are not configured in this repository.

## Operational limits

- Firebase Spark Hosting includes finite storage and monthly transfer quotas. The site is suspended when transfer quota is exhausted.
- Render Free services sleep after inactivity and provide no production SLA.
- Aiven Free MySQL provides one node, 1 GB RAM, and 1 GB storage without an SLA. Inactive services can be powered off after notification.
- Secrets remain in provider secret stores. Only public origins and resource paths are versioned.
