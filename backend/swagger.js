const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Startup Platform API',
      version: '1.0.0',
      description: 'API documentation for the Startup Platform',
    },
    servers: [
      {
        url: process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:4000',
        description: process.env.VERCEL_URL ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routers/**/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

const swaggerConfig = {
  swaggerOptions: {
    persistAuthorization: true,
  },
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Startup Platform API Documentation"
};

module.exports = {
  specs,
  swaggerUi,
  swaggerConfig
};