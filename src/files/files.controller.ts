import { Controller,Post, UploadedFile, UseInterceptors, BadRequestException, Get, Param, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/fileNamer.helper';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}


  @Get('producto/:imageName')
  findProductImage(
    @Res()res:Response,
    @Param('imageName')imageName: string
  ){
    const path = this.filesService.getStaticProductImage( imageName )
    res.sendFile(path);
    return path;
  }
  @Post()
  @UseInterceptors( FileInterceptor('file', {
    fileFilter:fileFilter,
    // limits:{  }
    storage:diskStorage({
      destination: './static/products',
      filename:fileNamer
    })
  }))
  uploadProductImage(
    @UploadedFile()
    file: Express.Multer.File,
  ) {

    if(!file){
      throw new BadRequestException('No file uploaded');
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/producto/${file.filename}`; 
    return {
      secureUrl
    }
  }
}
