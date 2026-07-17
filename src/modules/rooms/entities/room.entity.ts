import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { DecimalTransformer } from '../../../common/helpers/decimal.transformer';

@Entity('rooms')
@Index(['propertyId'])
@Index(['pricePerNight'])
@Index(['capacity'])
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'property_id', type: 'uuid' })
  propertyId!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'int' })
  capacity!: number;

  @Column({
    name: 'price_per_night',
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  pricePerNight!: number;

  @Column({ name: 'total_unit', type: 'int' })
  totalUnit!: number;

  @Column({ name: 'available_unit', type: 'int' })
  availableUnit!: number;

  @ManyToOne(() => Property, (property) => property.rooms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property!: Property;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
