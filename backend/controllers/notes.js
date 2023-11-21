const notesRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Note = require('../models/note');
const User = require('../models/user');

const getTokenFrom = request => {
    const authorization = request.get('authorization');
    if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.replace('Bearer ', '');
    }
    return null;
};

notesRouter
    .route('/')
    .get(async (request, response) => {
        const notes = await Note.find({}).populate('user', { username: 1, name: 1 });
        response.json(notes);

    })
    .post(async (request, response, next) => {
        const body = request.body;

        const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
        if (!decodedToken.id) {
            return response.status(401).json({ error: 'token invalid' });
        }

        const user = await User.findById(decodedToken.id);
        const note = new Note({
            content: body.content,
            important: body.important || false,
            user: user._id,
        });

        const savedNote = await note.save();
        user.notes = user.notes.concat(savedNote._id);
        await user.save();
        response.status(201).json(savedNote);
    });

notesRouter
    .route('/:id')
    .get(async (request, response, next) => {

        const note = await Note.findById(request.params.id);
        if (note) {
            response.json(note);
        } else {
            response.status(404).end();
        }

    })
    .delete(async (request, response, next) => {
        await Note.findByIdAndRemove(request.params.id);
        response.status(204).end();

    })
    .put(async (request, response, next) => {

        const { content, important } = request.body;
        const returnedNote = await Note.findByIdAndUpdate(
            request.params.id,
            { content, important },
            { new: true, runValidators: true, context: 'query' }
        );
        response.json(returnedNote);


    });

module.exports = notesRouter;