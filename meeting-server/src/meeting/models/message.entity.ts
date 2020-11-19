import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class MessageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @Column()
  room: string;

  @Column()
  sender: string;

  @Column()
  message: string;

  
}
