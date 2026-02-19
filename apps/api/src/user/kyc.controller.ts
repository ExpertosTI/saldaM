import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

// This is a basic KYC controller for MVP.
// In prod, use S3/Cloud Storage and validate sessions/auth guards.

@Controller('kyc')
export class KycController {
  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 2, {
      storage: diskStorage({
        destination: './uploads/kyc',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadFile(@UploadedFiles() files: Array<Express.Multer.File>) {
    // In a real app, we associate this with the logged-in user and update their User entity keys.
    const response = files.map((file) => ({
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
    }));
    return {
      message: 'KYC Documents uploaded successfully',
      data: response,
    };
  }
}
