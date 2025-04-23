# Encrypted Chat Application

This project is an end-to-end encrypted chat web application built using Next.js and MongoDB. It allows users to register, log in, and send messages securely without relying on third-party services.

## Features

- User registration and authentication
- Real-time messaging between users
- End-to-end encryption for messages
- User-friendly chat interface

## Technologies Used

- Next.js: A React framework for building server-side rendered applications
- MongoDB: A NoSQL database for storing user and message data
- TypeScript: A superset of JavaScript that adds static types
- NextAuth.js: Authentication for Next.js applications

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/encrypted-chat-app.git
   ```

2. Navigate to the project directory:

   ```
   cd encrypted-chat-app
   ```

3. Install the dependencies:

   ```
   npm install
   ```

4. Create a `.env.local` file in the root directory and add your MongoDB connection string and any other necessary environment variables:

   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

### Running the Application

To start the development server, run:

```
npm run dev
```

The application will be available at `http://localhost:3000`.

### Usage

- Navigate to the registration page to create a new account.
- After registering, log in to access the chat interface.
- You can send messages to other users, which will be encrypted for security.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.