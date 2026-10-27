import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { Express } from 'express';

export interface HttpServerHandle {
  server: Server;
  host: string;
  port: number;
  close(): Promise<void>;
}

export async function startHttpServer(app: Express, host = process.env.HOST || '0.0.0.0', port = Number(process.env.PORT || 8080)): Promise<HttpServerHandle> {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('INVALID_PORT');
  const server = createServer(app);
  await new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => {
      server.off('listening', onListening);
      reject(error);
    };
    const onListening = () => {
      server.off('error', onError);
      resolve();
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port, host);
  });
  const address = server.address() as AddressInfo;
  return {
    server,
    host: typeof address === 'object' && address ? address.address : host,
    port: typeof address === 'object' && address ? address.port : port,
    close: () => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())),
  };
}
