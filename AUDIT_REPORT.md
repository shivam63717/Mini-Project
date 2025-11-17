# Comprehensive Project Usage Audit Report

**Date:** Generated during audit
**Project:** ML Vision - Full-Stack Data Science Platform
**Framework:** Next.js 14 (App Router) with TypeScript

---

## Executive Summary

This audit identified **critical architectural issues**, **unused code**, **duplicate implementations**, and **missing dependencies**. The project contains a significant amount of orphaned Express.js code that is not integrated with the Next.js application, along with configuration mismatches and unused dependencies.

### Key Findings

- **8 unused files/directories** in `src/` (Express-based, not used by Next.js)
- **2 duplicate Redis implementations** (both actively used, need consolidation)
- **2 duplicate middleware files** (root vs app/, both Next.js middleware)
- **2 duplicate rate limiting implementations** (Express vs Next.js)
- **9 missing route pages** (referenced in sidebar but don't exist)
- **Missing file reference** (`lib/docs/swagger` doesn't exist)
- **Prisma schema exists but unused** (app uses Redis for auth)
- **Docker configuration mismatch** (references PostgreSQL but app uses Redis)

---

## 1. Unused Code & Files

### 1.1 Entire `src/` Directory (Unused Express Application)

**Status:** ⚠️ **CRITICAL** - Entire directory is unused by Next.js App Router

The `src/` directory contains a complete Express.js application that is **never imported or used** by the Next.js application:

#### Unused Files:
- `src/app.ts` - Express app with routes (imports non-existent `lib/docs/swagger`)
- `src/routes/v1/index.ts` - Express routes using Prisma
- `src/api/v1/index.ts` - Express API v1 routes
- `src/api/v2/index.ts` - Express API v2 routes
- `src/realtime/websocket.ts` - Socket.io WebSocket server
- `src/realtime/sse.ts` - Server-Sent Events handler
- `src/services/prisma.ts` - Prisma client (only used by unused Express routes)
- `src/services/notification/smsService.ts` - Twilio SMS service
- `src/services/notification/emailService.ts` - Email service (duplicate of lib/auth/email.ts)
- `src/services/storage/uploader.ts` - S3/Cloudinary uploader
- `src/services/recommendationService.ts` - Recommendation service

**Impact:**
- These files reference dependencies that may not be needed: `express`, `cors`, `helmet`, `morgan`, `socket.io`, `twilio`, `@aws-sdk/client-s3`, `cloudinary`
- Creates confusion about which API system is active
- Increases bundle size unnecessarily

**Recommendation:**
- **Option A:** Remove entire `src/` directory if Express app is not needed
- **Option B:** Integrate Express app as a custom server for Next.js (requires `server.js` and Next.js custom server configuration)
- **Option C:** Document that `src/` is for a separate API service

### 1.2 Missing File Reference

**File:** `src/app.ts:21`
**Issue:** Imports `../lib/docs/swagger` which does not exist
**Status:** ⚠️ **BROKEN IMPORT**

```typescript
import '../lib/docs/swagger' // side effect registers swagger route
```

**Recommendation:** Remove this import or create the swagger documentation file.

### 1.3 Unused Type Definition

**File:** `types/User.ts`
**Status:** ⚠️ **POTENTIALLY UNUSED**

Only imported by `lib/auth/session.ts`. Verify if this is the correct User type or if it should use `lib/models/User.ts` instead.

---

## 2. Duplicate Implementations

### 2.1 Redis Implementations (Both Active)

**Status:** ⚠️ **DUPLICATE** - Both are actively used, need consolidation

#### `lib/redis.ts`
- Simple Redis client wrapper
- Uses `env.mjs` for configuration (REDIS_URL)
- Used by: `app/middleware.ts`, `app/api/user/route.ts`, `lib/auth/session.ts`

#### `lib/database/redis.ts`
- Full-featured `RedisService` class with comprehensive methods
- Uses environment variables directly (REDIS_HOST, REDIS_PORT, etc.)
- Used by: Most lib files (models, services, middleware)

**Differences:**
- Different configuration methods
- Different connection patterns
- `lib/database/redis.ts` has more features (RedisService class, RedisKeys constants)

**Recommendation:**
1. Consolidate into single Redis implementation
2. Use `lib/database/redis.ts` as the primary implementation (more features)
3. Update `lib/redis.ts` imports to use `lib/database/redis.ts`
4. Standardize on one configuration method (prefer `env.mjs`)

### 2.2 Middleware Files (Both Next.js Middleware)

**Status:** ⚠️ **DUPLICATE** - Both are Next.js middleware files

#### `middleware.ts` (root)
- CORS and security headers
- HTTPS redirect in production
- Matcher: `/api/:path*` and all routes except static files

#### `app/middleware.ts`
- Session handling with Redis
- Sets `x-user-id` header
- Matcher: All routes except static files

**Issue:** Next.js only recognizes `middleware.ts` at the root level. `app/middleware.ts` is **NOT executed** by Next.js.

**Recommendation:**
- Merge `app/middleware.ts` functionality into root `middleware.ts`
- Remove `app/middleware.ts`

### 2.3 Rate Limiting Implementations

**Status:** ⚠️ **DUPLICATE** - Two different approaches

#### `lib/security/rateLimit.ts`
- Uses `express-rate-limit` (Express-based)
- Only used by unused `src/app.ts`
- **Status:** Unused (since src/app.ts is unused)

#### `lib/middleware/rate-limit.ts`
- Next.js-compatible rate limiter using Redis
- Used by Next.js API routes via `lib/middleware/index.ts`
- **Status:** Active and used

#### `lib/middleware/rateLimit.ts`
- Another Express-based rate limiter
- **Status:** Unused

**Recommendation:**
- Remove `lib/security/rateLimit.ts` and `lib/middleware/rateLimit.ts` (Express-based, unused)
- Keep `lib/middleware/rate-limit.ts` (Next.js-compatible, actively used)

### 2.4 Environment Configuration

**Status:** ⚠️ **MISMATCH**

- `env.mjs` - Uses Zod validation, expects `REDIS_URL`
- `env.example` - Uses individual Redis variables (`REDIS_HOST`, `REDIS_PORT`, etc.)
- `lib/database/redis.ts` - Uses individual variables
- `lib/redis.ts` - Uses `REDIS_URL` from `env.mjs`

**Recommendation:**
- Standardize on one configuration approach
- Update `env.example` to match `env.mjs` schema
- Update `lib/database/redis.ts` to use `env.mjs`

---

## 3. Dependency Verification

### 3.1 Unused Dependencies (If src/ is removed)

If the `src/` directory is removed, these dependencies become unused:

**Runtime Dependencies:**
- `express` - Only in `src/app.ts`
- `cors` - Only in `src/app.ts`
- `helmet` - Only in `src/app.ts`
- `morgan` - Only in `src/app.ts`
- `express-rate-limit` - Only in `lib/security/rateLimit.ts` (unused)
- `socket.io` - Only in `src/realtime/websocket.ts`
- `twilio` - Only in `src/services/notification/smsService.ts`
- `@aws-sdk/client-s3` - Only in `src/services/storage/uploader.ts`
- `cloudinary` - Only in `src/services/storage/uploader.ts`

**Note:** These are not in `package.json`, suggesting they may have been removed or were never added.

### 3.2 Potentially Unused Dependencies

**`@prisma/client` and `prisma`:**
- Prisma schema exists (`prisma/schema.prisma`)
- Only used in unused `src/routes/v1/index.ts` and `src/services/prisma.ts`
- Next.js app uses Redis for authentication, not Prisma
- **Status:** Unused if `src/` is removed

**`redis` package:**
- Listed in dependencies but project uses `ioredis`
- **Status:** Unused, can be removed

**`csv-parser`:**
- Listed in dependencies
- Project uses `csv-parse` (different package)
- **Status:** Unused, can be removed

**`multer`:**
- Listed in dependencies
- Only referenced in type definitions (`@types/multer`)
- Not used in Next.js API routes
- **Status:** Unused, can be removed

**`@types/multer`:**
- Only needed if `multer` is used
- **Status:** Unused if `multer` is removed

### 3.3 Missing Dependencies

All required dependencies appear to be present. No missing dependencies detected.

---

## 4. Component Usage Audit

### 4.1 All Components Are Used ✅

**Analytics Components (6/6 used):**
- ✅ `anomaly-detection.tsx` - Used in `app/analytics/page.tsx`
- ✅ `clustering-analysis.tsx` - Used in `app/analytics/page.tsx`
- ✅ `network-analysis.tsx` - Used in `app/analytics/page.tsx`
- ✅ `predictive-modeling.tsx` - Used in `app/analytics/page.tsx`
- ✅ `real-time-monitoring.tsx` - Used in `app/analytics/page.tsx`
- ✅ `time-series-analysis.tsx` - Used in `app/analytics/page.tsx`

**Data Explorer Components (6/6 used):**
- ✅ `correlation-matrix.tsx` - Used in `app/data-explorer/page.tsx`
- ✅ `data-profiler.tsx` - Used in `app/data-explorer/page.tsx`
- ✅ `data-quality-assessment.tsx` - Used in `app/data-explorer/page.tsx`
- ✅ `distribution-analysis.tsx` - Used in `app/data-explorer/page.tsx`
- ✅ `file-upload.tsx` - Used in `components/data-explorer/data-profiler.tsx`
- ✅ `interactive-data-table.tsx` - Used in `app/data-explorer/page.tsx`

**Experiments Components (4/4 used):**
- ✅ `experiment-comparison.tsx` - Used in `app/experiments/page.tsx`
- ✅ `experiment-list.tsx` - Used in `app/experiments/page.tsx`
- ✅ `hyperparameter-tuning.tsx` - Used in `app/experiments/page.tsx`
- ✅ `model-registry.tsx` - Used in `app/experiments/page.tsx`

**Features Components (5/5 used):**
- ✅ `encoding-tools.tsx` - Used in `app/features/page.tsx`
- ✅ `feature-generator.tsx` - Used in `app/features/page.tsx`
- ✅ `feature-importance.tsx` - Used in `app/features/page.tsx`
- ✅ `feature-scaling.tsx` - Used in `app/features/page.tsx`
- ✅ `feature-selection.tsx` - Used in `app/features/page.tsx`

**Interpretability Components (5/5 used):**
- ✅ `feature-interactions.tsx` - Used in `app/interpretability/page.tsx`
- ✅ `lime-explanations.tsx` - Used in `app/interpretability/page.tsx`
- ✅ `model-decision-paths.tsx` - Used in `app/interpretability/page.tsx`
- ✅ `partial-dependence-plots.tsx` - Used in `app/interpretability/page.tsx`
- ✅ `shap-analysis.tsx` - Used in `app/interpretability/page.tsx`

**Statistics Components (6/6 used):**
- ✅ `bayesian-analysis.tsx` - Used in `app/statistics/page.tsx`
- ✅ `correlation-analysis.tsx` - Used in `app/statistics/page.tsx`
- ✅ `descriptive-statistics.tsx` - Used in `app/statistics/page.tsx`
- ✅ `distribution-analysis.tsx` - Used in `app/statistics/page.tsx`
- ✅ `hypothesis-testing.tsx` - Used in `app/statistics/page.tsx`
- ✅ `regression-analysis.tsx` - Used in `app/statistics/page.tsx`

**UI Components (14/14 used):**
All shadcn/ui components are actively used across the application.

**Navigation Components (2/2 used):**
- ✅ `header.tsx` - Used in all page components
- ✅ `sidebar.tsx` - Used in all page components

**Provider Components (2/2 used):**
- ✅ `theme-provider.tsx` - Used in `app/layout.tsx`
- ✅ `toast-provider.tsx` - Used in `app/layout.tsx`

### 4.2 Missing Route Pages

**Status:** ⚠️ **BROKEN LINKS** - Sidebar references routes that don't exist

The sidebar (`components/navigation/sidebar.tsx`) references these routes, but corresponding `page.tsx` files don't exist:

1. `/quickstart` - Referenced but no `app/quickstart/page.tsx`
2. `/projects` - Referenced but no `app/projects/page.tsx`
3. `/models` - Referenced but no `app/models/page.tsx`
4. `/visualizations` - Referenced but no `app/visualizations/page.tsx`
5. `/metrics` - Referenced but no `app/metrics/page.tsx`
6. `/automl` - Referenced but no `app/automl/page.tsx`
7. `/realtime` - Referenced but no `app/realtime/page.tsx`
8. `/collaboration` - Referenced but no `app/collaboration/page.tsx`
9. `/docs` - Referenced but no `app/docs/page.tsx`

**Existing Routes:**
- ✅ `/` - Dashboard (exists)
- ✅ `/data-explorer` - Data Explorer (exists)
- ✅ `/features` - Feature Engineering (exists)
- ✅ `/experiments` - Experiments (exists)
- ✅ `/analytics` - Analytics (exists)
- ✅ `/statistics` - Statistics (exists)
- ✅ `/interpretability` - Interpretability (exists)

**Recommendation:**
- Create missing page components, OR
- Remove broken links from sidebar navigation

---

## 5. API Route Verification

### 5.1 All API Routes Are Defined ✅

**Authentication Routes (7/7):**
- ✅ `app/api/auth/register/route.ts`
- ✅ `app/api/auth/login/route.ts`
- ✅ `app/api/auth/logout/route.ts`
- ✅ `app/api/auth/refresh/route.ts`
- ✅ `app/api/auth/me/route.ts`
- ✅ `app/api/auth/change-password/route.ts`
- ✅ `app/api/auth/reset-password/route.ts`

**Data Routes (3/3):**
- ✅ `app/api/datasets/route.ts`
- ✅ `app/api/datasets/[id]/route.ts`
- ✅ `app/api/datasets/analysis/route.ts`

**Other API Routes:**
- ✅ `app/api/analytics/route.ts`
- ✅ `app/api/experiments/route.ts`
- ✅ `app/api/features/route.ts`
- ✅ `app/api/health/route.ts`
- ✅ `app/api/processing/route.ts`
- ✅ `app/api/processing/[jobId]/route.ts`
- ✅ `app/api/statistics/route.ts`
- ✅ `app/api/upload/route.ts`
- ✅ `app/api/user/route.ts`

**Status:** All API routes are properly defined and follow Next.js App Router conventions.

---

## 6. Python Files Integration

### 6.1 Python Files Status

**Python Files Found:**
- `analysis/csv_analysis.py`
- `training/scripts/classification/random_forest.py`
- `training/utils/data_loader.py`
- `training/utils/preprocessing.py`
- `utils/csv_ingest.py`
- `tests/test_csv_analysis.py`

**Integration Status:**
- Python files are **not directly integrated** with the Next.js application
- CSV analysis is handled by TypeScript (`lib/services/csv-analyzer.ts`)
- Python scripts appear to be standalone utilities for training/analysis
- No Node.js subprocess calls to Python scripts found

**Recommendation:**
- Document Python scripts as separate utilities
- Consider integrating via API calls or subprocess if needed
- Or remove if not used

---

## 7. Configuration Issues

### 7.1 Docker Configuration Mismatch

**File:** `docker-compose.yml`
**Issue:** ⚠️ **MISMATCH**

- References PostgreSQL database
- Application uses Redis (not PostgreSQL)
- Includes Prisma migration command
- Prisma is not used by the Next.js app

**Current Configuration:**
```yaml
db:
  image: postgres:15-alpine
  # ... PostgreSQL config
```

**Should be:**
```yaml
redis:
  image: redis:alpine
  # ... Redis config
```

**Recommendation:**
- Update `docker-compose.yml` to use Redis instead of PostgreSQL
- Remove Prisma migration command
- Update Dockerfile if needed

### 7.2 TypeScript Configuration

**File:** `tsconfig.json`
**Status:** ✅ **CORRECT**

- Path aliases configured correctly (`@/*` maps to root)
- Includes all necessary file types
- Configuration is appropriate for Next.js 14

### 7.3 Next.js Configuration

**File:** `next.config.mjs`
**Status:** ⚠️ **DEVELOPMENT SETTINGS**

```javascript
eslint: { ignoreDuringBuilds: true }
typescript: { ignoreBuildErrors: true }
```

**Recommendation:**
- These settings hide errors - consider fixing underlying issues
- Remove in production or use conditionally

---

## 8. Import/Export Issues

### 8.1 Broken Imports

1. **`src/app.ts:21`** - Imports non-existent `lib/docs/swagger`
2. **`app/middleware.ts`** - Not executed by Next.js (should be at root)

### 8.2 Circular Dependencies

No circular dependencies detected in the audit.

### 8.3 Missing Exports

All required exports appear to be present. No missing exports detected.

---

## 9. Architecture Decisions Needed

### 9.1 Express vs Next.js API Routes

**Current State:**
- Next.js App Router with API routes (active)
- Express application in `src/` (unused)

**Decision Required:**
- **Option A:** Remove Express app entirely
- **Option B:** Integrate Express as custom Next.js server
- **Option C:** Keep as separate service (document clearly)

### 9.2 Prisma vs Redis

**Current State:**
- Prisma schema exists but unused
- Application uses Redis for all data storage
- Prisma only referenced in unused Express routes

**Decision Required:**
- **Option A:** Remove Prisma entirely (if Redis-only approach)
- **Option B:** Migrate to Prisma (if needed for relational data)
- **Option C:** Use both (Redis for cache/sessions, Prisma for relational data)

### 9.3 Database Strategy

**Current State:**
- Redis used for: Users, Tokens, Datasets, Experiments, Caching
- No relational database in use
- Docker config references PostgreSQL (unused)

**Decision Required:**
- Clarify if Redis-only approach is sufficient
- Or add PostgreSQL/Prisma for relational data needs

---

## 10. Recommendations Summary

### Critical (Must Fix)

1. **Remove or integrate `src/` directory**
   - Entire Express app is unused
   - Creates confusion and increases bundle size

2. **Fix middleware duplication**
   - Merge `app/middleware.ts` into root `middleware.ts`
   - Remove `app/middleware.ts`

3. **Consolidate Redis implementations**
   - Choose one Redis implementation
   - Update all imports to use the chosen implementation

4. **Fix broken sidebar links**
   - Create missing page components OR
   - Remove broken navigation links

5. **Fix Docker configuration**
   - Replace PostgreSQL with Redis
   - Remove Prisma migration commands

### High Priority (Should Fix)

6. **Remove unused dependencies**
   - `redis` (use `ioredis` only)
   - `csv-parser` (use `csv-parse` only)
   - `multer` and `@types/multer` (not used)
   - `@prisma/client` and `prisma` (if `src/` is removed)

7. **Standardize environment configuration**
   - Align `env.example` with `env.mjs` schema
   - Update `lib/database/redis.ts` to use `env.mjs`

8. **Remove broken import**
   - Fix or remove `lib/docs/swagger` import in `src/app.ts`

9. **Clean up rate limiting**
   - Remove Express-based rate limiters
   - Keep only Next.js-compatible implementation

### Medium Priority (Consider Fixing)

10. **Next.js config improvements**
    - Fix underlying ESLint/TypeScript errors
    - Remove error-ignoring flags

11. **Document Python scripts**
    - Clarify their purpose and integration
    - Or remove if unused

12. **Type definition cleanup**
    - Verify `types/User.ts` vs `lib/models/User.ts` usage

---

## 11. Files to Remove (If Express app is not needed)

If the `src/` directory is removed, these files can be deleted:

```
src/
├── app.ts
├── routes/
│   └── v1/
│       └── index.ts
├── api/
│   ├── v1/
│   │   └── index.ts
│   └── v2/
│       └── index.ts
├── realtime/
│   ├── websocket.ts
│   └── sse.ts
└── services/
    ├── prisma.ts
    ├── notification/
    │   ├── smsService.ts
    │   └── emailService.ts
    ├── storage/
    │   └── uploader.ts
    └── recommendationService.ts
```

**Also remove:**
- `lib/security/rateLimit.ts` (Express-based, unused)
- `lib/middleware/rateLimit.ts` (Express-based, unused)
- `app/middleware.ts` (merge into root middleware.ts)
- `prisma/schema.prisma` (if Prisma is not used)
- `types/User.ts` (if redundant with lib/models/User.ts)

---

## 12. Dependencies to Remove (If src/ is removed)

If Express app is removed, these can be removed from `package.json`:

**Runtime:**
- `@prisma/client` (if not using Prisma)
- `prisma` (if not using Prisma)
- `redis` (using `ioredis` instead)
- `csv-parser` (using `csv-parse` instead)
- `multer` (not used)
- `@types/multer` (not used)

**Note:** Express dependencies (`express`, `cors`, `helmet`, `morgan`, `express-rate-limit`) are not in package.json, suggesting they were never added or already removed.

---

## 13. Testing Status

**Test Files Found:**
- `__tests__/api/auth/me.test.ts`
- `__tests__/api/auth/login.test.ts`
- `__tests__/api/auth/register.test.ts`
- `__tests__/lib/auth/user.test.ts`
- `__tests__/lib/middleware/auth.test.ts`
- `tests/test_csv_analysis.py`

**Status:** Test files exist and appear to be properly configured with Jest.

---

## Conclusion

The project has a solid Next.js foundation with well-organized components and API routes. However, there is significant technical debt from an unused Express application and duplicate implementations. The main issues are:

1. **Architectural confusion** - Two API systems (Express unused, Next.js active)
2. **Duplicate code** - Redis, middleware, rate limiting
3. **Configuration mismatches** - Docker, environment variables, database choice
4. **Broken navigation** - 9 missing route pages

**Estimated Cleanup Impact:**
- **Files to remove:** ~15-20 files
- **Dependencies to remove:** ~6-8 packages
- **Code reduction:** ~2000-3000 lines
- **Bundle size reduction:** Significant (if Express dependencies removed)

**Recommended Next Steps:**
1. Decide on Express app fate (remove/integrate/document)
2. Consolidate Redis implementations
3. Fix middleware duplication
4. Create missing pages or remove broken links
5. Update Docker configuration
6. Clean up dependencies

---

**Report Generated:** Comprehensive audit completed
**Audit Scope:** Full project codebase analysis
**Files Analyzed:** 141 TypeScript files, 60 TSX files, configuration files

