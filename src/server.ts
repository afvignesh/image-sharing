import express from 'express';
import authRoutes from './routes/authRoutes';
import imageRoutes from './routes/imageRoutes';

const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '10mb' }));

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/img', imageRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});