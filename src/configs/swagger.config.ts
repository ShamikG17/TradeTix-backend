import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Trade-Tix',
      version: '1.1.0',
      description: 'Trade-Tix API',
    },
    servers: [
      {
        url: 'http://tradetix.api.add2f90.kyma.ondemand.com/',
      },
      {
        url: `http://localhost:${process.env.PORT}`,
      }
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
  apis: [path.resolve(__dirname, "..", "routers") + '/**/*.router.[t|j]s'],
};

// initialize swagger-jsdoc
const swaggerSpec = swaggerJsDoc(swaggerOptions);

export function setupSwagger(app: any) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}