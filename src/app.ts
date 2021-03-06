
import express from 'express';
import applyMicroservicesRoutesToApp from './microservice/base';

const app = express();

applyMicroservicesRoutesToApp(app);

// In case we switch to serverless: AWS Lambda requires to export app.
export default app;
