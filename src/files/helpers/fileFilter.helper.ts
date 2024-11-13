type CallBackFunction = (error: Error | null, acceptFile: boolean) => void;

export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: CallBackFunction,
) => {
  //* Si el archivo es nulo, llamamos a la función 'callback' con un error y 'false' como argumentos.
  if (!file) return callback(new Error('File is empty'), false);

  const fileExtension = file.mimetype.split('/')[1];
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

  //* Si el archivo es una imagen con una extensión válida, llamamos a la función 'callback' con 'null' y 'true' como argumentos.
  if (validExtensions.includes(fileExtension)) {
    return callback(null, true);
  }

  callback(null, false);
};
