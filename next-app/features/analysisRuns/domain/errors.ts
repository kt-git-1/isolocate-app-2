export class DomainError extends Error {
    constructor(
      message: string,
      public readonly code: string,
      public readonly meta?: Record<string, unknown>,
    ) {
      super(message);
      this.name = "DomainError";
    }
  }
  
  export class NotFoundError extends DomainError {
    constructor(id: string) {
      super("AnalysisRun not found", "ANALYSIS_RUN_NOT_FOUND", { id });
    }
  }
  
  export class InvalidStateError extends DomainError {
    constructor(message: string, meta?: Record<string, unknown>) {
      super(message, "ANALYSIS_RUN_INVALID_STATE", meta);
    }
  }