const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./utils/config');
const logger = require('./utils/logger');
require('express-async-errors');
const notesRouter = require('./controllers/notes');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const testingRouter = require('./controllers/testing');
const middleware = require('./utils/middleware');
const app = express();

mongoose.set('strictQuery', false);
logger.info('Connecting to', config.MONGODB_URI);
mongoose
    .connect(config.MONGODB_URI)
    .then(() => logger.info('Connected to noteApp database'))
    .catch((error) =>
        logger.error('Error connecting to noteApp database:', error.message)
    );
app.use(cors());
app.use(express.static('dist'));
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/notes', notesRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
if(process.env.NODE_ENV === 'test'){
    app.use('/api/testing', testingRouter);
}
app.use('/api/login', loginRouter);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;