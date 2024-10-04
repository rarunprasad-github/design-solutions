import app from '../app';

const port = process.env.PORT || 3000;

const startServer = () => {
  app.listen(port, () => console.log(`Service is running on  port ${port}!`));
};

export default startServer;
