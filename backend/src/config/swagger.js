const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Swagger configuration
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "A simple Express API",
    },
    servers: [
      {
        url: "http://localhost:5000", // Change if your server runs on a different port
      },
    ],
  },
  apis: ["./src/routes/*.js"], // Path to your route files
};

// Generate swagger specification
const specs = swaggerJsdoc(options);

// Export swaggerUi and specs
module.exports = {
  swaggerUi,
  specs,
};
