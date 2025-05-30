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

interface UploadParams {
  file: File | Blob;
  fileName: string;
  bucketName: string;
  contentType?: string;
}

interface S3UploadResult {
  Location: string;
}

async function blobToBuffer(blob: Blob): Promise<Buffer> {
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function uploadToS3({ file, fileName, bucketName, contentType }: UploadParams): Promise<string> {
  try {
    const buffer = await blobToBuffer(file);
    
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: contentType ?? 'application/octet-stream',
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const result = await s3.upload(params).promise() as S3UploadResult;
    // Extract only the path portion from the Location URL
    const url = new URL(result.Location);
    return url.pathname;
  } catch (error: unknown) {
    if (isAWSError(error)) {
      console.error('Error uploading file to S3:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new Error(`Failed to upload file: ${error.message}`);
    }
    throw new Error('An unknown error occurred during file upload');
  }
}

export async function uploadMultipleFiles(files: UploadParams[]): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => uploadToS3(file));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error: unknown) {
    if (isAWSError(error)) {
      console.error('Error uploading multiple files:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new Error(`Failed to upload multiple files: ${error.message}`);
    }
    throw new Error('An unknown error occurred during multiple file upload');
  }
}
