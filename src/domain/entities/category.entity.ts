export class Category {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string | undefined,
    readonly updatedAt: Date,
  ) {}
}