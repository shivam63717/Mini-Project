# FastAPI Backend Prompt (Real Analysis Replacement)

## 1. Purpose & Context
- Replace any mock or simulated analytics service with a brand-new, standalone Python FastAPI backend that owns its own storage, processing, and contracts. Do **not** reference or depend on any existing project artifacts—treat this document as the only specification.
- The backend must expose real analysis results (statistics, ML metrics, feature engineering outputs) computed from persisted datasets, avoiding all random or hard-coded numbers.
- Deliver a production-grade, fully typed system ready for any external client to consume over HTTP/JSON. A separate Next.js (or any other) frontend will call this API, but that client code lives in a different repository and is **not** part of this effort.

## 2. Stack & Infrastructure Requirements
- Core: FastAPI, Pydantic v2, Uvicorn (ASGI), Python 3.11+.
- Persistence: PostgreSQL via SQLAlchemy ORM + Alembic migrations. Support connection pooling, migrations CLI, seed scripts, and transactional tests.
- Background work: Celery or RQ workers with Redis broker. Jobs handle heavy analytics, model training, feature processing.
- Caching: Redis (same cluster as worker broker) with reusable cache helper.
- Analytics libs: pandas, numpy, scipy, scikit-learn, statsmodels, prophet (optional for forecasting), scikit-posthocs (if needed), ruptures (change-point detection).
- Config: `python-dotenv`, settings module using `pydantic-settings`, environment-specific overrides.
- Dev tooling: Poetry or Hatch for dependency management, Makefile/Justfile targets (`make dev`, `make test`, `make lint`, `make worker`, `make migrate`), pre-commit hooks (ruff/black/mypy).

## 3. Data Model & Persistence Layer
Define SQLAlchemy models + Pydantic schemas for:
1. `Dataset`: `id (UUID PK)`, `name`, `description`, `schema (JSONB)`, `row_count`, `source`, `created_at`, `updated_at`.
2. `DatasetFile`: `id`, `dataset_id FK`, `path/url`, `checksum`, `file_type`, `status`, `ingested_at`.
3. `AnalysisJob`: `id`, `dataset_id`, `type` (`descriptive`, `quality`, `correlation`, `timeseries`, etc.), `status` enum (`queued`, `running`, `succeeded`, `failed`), `params JSONB`, `started_at`, `finished_at`, `error_message`.
4. `AnalysisResult`: `id`, `job_id`, `summary JSONB`, `metrics JSONB`, `visualizations JSONB`, `created_at`.
5. `Experiment`: `id`, `dataset_id`, `name`, `algorithm`, `hyperparameters JSONB`, `status`, `started_at`, `completed_at`.
6. `ExperimentRun`: `id`, `experiment_id`, `fold`, `metrics JSONB`, `artifacts JSONB`, `duration_ms`.
7. `FeatureOperation`: `id`, `dataset_id`, `operation` (`impute`, `encode`, `scale`, etc.), `status`, `config JSONB`, `output_location`.
8. `FeatureResult`: `id`, `operation_id`, `preview JSONB`, `metrics JSONB`.
9. `AnalyticsJob`: `id`, `name`, `inputs JSONB`, `status`, `result JSONB`.
10. `CachedMetric`: `key (PK)`, `payload JSONB`, `expires_at`.

Implementation notes:
- Prefer repository pattern (`repositories/*.py`) plus service layer to keep routers thin.
- Provide Alembic migrations for all tables and indexes (e.g., status/foreign key indexes).
- Include seed data/fixtures for integration tests (sample datasets, jobs, experiments).

## 4. API Surface (Routers & Contracts)
Expose versioned API (e.g., `/api/v1`). Each response uses `{ "data": ..., "meta": { ... }, "errors": [] }`.

| Route                               | Methods                          | Description                                                                                                              |
| ----------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `/datasets`                         | GET (paginated/filterable), POST | List/create datasets. Support filters on name, source, updated range.                                                    |
| `/datasets/{dataset_id}`            | GET, PUT, DELETE                 | Retrieve/update soft-delete dataset; include related stats summary on GET.                                               |
| `/datasets/{dataset_id}/files`      | POST upload metadata, GET list   | Register files, track ingestion status.                                                                                  |
| `/analysis/run`                     | POST                             | Trigger analysis job; body includes dataset id, analysis types, parameters. Returns job descriptor.                      |
| `/analysis/jobs/{job_id}`           | GET                              | Fetch job status, progress %, timestamps, latest errors.                                                                 |
| `/analysis/jobs/{job_id}/results`   | GET                              | Return normalized results object.                                                                                        |
| `/statistics/summary`               | POST                             | Synchronous descriptive stats request (small datasets) returning metrics immediately.                                    |
| `/features/queue`                   | POST                             | Enqueue feature engineering pipeline; specify operations list.                                                           |
| `/features/{operation_id}`          | GET                              | Status + preview output.                                                                                                 |
| `/experiments`                      | GET, POST                        | Manage ML experiments.                                                                                                   |
| `/experiments/{experiment_id}`      | GET, PATCH, DELETE               | Inspect experiment configuration, rerun, cancel, or archive.                                                             |
| `/experiments/{experiment_id}/runs` | GET                              | Paginated run history with metrics.                                                                                      |
| `/analytics/dashboard`              | GET                              | Aggregate KPIs drawn from persisted results (never hardcoded). Accepts query params for date range, dataset, experiment. |
| `/jobs/{job_id}/logs`               | GET                              | Stream/return structured logs for long-running jobs.                                                                     |

Additional requirements:
- Pagination via `page`, `page_size` (default 25, max 200); include `meta.pagination`.
- Filtering & sorting query parameters validated via dependency layer.
- Provide OpenAPI tags, request/response examples, and schema descriptions.

### Sample Contract
`POST /analysis/run`
```json
{
  "dataset_id": "5dd4a1f5-8c0c-4a0b-8c6e-8c7ed250b7b1",
  "analysis_types": ["descriptive", "data_quality", "correlation"],
  "options": {
    "include_histograms": true,
    "max_bins": 20
  }
}
```
Response:
```json
{
  "data": {
    "job_id": "a1a87c4d-432d-4fc0-9a3e-2d84742013c9",
    "status": "queued",
    "type": "descriptive",
    "submitted_at": "2025-11-17T10:20:00Z"
  },
  "meta": {
    "poll_after_seconds": 5
  },
  "errors": []
}
```

### Contract Notes
- All IDs are UUID strings; timestamps are ISO-8601 UTC.
- Dataset objects must include `id`, `name`, `description`, `row_count`, `schema`, `source`, `created_at`, `updated_at`.
- Analysis job responses always provide `job_id`, `status`, `type`, `dataset_id`, `submitted_at`, and optional `progress_pct`, `started_at`, `finished_at`, `error`.
- Result payloads should normalize metrics under predictable keys, e.g., `data.metrics.descriptive`, `data.metrics.quality`, `data.visualizations.histograms`.
- Errors use `{ "errors": [{ "code": "VALIDATION_ERROR", "message": "...", "field": "options.max_bins" }] }` with empty `data` when failing.
## 5. Analysis & Processing Logic
Implement real computations using pandas/numpy with deterministic outputs:
- **Descriptive statistics:** count, mean, std, min/max, quartiles, mode, hist bins.
- **Data quality:** missing rates per column, duplicate detection using hashed rows, uniqueness, completeness, validity checks (schema constraints), anomaly counts from isolation forest.
- **Correlation & feature relationships:** Pearson/Spearman/Kendall matrices, top correlated pairs, clustering of correlations (hierarchical clustering), PCA summaries.
- **Distribution analysis:** histogram/KDE data, skewness, kurtosis, normality tests (Shapiro, Anderson), outlier thresholds (IQR, z-score).
- **Time-series analysis:** decomposition (trend, seasonality using STL), anomaly detection (Prophet or statsmodels, plus rolling z-score), forecasting horizon with confidence intervals.
- **ML experiment metrics:** actual training using scikit-learn pipelines (e.g., LogisticRegression, RandomForest, GradientBoosting). Provide accuracy/precision/recall/F1, ROC-AUC, PR-AUC, confusion matrix, feature importance, cross-validation splits.
- **Regression outputs:** RMSE, MAE, R², residual diagnostics.
- **Bayesian summaries:** simple PyMC or statsmodels Bayesian regression; if too heavy, produce posterior sampling statistics via pyro/pymc fallback—but must be based on real computations, not random placeholders.
- **Feature operations:** encode categorical, scale numeric, impute missing; persist transformation metadata for downstream use.

Structure modules:
- `services/statistics.py`
- `services/data_quality.py`
- `services/time_series.py`
- `services/experiments.py`
- `services/features.py`
- `services/analytics.py`
Each service accepts repository interfaces, uses dependency injection, and exposes pure functions for unit testing.

## 6. Job Orchestration & Background Flow
- POST endpoints enqueue Celery/RQ tasks with idempotent payloads.
- Worker pattern:
  1. Validate request, persist job row (`queued`).
  2. Worker pulls job, sets `running`, writes progress checkpoints (e.g., `progress_pct` column or Redis key).
  3. On success, write `AnalysisResult`/`FeatureResult`, update `succeeded`.
  4. On failure, capture traceback, set `failed`, emit structured log entry.
- Provide helper for polling progress and optionally WebSocket endpoint (`/ws/jobs/{id}`) broadcasting status updates.

## 7. Caching, Validation, Observability
- Redis cache wrapper for recurring summary queries (`datasets:list`, `analytics:dashboard`). TTL configurable, cache-busting hooks tied to model updates.
- Input validation: all payloads defined via Pydantic schemas; include custom validators for dataset schema definitions, parameter ranges, allowed algorithm names.
- Error handling middleware returning consistent problem details.
- Logging: structlog-based JSON logs, request/response logging with correlation IDs.
- Observability: metrics exporter (Prometheus fastapi-instrumentator) tracking request latency, job durations, worker throughput. Add tracing hooks (OpenTelemetry-ready) even if no collector configured yet.

## 8. Testing & Documentation
- Testing: pytest with `pytest-asyncio` for async routers; factories via `factory-boy`; database fixtures using transactional rollbacks; Celery tasks tested via eager mode; integration tests hitting FastAPI TestClient verifying contract of each endpoint.
- Linting & type checking: ruff, mypy (strict), black/ruff format enforcement, isort profile.
- Documentation: update README with architecture overview, environment setup (Docker Compose for Postgres + Redis), command cheatsheet, worker instructions, how to add new analysis modules, and schema diagrams. Include `.env.example`.
- Provide OpenAPI JSON export and docs page; optionally generate Markdown contract in `docs/api.md`.

## 9. Deliverables & Acceptance
- Output: Fully scaffolded FastAPI project plus `PYTHON_BACKEND_PROMPT.md` (this file) describing requirements.
- Ensure no lingering mock or random outputs anywhere. All demo data must originate from seed scripts or actual computations on stored datasets.
- Include sample cURL requests/responses in README for major endpoints, demonstrating realistic payloads/results.
- Document how **any** client application can integrate by following the published request/response contracts; the backend must remain agnostic of specific frontend implementations.

> Use this prompt to instruct Cursor (or any automation) to generate the entire backend codebase. The final solution must satisfy every section above to be considered complete.

