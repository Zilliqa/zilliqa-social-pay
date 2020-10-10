const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  info: {
    // API informations (required)
    title: 'SocialPay API', // Title (required)
    version: '1.0.0', // Version (required)
    description: 'list of APIs for socialPay', // Description (optional)
  },
  host: 'localhost:3000/api/v1',
  basePath: '/', // Base path (optional)
};

module.exports = swaggerJSDoc({
  swaggerDefinition,
  apis: ['server/routes/*.js']
});
