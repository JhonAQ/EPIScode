export interface HealthResponse {
  status: "ok" | "error";
  uptime: number;
  timestamp: string;
  version: string;
  environment: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
