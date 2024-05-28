import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { setupSwagger } from './configs/swagger.config';

// Routes
import userRouter from './routers/user.router';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/tradeTix-DB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB', err));

// Swagger
setupSwagger(app);

app.get('/api/ping', (req, res) => {
    res.send('Pong');
});

app.use('/api/users', userRouter);


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
