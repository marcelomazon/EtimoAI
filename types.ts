
export interface EtymologyInfo {
  word: string;
  origin: string;
  myth?: string;
  truth: string;
  context: string;
  funFact?: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
