import { v4 as uuid } from 'uuid';

type CallBackFunction = (error: Error | null, filename: string) => void;

export const fileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: CallBackFunction,
) => {
  if (!file) return callback(new Error('File is empty'), '');

  const fileExtension = file.mimetype.split('/')[1];
  const fileName = `${uuid()}.${fileExtension}`;

  //* Cambia el nombre del archivo antes de subirlo al servidor.
  callback(null, fileName);
};
