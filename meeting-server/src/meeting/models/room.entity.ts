import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class RoomEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  creator: string;

  @Column()
  password: string;
}
