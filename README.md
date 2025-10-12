# ML Vision - Full-Stack Data Science Platform

A comprehensive Next.js 14 + Redis full-stack application with stateless JWT authentication, role-based access control, and seamless frontend-backend integration.

## 🚀 Features

### Authentication & Authorization
- **Stateless JWT Authentication** (Access: 15min, Refresh: 7 days with rotation)
- **Role-Based Access Control** (user, admin, analyst, manager, engineer, auditor, owner)
- **Password Reset Flow** with email verification
- **Rate Limiting** for security
- **Secure Password Policy** enforcement

### Backend Architecture
- **Redis Database** for users, tokens, and caching
- **Standardized API Responses** with Zod validation
- **Middleware Stack** (auth, rate limiting, validation)
- **Email Service** for notifications and password reset
- **Comprehensive Error Handling**

### Frontend Integration
- **Axios Client** with automatic token handling
- **Error Management** and revalidation
- **Type-Safe API Calls**
- **Automatic Token Refresh**

### Security
- **HTTPS Enforcement** in production
- **CORS Configuration**
- **Security Headers**
- **Environment Configuration**

### Testing
- **Jest Integration Tests** for all auth flows
- **Protected Route Testing**
- **Mock Services** for isolated testing

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Redis, JWT
- **Authentication**: bcrypt, jsonwebtoken
- **Validation**: Zod
- **Email**: Nodemailer
- **Testing**: Jest, Supertest
- **Database**: Redis (ioredis)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Ml-Vision-2-main
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   # JWT Secrets (generate strong secrets for production)
   JWT_ACCESS_SECRET="your-super-secret-access-key"
   JWT_REFRESH_SECRET="your-super-secret-refresh-key"
   
   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379
   
   # Email Configuration (for password reset)
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   
   # OAuth (optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GITHUB_CLIENT_ID=your-github-client-id
   ```

4. **Start Redis**
   ```bash
   # Using Docker
   docker run -d -p 6379:6379 redis:alpine
   
   # Or install locally
   redis-server
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

## 🧪 Testing

Run the test suite:
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests for CI
pnpm test:ci
```

## 📚 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 900,
    "tokenType": "Bearer"
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJ..."
}
```

#### Logout
```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJ..."
}
```

#### Get Profile
```http
GET /api/auth/me
Authorization: Bearer <access-token>
```

#### Password Reset
```http
# Request reset
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com"
}

# Confirm reset
PUT /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token",
  "newPassword": "NewSecurePassword123!"
}
```

### Frontend Usage

```typescript
import { apiClient } from '@/lib/api/client'

// Login
const tokens = await apiClient.login('user@example.com', 'password')

// Get profile
const profile = await apiClient.getProfile()

// Make authenticated requests
const data = await apiClient.get('/protected-endpoint')

// Logout
await apiClient.logout()
```

## 🔐 Security Features

### Password Policy
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one symbol

### Rate Limiting
- **Auth endpoints**: 5 attempts per 15 minutes
- **API endpoints**: 100 requests per 15 minutes
- **Strict endpoints**: 10 requests per minute

### JWT Configuration
- **Access tokens**: 15 minutes
- **Refresh tokens**: 7 days with rotation
- **Issuer/Audience**: Validated
- **Secure secrets**: Environment-based

## 🏗 Architecture

### Directory Structure
```
├── app/
│   ├── api/auth/          # Authentication endpoints
│   └── ...
├── lib/
│   ├── auth/              # Auth services (JWT, User, Email)
│   ├── api/               # API client and types
│   ├── middleware/        # Auth, rate limiting, validation
│   ├── validators/        # Zod schemas
│   └── database/          # Redis configuration
├── __tests__/             # Integration tests
└── middleware.ts          # Next.js middleware (CORS, security)
```

### Data Flow
1. **Request** → **Middleware** (CORS, Security Headers)
2. **API Route** → **Rate Limiting** → **Validation** → **Authentication**
3. **Business Logic** → **Redis** → **Response**
4. **Frontend** → **Axios Client** → **Token Management** → **Auto Refresh**

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set in production:
- JWT secrets (use strong, unique secrets)
- Redis connection details
- Email service configuration
- OAuth credentials (if using social login)

### Security Checklist
- [ ] Strong JWT secrets
- [ ] HTTPS enabled
- [ ] Redis secured
- [ ] Email service configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the test files for usage examples
- Review the API documentation above