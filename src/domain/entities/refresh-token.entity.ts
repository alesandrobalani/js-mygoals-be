export class RefreshToken {
  constructor(
    readonly id: string,
    readonly token: string,
    readonly userId: string,
    readonly expiresAt: Date,
    readonly revokedAt: Date | undefined,
    readonly updatedAt: Date,
  ) {}

  get isValid(): boolean {
    return !this.revokedAt && this.expiresAt > new Date();
  }
}
