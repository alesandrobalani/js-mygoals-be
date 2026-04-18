export class User {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly passwordHash: string,
    readonly name: string,
    readonly updatedAt: Date,
  ) {}
}
