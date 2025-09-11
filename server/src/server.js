import app from './app.js';
import { connectDB } from './config/database.js';

const PORT = process.env.PORT || 5000;

// Connect to database
await connectDB();

// Export the app instead of starting server here
// Server startup is handled by server/index.ts
export default app;
