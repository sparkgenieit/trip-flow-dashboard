export type DocType =
  | "RC Document"
  | "FC Document"
  | "Government ID Proof"
  | "Driver License Proof"
  | "Permit Proof"
  | "Insurance Copy"
  | "Interior"
  | "Exterior"
  | "Videos"
  | "Others";

export const DOC_TYPES: DocType[] = [
  "RC Document",
  "FC Document",
  "Government ID Proof",
  "Driver License Proof",
  "Permit Proof",
  "Insurance Copy",
  "Interior",
  "Exterior",
  "Videos",
  "Others",
];

export type UploadedDoc = {
  id: string;
  type: DocType;
  file: File;
  previewUrl?: string; // images only
};
