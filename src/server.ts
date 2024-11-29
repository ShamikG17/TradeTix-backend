import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { setupSwagger } from './configs/swagger.config';
import cors from 'cors';
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'
import { slowDown } from 'express-slow-down'

// Routes
import userRouter from './routers/user.router';
import eventRouter from './routers/event.router';
import ticketRouter from './routers/ticket.router';
import listingRouter from './routers/listing.router';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'))

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI as string)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB', err));

// Swagger
setupSwagger(app);

// rate-limitting
const limiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 min window
	limit: 10000, // limitting upto 10k requests
	standardHeaders: 'draft-7',
	legacyHeaders: false,
})
app.use(limiter)

// slow-down requests
const slower = slowDown({
	windowMs: 5 * 60 * 1000,
	delayAfter: 5500,
	// delayMs: (hits) => hits * 100,
	delayMs: (hits) => 500,
})
app.use(slower)

// Health Endpoints
app.get('/api/ping', (req, res) => {
    res.send({ response: 'pong'});
});

app.get('/api/health', (req, res) => {
    res.send({ 
        status: 'UP', 
        uptime: process.uptime(),
        timestamp: new Date().toISOString() 
    });
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/tickets', ticketRouter);
app.use('/api/v1/listings', listingRouter);


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
