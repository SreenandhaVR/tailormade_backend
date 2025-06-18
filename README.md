# Tailormade Backend API

A comprehensive Node.js backend API for the Tailormade application, built with Express.js and MongoDB. This API provides endpoints for user authentication, shop management, order processing, and content management.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (User, Tailor, Admin)
  - SMS verification system
  - Password reset functionality

- **Shop Management**
  - Shop registration and profile management
  - Geospatial search for nearby shops
  - Shop verification system
  - Working hours management
  - Image upload for shop galleries

- **Order Management**
  - Order creation and tracking
  - Status updates with SMS notifications
  - Measurement management
  - Payment status tracking
  - Review and rating system

- **User Management**
  - User profile management
  - Measurement storage
  - Favorites system
  - Notification management

- **Content Management**
  - Static content management (About, Privacy, Terms, etc.)
  - Content versioning
  - Publishing workflow

- **File Upload**
  - Secure file upload with validation
  - Support for images and documents
  - Organized storage structure

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **SMS Service**: Twilio
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting

## Project Structure

```
tailormade-backend/
├── src/
│   ├── config/
│   │   ├── database.js      # MongoDB connection
│   │   ├── config.js        # Configuration settings
│   │   └── multer.js        # File upload configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── shopController.js    # Shop management
│   │   ├── orderController.js   # Order processing
│   │   ├── userController.js    # User management
│   │   └── aboutController.js   # Content management
│   ├── middleware/
│   │   ├── auth.js          # Authentication middleware
│   │   ├── validation.js    # Request validation
│   │   └── errorHandler.js  # Error handling
│   ├── models/
│   │   ├── User.js          # User model
│   │   ├── Shop.js          # Shop model
│   │   ├── Order.js         # Order model
│   │   ├── Category.js      # Category model
│   │   └── About.js         # Content model
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── shop.js          # Shop routes
│   │   ├── order.js         # Order routes
│   │   ├── user.js          # User routes
│   │   └── about.js         # Content routes
│   ├── utils/
│   │   ├── smsService.js    # SMS functionality
│   │   ├── responseHelper.js # Response utilities
│   │   └── validators.js    # Validation schemas
│   └── app.js               # Express app configuration
├── uploads/
│   ├── orders/              # Order-related files
│   └── shops/               # Shop-related files
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies and scripts
├── server.js                # Server entry point
└── README.md                # Project documentation
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tailormade-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/tailormade_db
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=30d
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_NUMBER=your-twilio-phone-number
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-password` - Update password
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password/:resetToken` - Reset password
- `POST /api/auth/verify-email/:verificationToken` - Verify email

### Shops
- `GET /api/shops` - Get all shops
- `GET /api/shops/search` - Search shops
- `GET /api/shops/:id` - Get shop by ID
- `POST /api/shops` - Create shop (Tailor/Admin)
- `PUT /api/shops/:id` - Update shop
- `DELETE /api/shops/:id` - Delete shop

### Orders
- `GET /api/orders/my-orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/review` - Add review

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/measurements` - Get measurements
- `PUT /api/users/measurements` - Update measurements

### Content
- `GET /api/about` - Get all content
- `GET /api/about/:slug` - Get content by slug
- `POST /api/about` - Create content (Admin)
- `PUT /api/about/:id` - Update content (Admin)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/tailormade_db |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRE` | JWT expiration time | 30d |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | Required for SMS |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | Required for SMS |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | Required for SMS |
| `EMAIL_HOST` | SMTP host | smtp.gmail.com |
| `EMAIL_PORT` | SMTP port | 587 |
| `EMAIL_USER` | Email username | Required for email |
| `EMAIL_PASS` | Email password | Required for email |
| `MAX_FILE_SIZE` | Max file upload size | 5242880 (5MB) |
| `UPLOAD_PATH` | Upload directory | ./uploads |

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password security
- **Input Validation**: Express-validator for request validation
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **File Upload Security**: File type and size validation

## Error Handling

The API includes comprehensive error handling:
- Validation errors
- Authentication errors
- Database errors
- File upload errors
- Custom error responses

## SMS Integration

The API integrates with Twilio for SMS notifications:
- Account verification
- Password reset
- Order status updates
- Appointment reminders

## File Upload

- Supports images (JPEG, PNG, GIF) and documents (PDF, DOC, DOCX)
- Maximum file size: 5MB
- Organized storage in uploads directory
- Secure file naming with timestamps

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Code Style
- Consistent error handling with asyncHandler
- Standardized response format
- Comprehensive input validation
- Proper middleware usage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team. 