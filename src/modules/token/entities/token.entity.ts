// import { Auth } from 'src/modules/auth/entities/auth.entity';
// import {
//   Column,
//   Entity,
//   JoinColumn,
//   ManyToOne,
//   PrimaryGeneratedColumn,
// } from 'typeorm';

// export enum TokenType {
//   REFRESH = 'refresh',
//   RESET_PASSWORD = 'resetPassword',
//   ACCESS = 'access',
//   VERIFY_EMAIL = 'verifyEmail',
//   VERIFY_RESET_EMAIL = 'verifyResetEmail',
//   UNSUBSCRIBE_NEWSlETTER = 'unsubscribeNewsLetter',
// }

// @Entity('token')
// export class Token {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ nullable: false })
//   jti: string;

//   @ManyToOne(() => Auth)
//   @JoinColumn({ name: 'id' })
//   user: Auth;

//   @Column({ nullable: false })
//   userId: number;

//   @Column({ nullable: false })
//   email: string;

//   @Column({ type: 'enum', enum: TokenType, nullable: false })
//   type: TokenType;

//   @Column({ nullable: false })
//   expiresAt: Date;

//   @Column({ default: () => 'CURRENT_TIMESTAMP' })
//   createdAt: Date;

//   @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
//   updatedAt: Date;
// }

import { Auth } from 'src/modules/auth/entities/auth.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum TokenType {
  REFRESH = 'refresh',
  RESET_PASSWORD = 'resetPassword',
  ACCESS = 'access',
  VERIFY_EMAIL = 'verifyEmail',
  VERIFY_RESET_EMAIL = 'verifyResetEmail',
  UNSUBSCRIBE_NEWSlETTER = 'unsubscribeNewsLetter',
}

@Entity('token')
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  jti: string;

  @ManyToOne(() => Auth)
  @JoinColumn({ name: 'userId' }) // This should reference the userId column, not id
  user: Auth;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  email: string;

  @Column({ type: 'enum', enum: TokenType, nullable: false })
  type: TokenType;

  @Column({ nullable: false })
  expiresAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
