export interface IServer {
  register(): void;
}

export interface IHttpServer {
  listen(port: number, cb?: () => void): void;
  server: {
    close(): void;
  };
}
