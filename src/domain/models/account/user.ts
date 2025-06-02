export enum Gender {
  Male = 'Male',
  Female = 'Female',
  unknown = 'unknown',
}

export interface User {
  pkid: number;
  name: string;
  email: string;
  birthdate: Date;
  gender: Gender;
  height: number;
  status: boolean;
}
