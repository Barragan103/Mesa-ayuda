import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRouter from './routes/auth';
import usersRouter from './routes/users';
import helpRequestsRouter from './routes/helpRequests';
import messagesRouter from './routes/messages';

import HardwareIssuesRouter from './routes/hardwareIssues';
import SoftwareIssuesRouter from './routes/softwareIssues';
import OtherIssuesRouter from './routes/otherIssues';
import areasRouter from './routes/areas';

import { verifyToken } from './middleware/auth';
import { isAdmin, isEmployee } from './middleware/role';

const app = express();
const port = process.env.PORT || 4000;


app.use(cors({
  origin: [
      'http://localhost:5173',
      'http://localhost:5173',
  ],
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json());


app.use('/api/auth', authRouter);


app.use(
  '/api/help-requests',
  helpRequestsRouter
);


app.use(
  '/api/users',
  verifyToken,
  isAdmin,
  usersRouter
);


app.use(
  '/api/areas',
  verifyToken,
  areasRouter
);


app.use(
  '/api/issues/software',
  verifyToken,
  SoftwareIssuesRouter
);
app.use(
  '/api/issues/hardware',
  verifyToken,
  HardwareIssuesRouter
);
app.use(
  '/api/issues/other',
  verifyToken,
  OtherIssuesRouter
);
app.use(
  '/api/help-requests/:helpRequestId/messages',
  messagesRouter
);


app.get('/', (_req, res) => {
  res.send('🚀 API Express corriendo correctamente');
});


app.listen(port, () => {
  console.log(`Servidor Express escuchando en http://localhost:${port}`);
});
