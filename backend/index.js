require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Note = require("./models/note");
const app = express();
const requestLogger = (request, response, next) => {
	console.log("Method:", request.method);
	console.log("Path:  ", request.path);
	console.log("Body:  ", request.body);
	console.log("---");
	next();
};

const generateId = () => {
	const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
	return maxId + 1;
};

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: "unknown endpoint" });
};
const errorHandler = (error, request, response, next) => {
	console.log(error.message);
	if (error.name === "CastError") {
		return response.status(400).send({ error: "malformatted id" });
	} else if (error.name === "ValidationError") {
		return response.status(400).send({ error: error.message });
	}

	next(error);
};

app.use(cors());
app.use(express.static("dist"));
app.use(express.json());
app.use(requestLogger);

app
	.route("/api/notes")
	.get((request, response) => {
		Note.find({}).then((notes) => {
			response.json(notes);
		});
	})
	.post((request, response, next) => {
		const body = request.body;

		const note = new Note({
			content: body.content,
			important: body.important || false,
		});
		note
			.save()
			.then((returnedNote) => response.json(returnedNote))
			.catch((error) => next(error));
	});

app
	.route("/api/notes/:id")
	.get((request, response, next) => {
		Note.findById(request.params.id)
			.then((note) => {
				if (note) {
					response.json(note);
				} else {
					response.status(404).end();
				}
			})
			.catch((error) => next(error));
	})
	.delete((request, response, next) => {
		Note.findByIdAndRemove(request.params.id)
			.then((returnedNote) => response.status(204).end())
			.catch((error) => next(error));
	})
	.put((request, response, next) => {
		const { content, important } = request.body;
		Note.findByIdAndUpdate(
			request.params.id,
			{ content, important },
			{ new: true, runValidators: true, context: "query" }
		)
			.then((returnedNote) => {
				response.json(returnedNote);
			})
			.catch((error) => next(error));
	});

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
