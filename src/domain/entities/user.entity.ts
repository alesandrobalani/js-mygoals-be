export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export class User {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly passwordHash: string,
    readonly name: string,
    readonly role: UserRole,
    readonly updatedAt: Date,
  ) {}
}
