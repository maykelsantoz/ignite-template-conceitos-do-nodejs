const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

/**
 * Tipos de params => Identificar um recurso editar/deletar/buscar
 * 
 */

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  //const { username } = 'maykelsantoz';

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "Username not found!" });
  }

  request.user = user;

  return next()

}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(
    (user) => user.username === username
  );

  if (userAlreadyExists) {
    return response.status(400).json({ error: "Username already exists!" });
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });

  return response.status(201).send();

});

/**Delete */
// app.get('/users', (request, response) => {
//   return response.status(201).json(users);
// });
/**Delete */


app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const todosAssignment = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(todosAssignment);

  return response.status(201).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todos) => todos.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo id not found!" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  //const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todos) => todos.id === id);


  if (!todo) {
    return response.status(404).json({ error: "Todo id not found!" });
  }

  if (todo.done === false) {
    todo.done = true
  } else {
    todo.done = false
  }

  return response.status(201).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  //const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todos) => todos.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo id not found!" });
  }

  user.todos.splice(todo, 1);

  return response.status(200).json(users);

});

module.exports = app;