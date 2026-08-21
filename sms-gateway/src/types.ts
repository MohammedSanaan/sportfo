export type ErrorCode =
  | "UNAUTHORIZED"
  | "INVALID_REQUEST"
  | "SMS_PROVIDER_ERROR"
  | "SMS_PROVIDER_TIMEOUT"
  | "INTERNAL_ERROR";

export interface SendSmsSuccessResponse {
  success: true;
}

export interface SendSmsErrorResponse {
  success: false;
  code: ErrorCode;
}

export type SendSmsResponse = SendSmsSuccessResponse | SendSmsErrorResponse;
