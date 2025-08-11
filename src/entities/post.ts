import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import Tag from "./tag";
import User from "./user";

@Entity("posts")
export default class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  content!: string;

  @ManyToMany(() => Tag, (tag) => tag.posts)
  @JoinTable({
    name: "posts_tags",
  })
  tags!: Tag[];

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: "userId"})
  user!: User;

  @Column()
  userId!: number;

  @Column()
  createdAt: Date = new Date();

  @Column()
  updatedAt: Date = new Date();
}
