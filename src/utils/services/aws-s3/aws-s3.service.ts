import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AwsS3Service {
  private s3Client: S3Client;

  constructor() {
    // Validate environment variables
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_S3_USER_ACCESS_KEY;
    const secretAccessKey = process.env.AWS_S3_USER_SECRET_ACCESS_KEY;

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'AWS configuration is missing: AWS_REGION, AWS_S3_USER_ACCESS_KEY, or AWS_S3_USER_SECRET_ACCESS_KEY is not defined',
      );
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async getPresignedUrlAndImage(
    path: string,
    operation: 'UPLOAD' | 'DOWNLOAD',
    expiresIn: number,
  ) {
    let command: GetObjectCommand | PutObjectCommand;

    // const aclSetting = 'public-read';
    // ACL: aclSetting,

    switch (operation) {
      case 'UPLOAD':
        command = new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: path,
        });
        break;

      case 'DOWNLOAD':
        command = new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: path,
        });
        break;
      default:
        // console.log("Invalid Type of Operation");
        return null;
    }

    try {
      const preSignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });
      return {
        preSignedUrl,
        path: operation === 'UPLOAD' ? path : '',
      };
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw error; // Optionally rethrow the error for better debugging
    }
  }
}
