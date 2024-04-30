/**
 * This is the main server script that provides the API endpoints
 *
 * Uses sqlite.js to connect to db
 */

const fastify = require("fastify")({ logger: true });

const cors = require('@fastify/cors');
fastify.register(cors, {
  origin: true,
  credentials: true
});


fastify.register(require("@fastify/formbody"));

const db = require("./sqlite.js");
const errorMessage =
  "Error connecting to the database!";


const routes = { endpoints: [] };
fastify.addHook("onRoute", routeOptions => {
  routes.endpoints.push(routeOptions.method + " " + routeOptions.path);
});


fastify.get("/", (request, reply) => {
  const data = {
    title: "SWJC Server API",
    intro: "A database-backed API with the following endpoints",
    routes: routes.endpoints
  };
  reply.status(200).send(data);
});


// User registration
fastify.post("/register", async (request, reply) => {
  let data = {};
  const usernameExists = await db.checkUsername(request.body.username);
  if (usernameExists) {
    data.success = false;
    data.error = "Username is already taken.";
  } else {
    const userId = await db.addUser(request.body.username, request.body.password);
    if (userId) {
      data.success = true;
      data.userId = userId;  
    } else {
      data.success = false;
    }
  }
  const status = data.success ? 201 : 400;
  reply.status(status).send(data);
});



fastify.get("/checkUsername", async (request, reply) => {
  let data = {};
  const userId = await db.checkUsername(request.query.username);
  if (userId) {
    data.userId = userId;
  } else {
    data.error = "Username does not exist.";
  }
  const status = data.userId ? 200 : 400;
  reply.status(status).send(data);
});

// User login
fastify.post("/login", async (request, reply) => {
  let data = {};
  data.userId = await db.login(request.body.username, request.body.password);
  if (!data.userId) {
    data.error = "Invalid username or password.";
  }
  const status = data.userId ? 200 : 400;
  reply.status(status).send(data);
});




// Run the server and report out to the logs
fastify.listen({ port: 9000, host: '0.0.0.0' }, function (err, address) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
});

