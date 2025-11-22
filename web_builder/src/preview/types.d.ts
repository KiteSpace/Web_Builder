export type FileMap = Record<string, string>;

export interface BuildRequest {
  type: "build";
  entry: string;
  files: FileMap;
}

export interface BuildSuccess {
  type: "built";
  html: string;
}

export interface BuildFailure {
  type: "error";
  error: string;
}

export type WorkerMessage = BuildRequest | BuildSuccess | BuildFailure;
