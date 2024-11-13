import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  //* @IsEmail valida que el valor sea un email
  @IsString()
  @IsEmail()
  email: string;

  //* @MaxLength valida que el valor tenga una longitud máxima de 50
  //* @MinLength valida que el valor tenga una longitud mínima de 6
  //* @Matches valida que el valor cumpla con una expresión regular dada, en este caso que tenga al menos una letra mayúscula,
  //* una minúscula y un número
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;

  //* @MinLength valida que el valor tenga una longitud mínima de 1
  @IsString()
  @MinLength(1)
  fullName: string;
}
