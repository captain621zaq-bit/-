
export interface GeneratedImage {
  url: string;
  base64: string;
  prompt: string;
  timestamp: number;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  EDITING = 'EDITING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}
