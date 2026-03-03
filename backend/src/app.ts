import express from 'express';
import cors from 'cors';
const app = express();
import { connectDB } from './config/database';
import { errorHandler } from './shared/middlewares/error.middleware';
import cookieParser from 'cookie-parser';
import authRouter from './modules/auth/auth.routes';
import passport from './config/passport';
import adminRouter from './modules/admin/mentor-management/admin-mentor.routes';
import mentorAuthRouter from './modules/mentor/auth/mentor-auth.routes';
import adminUserRouter from './modules/admin/user-management/admin-user.routes';

app.use(cors({
     origin: [
          process.env.FRONTEND_URL || 'http://localhost:5173',
     ],
     credentials: true
}));
app.use(express.json());
app.use(cookieParser());



app.use(passport.initialize());

connectDB();

// Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/mentor/auth', mentorAuthRouter);
app.use('/api/admin', adminUserRouter);

app.use(errorHandler)

app.get('/health', (req, res) => {
     res.send('Health Route is working ')
})

export default app;