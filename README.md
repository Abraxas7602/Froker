# Backend Development Assignment
This is a backend application built with Node.js, Express, and MongoDB. It provides user management functionalities including user registration, login, profile retrieval, and borrowing operations. The application uses JSON Web Tokens (JWT) for authentication and password hashing for security.

## Features

- **User Registration**: Allows users to sign up if they meet age and salary criteria.
- **User Login**: Authenticates users and provides a JWT token.
- **Profile Retrieval**: Retrieves user profile information.
- **Borrowing**: Allows authenticated users to borrow money and calculates repayment details.

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- MongoDB
- A `.env` file with the following environment variables:
  - `ACCESS_TOKEN`: Secret key for JWT signing
  - `MONGODB_URL`: MongoDB connection string

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>

2. Install dependencies:
   ```bash
   npm install
   
3. Create a '.env' file in the root directory with the following content:
   ```env
   ACCESS_TOKEN=your_jwt_secret
   MONGODB_URL=your_mongodb_connection_string

4. Start the server:
   ```bash
   npm start
The server will run on 'http://localhost:8080'. 

## API Endpoints
### 1. POSt /signup
**Description:** Registers a new user and determines if the application should be approved or rejected based on the user’s age and monthly salary.

#### Request Body:
```json
  {
    "phone": "string",
    "email": "string",
    "name": "string",
    "dob": "YYYY-MM-DD",
    "monthlySalary": "number",
    "password": "string"
  }
```
#### Response:
- Status: 200 OK
- Body: '{ "message": "User created successfully" }'

#### Error Responses:
- Status: 400 Bad Request
- Body: '{ "message": "User does not meet the criteria" }'

<img width="960" alt="POSTsignup" src="https://github.com/user-attachments/assets/51e728c2-e2a3-409c-a6eb-8c5ee818d61f">

### 2. POST /login
**Description:** Authenticates a user and returns a JWT token.

#### Request Body:
```json
{
  "email": "string",
  "password": "string"
}
```
#### Response:
- Status: 200 OK
- Body: '{ "token": "jwt_token", "user": { "user_data" } }'

#### Error Responses:
- Status: 422 Unprocessable Entity
- Body: '"password not matched"'
- Status: 400 Bad Request
- Body: '{ "message": "Invalid email or password" }'

<img width="960" alt="POSTlogin" src="https://github.com/user-attachments/assets/3137a090-be76-403a-8628-929a65c2e6f6">


### 3. GET /user
**Description:** Retrieves the profile information of the authenticated user.

#### Headers:
- 'Authorization: Bearer <token>'

#### Response:
- Status: 200 OK
- Body: '{ "user_data" }'

#### Error Responses:
- Status: 401 Unauthorized
- Body: '{ "message": "Token is missing" }'
- Status: 403 Forbidden
- Body: '{ "message": "Invalid token" }'

<img width="960" alt="GETuser" src="https://github.com/user-attachments/assets/43c3f069-dc43-4805-ab07-4ca0a0ad9b22">


### 4. POSt /borrow
**Description:** Allows the authenticated user to borrow money.

#### Request Body:
```json
{
  "amount": "number"
}
```
#### Response:
- Status: 200 OK
- Body: '{ "purchasePower": "number", "monthlyRepayment": "number" }'

#### Error Responses:
- Status: 500 Internal Server Error
- Body: '{ "message": "error_message" }'

<img width="960" alt="POSTborrow2" src="https://github.com/user-attachments/assets/9cd239cb-12ee-4819-ae97-6a548c102a57">






