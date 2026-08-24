declare module "qz-tray" {
  type PromiseResolver<T> = (() => Promise<T>) | Promise<T>;

  type QzConfig = object;
  type QzPrintData = {
    type: "raw";
    format: "plain";
    data: string;
  };

  const qz: {
    websocket: {
      isActive(): boolean;
      connect(options?: { retries?: number; delay?: number }): Promise<void>;
    };
    security: {
      setCertificatePromise(handler: PromiseResolver<string>, options?: { rejectOnFailure?: boolean }): void;
      setSignatureAlgorithm(algorithm: "SHA512" | "SHA256" | "SHA1"): void;
      setSignaturePromise(handler: (data: string) => Promise<string>): void;
    };
    printers: {
      find(query?: string): Promise<string[] | string>;
      getDefault(): Promise<string>;
    };
    configs: {
      create(printer: string, options?: Record<string, unknown>): QzConfig;
    };
    print(config: QzConfig, data: QzPrintData[]): Promise<void>;
  };

  export default qz;
}
