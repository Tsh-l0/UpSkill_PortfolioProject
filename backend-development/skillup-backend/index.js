import express from 'express';
import dotenv from 'dotenv';
import connectDB from './utils/db.js';
import projectRoutes from './routes/projectRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

connectDB();

app.use('/api', authRoutes);


app.use('/api/projects', projectRoutes);

app.get('/', (req, res) => {
  res.send('API is working ✅');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

