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
        url:  'https://wbd-deply-8kc9-k2xvz5jyl-saikiranthota1s-projects.vercel.app' || 'http://localhost:4000',
        description: 'Development server',
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