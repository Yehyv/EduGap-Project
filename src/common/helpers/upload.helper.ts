import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const imageStorage = (folder: string) => {
  // لو الفولدر مش موجود نعمله
  if (!existsSync(`./uploads/${folder}`)) {
    mkdirSync(`./uploads/${folder}`, { recursive: true });
  }

  return {
    storage: diskStorage({
      destination: `./uploads/${folder}`,
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
  };
};
