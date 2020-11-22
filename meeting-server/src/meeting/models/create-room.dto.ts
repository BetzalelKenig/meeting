export class CreateRoomDto {
  constructor(
    public name: string,
    public creator: string,
    public password: string,
  ) {}
}
