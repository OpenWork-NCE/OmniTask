# Delivery and infrastructure structure

This directory contains deployment concerns kept separate from application code.

```text
docker/                        image-specific supporting files
gcp/                           Cloud Run or GCE deployment manifests and runbooks
terraform/                     infrastructure modules when infrastructure as code is introduced
```

Secrets, generated state and environment-specific values must remain outside the repository. The current runnable local and CI Compose definitions stay at the repository root because they are part of the developer workflow.
