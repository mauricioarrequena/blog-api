import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import Post from "./post";

@Entity("tags")
export default class Tag {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @ManyToMany(() => Post, (post) => post.tags)
  posts!: Post[];

  @Column()
  createdAt: Date = new Date();

  @Column()
  updatedAt: Date = new Date();
}
