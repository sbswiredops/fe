# Shekhabo API Documentation

This document provides an overview of the API implementation for the Shekhabo platform.

## API Structure

The API follows RESTful conventions and is organized into the following main modules:

### 1. Users API (`/api/users`)

#### Endpoints:
- `GET /api/users` - Get all users with pagination
- `POST /api/users` - Create a new user
- `GET /api/users/{id}` - Get user by ID
- `PATCH /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `POST /api/users/{id}/assign-role` - Assign role to user
- `GET /api/users/{id}/permissions` - Get user permissions
- `POST /api/users/{id}/permissions` - Assign permissions to user

#### Query Parameters (GET /api/users):
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `search` - Search by name or email
- `role` - Filter by role (admin, teacher, student)
- `status` - Filter by status (active, inactive, suspended)
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort order (asc, desc)

### 2. Categories API (`/api/categories`)

#### Endpoints:
- `GET /api/categories` - Get all categories with pagination
- `POST /api/categories` - Create a new category
- `GET /api/categories/{id}` - Get category by ID
- `PATCH /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

#### Query Parameters (GET /api/categories):
- `page` - Page number
- `limit` - Items per page
- `search` - Search by name or description
- `status` - Filter by status (active, inactive)
- `featured` - Filter by featured status (true, false)
- `parentId` - Filter by parent category (empty string for root categories)
- `sortBy` - Sort field (default: order)
- `sortOrder` - Sort order (asc, desc)

### 3. Courses API (`/api/courses`)

#### Endpoints:
- `GET /api/courses` - Get all courses with filtering and pagination
- `POST /api/courses` - Create a new course
- `GET /api/courses/featured` - Get featured courses
- `GET /api/courses/{id}` - Get course by ID
- `PATCH /api/courses/{id}` - Update course
- `DELETE /api/courses/{id}` - Delete course
- `POST /api/courses/{id}/enroll` - Enroll in a course
- `GET /api/courses/{id}/progress` - Get course progress
- `POST /api/courses/{id}/upload-thumbnail` - Upload course thumbnail
- `GET /api/courses/{id}/enroll-info` - Get course enrollment info

#### Query Parameters (GET /api/courses):
- `page` - Page number
- `limit` - Items per page
- `search` - Search by title, description, or tags
- `categoryId` - Filter by category
- `instructorId` - Filter by instructor
- `level` - Filter by level (beginner, intermediate, advanced)
- `priceMin` - Minimum price filter
- `priceMax` - Maximum price filter
- `featured` - Filter by featured status
- `status` - Filter by status (draft, published, archived)
- `sortBy` - Sort field (title, price, rating, enrollmentCount, createdAt)
- `sortOrder` - Sort order (asc, desc)

## Configuration

The API uses the following configuration files:

### `src/lib/config.ts`
Contains API endpoints, database configuration, authentication settings, and upload limits.

### `src/lib/api.ts`
Contains the ApiClient class for making HTTP requests and utility functions.

### `src/types/api.ts`
Contains all TypeScript interfaces and types used by the API.

## Services

Service classes provide a high-level interface for interacting with the API:

### `src/services/userService.ts`
- User CRUD operations
- Role and permission management
- User statistics
- Bulk operations

### `src/services/categoryService.ts`
- Category CRUD operations
- Category hierarchy management
- Category statistics
- Featured category management

### `src/services/courseService.ts`
- Course CRUD operations
- Course filtering and searching
- Enrollment management
- Course statistics

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Application Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NODE_ENV=development

# Database Configuration
DATABASE_URL=mongodb://localhost:27017/shekhabo
DATABASE_NAME=shekhabo

# Authentication Configuration
JWT_SECRET=your-super-secret-jwt-key-here-min-32-characters
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

## Response Format

All API responses follow a consistent format:

### Success Response:
```json
{
  "success": true,
  "data": [...],
  "message": "Operation completed successfully",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Usage Examples

### Using the API Client:

```typescript
import { apiClient } from '@/lib/api';

// Get users
const response = await apiClient.get('/api/users', { 
  page: 1, 
  limit: 10 
});

// Create user
const newUser = await apiClient.post('/api/users', {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'student'
});
```

### Using Services:

```typescript
import UserService from '@/services/userService';

// Get students
const students = await UserService.getStudents({
  page: 1,
  limit: 10
});

// Create user
const newUser = await UserService.createUser({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'student'
});
```

## Mock Data

Currently, the API uses mock data stored in arrays. In production, replace these with actual database operations.

## Security Considerations

1. Always validate input data
2. Use proper authentication and authorization
3. Implement rate limiting
4. Sanitize user inputs
5. Use HTTPS in production
6. Validate file uploads
7. Implement proper CORS policies

## Testing

Test the API endpoints using tools like:
- Postman
- Insomnia
- curl
- Jest for unit tests

## Next Steps

To complete the API implementation:

1. Set up a real database (MongoDB, PostgreSQL, etc.)
2. Implement proper authentication middleware
3. Add input validation middleware
4. Implement rate limiting
5. Add file upload functionality
6. Set up proper logging
7. Add API documentation (Swagger/OpenAPI)
8. Implement caching
9. Add comprehensive error handling
10. Set up monitoring and analytics
