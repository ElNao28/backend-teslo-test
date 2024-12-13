import { Request } from "express";

export const fileFilter = (req:Request,file:Express.Multer.File, cb:Function) => {

    if(!file) return cb(new Error('File is emptty'),false);

    const fileExptension = file.mimetype.split('/')[1];
    const validExtensions = ['jpg', 'png', 'gif','jpeg'];

    if(validExtensions.includes(fileExptension)){
        return cb(null, true);
    }
    return cb(null, false);
}