import { Request, Response, NextFunction } from 'express';

class RequestLogger {

  logRequest(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    let hasLogged = false;

    const log = (status: string | number) => {
      if (!hasLogged) {
        hasLogged = true;
        const duration = Date.now() - start;
        const { method, originalUrl } = req;

        console.log(`${method} ${originalUrl} ${status} - ${duration}ms`);
      }
    };

    res.on('finish', () => {
      log(res.statusCode);
    });

    res.on('close', () => {
      log('abruptly closed');
    });

    res.on('error', (err: Error) => {
      console.error('Response error:', err);
      log('error');
    });

    next();
  }
}

export default new RequestLogger();
