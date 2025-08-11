import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Post from "./post";

@Entity("users")
export default class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  email!: string;

  @Column()
  passwordHash!: string;

  @OneToMany(() => Post, (post) => post.user)
  posts!: Post[];

  @Column()
  createdAt: Date = new Date();

  @Column()
  updatedAt: Date = new Date();
}
