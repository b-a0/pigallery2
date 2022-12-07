export enum JobProgressStates {
  running = 1, cancelling = 2, interrupted = 3, canceled = 4, finished = 5
}


export interface JobProgressLogDTO {
  id: number;
  timestamp: string;
  comment: string;
}

export interface JobProgressDTO {
  jobName: string;
  HashName: string;
  steps: {
    all: number,
    processed: number,
    skipped: number,
  };
  state: JobProgressStates;
  logs: JobProgressLogDTO[];
  time: {
    start: number,
    end: number
  };
}
