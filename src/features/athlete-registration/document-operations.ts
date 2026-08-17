export type DocumentOperationKind = "uploading" | "replacing" | "removing" | "viewing";

export interface DocumentOperationState {
  // Present only while the operation is actually in flight.
  kind?: DocumentOperationKind;
  // Present after a failed attempt; can coexist with a cleared `kind`.
  error?: string;
}

export type DocumentOperationsByField = Record<string, DocumentOperationState>;
