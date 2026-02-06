export class CreateUsersBatchUploadErrorDto {
  batchUploadId: number;
  rowNumber: number;
  fieldName?: string;
  errorType: string;
  errorMessage: string;
}
