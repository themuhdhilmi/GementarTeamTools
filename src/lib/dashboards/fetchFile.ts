import { S3, type AWSError } from 'aws-sdk';

// Type guard for AWS errors
function isAWSError(error: unknown): error is AWSError {
  return error instanceof Error && 'code' in error;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const s3 = new S3({
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  s3ForcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  signatureVersion: process.env.S3_SIGNATURE_VERSION
});

interface FetchParams {
  fileName: string;
  bucketName: string;
}

interface S3FetchResult {
  Body: Buffer;
  ContentType: string;
}

export async function fetchFromS3({ fileName, bucketName }: FetchParams): Promise<{ data: Buffer; contentType: string }> {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileName,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const result = await s3.getObject(params).promise() as S3FetchResult;
    
    return {
      data: result.Body,
      contentType: result.ContentType
    };
  } catch (error: unknown) {
    if (isAWSError(error)) {
      console.error('Error fetching file from S3:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new Error(`Failed to fetch file: ${error.message}`);
    }
    throw new Error('An unknown error occurred during file fetch');
  }
}

export async function fetchMultipleFiles(files: FetchParams[]): Promise<Array<{ data: Buffer; contentType: string }>> {
  try {
    const fetchPromises = files.map(file => fetchFromS3(file));
    const results = await Promise.all(fetchPromises);
    return results;
  } catch (error: unknown) {
    if (isAWSError(error)) {
      console.error('Error fetching multiple files:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new Error(`Failed to fetch multiple files: ${error.message}`);
    }
    throw new Error('An unknown error occurred during multiple file fetch');
  }
} 