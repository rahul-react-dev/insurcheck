import app from './app.js';
import { connectDB } from './config/database.js';

const PORT = process.env.PORT || 5000;

// Connect to database
await connectDB();

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 InsurCheck Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});
