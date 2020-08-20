const express = require("express");
const cors = require("cors");
const { v4: uuid } = require('uuid');
const { isUuid } = require("uuidv4");
const { request } = require("express");
const app = express();

app.use(express.json());
app.use(cors());


const repositories = [];
function logRequests(request,response,next){        //Middleware
  const {method,url} = request;
  const logLabel =`[${method.toUpperCase()}] ${url}`;
  console.time(logLabel);
  next();
  console.timeEnd(logLabel);

}

function validateID(request,response,next){
  const {id} = request.params;
  if (!isUuid(id)){
    return response.status(400).json({error:"Invalid ID!"})
  }
  const repositoriesIndex = repositories.findIndex(repository => repository.id === id);
  if (repositoriesIndex < 0){ 
    return response.status(400).json({error:"Repository not found!"})
  } 
  request.repositoriesIndex = repositoriesIndex;
  return next();
}
app.use(logRequests);
app.use('/repositories/:id',validateID);

app.get("/repositories", (request, response) => {

  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const {title,url,techs} = request.body;
  const repository ={
    id:uuid(),
    title,
    url,
    techs,
    likes:0
  }
  repositories.push(repository);
  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const {id} = request.params;
  const {title,url,techs} = request.body;
  const repository ={
      id,
      title,
      url,
      techs,
      likes:repositories[request.repositoriesIndex].likes
  };
  repositories[request.repositoriesIndex] = repository;
  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
    repositories.splice(request.repositoriesIndex,1);
    return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
    repositories[request.repositoriesIndex].likes++;
    return response.json({likes:repositories[request.repositoriesIndex].likes});
});

module.exports = app;
