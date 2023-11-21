const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');
const Note = require('../models/note');

usersRouter.route('/')
    .get(async(request, response, next) => {
        const users = await User
            .find({}).populate('notes', { content: 1, important: 1 });

        response.json(users);
    })
    .post(async (request, response, next) => {
        const { username, password,name } = request.body;

        const saultRounds = 10;
        const passwordHash = await bcrypt.hash(password, saultRounds);

        const user = new User({ username, name, passwordHash });
        const savedUser = await user.save();
        response.status(201).json(savedUser);
    });
module.exports = usersRouter;