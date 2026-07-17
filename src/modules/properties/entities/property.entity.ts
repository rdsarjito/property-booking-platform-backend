import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';
import { DecimalTransformer } from '../../../common/helpers/decimal.transformer';

export enum PropertyType {
  HOTEL = 'HOTEL',
  VILLA = 'VILLA',
  APARTMENT = 'APARTMENT',
  GUEST_HOUSE = 'GUEST_HOUSE',
}

@Entity('properties')
@Index(['city', 'type'])
@Index(['rating'])
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  city!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'enum', enum: PropertyType })
  type!: PropertyType;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  rating!: number;

  @OneToMany(() => Room, (room) => room.property)
  rooms!: Room[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
