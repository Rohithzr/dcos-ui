export type JobTaskStatus =
  | "TASK_CREATED"
  | "TASK_DROPPED"
  | "TASK_ERROR"
  | "TASK_FAILED"
  | "TASK_FINISHED"
  | "TASK_GONE"
  | "TASK_GONE_BY_OPERATOR"
  | "TASK_KILLED"
  | "TASK_KILLING"
  | "TASK_LOST"
  | "TASK_RUNNING"
  | "TASK_STAGING"
  | "TASK_STARTED"
  | "TASK_STARTING"
  | "TASK_UNKNOWN"
  | "TASK_UNREACHABLE";

export const JobTaskStatusSchema = `
  enum JobTaskStatus {
    TASK_CREATED
    TASK_DROPPED
    TASK_ERROR
    TASK_FAILED
    TASK_FINISHED
    TASK_GONE
    TASK_GONE_BY_OPERATOR
    TASK_KILLED
    TASK_KILLING
    TASK_LOST
    TASK_RUNNING
    TASK_STAGING
    TASK_STARTED
    TASK_STARTING
    TASK_UNKNOWN
    TASK_UNREACHABLE
  }
  `;
