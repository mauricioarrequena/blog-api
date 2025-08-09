import { DataSource } from "typeorm";
import User from "./entities/user";
import Post from "./entities/post";
import Tag from "./entities/tag";

export const AppDatasource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "blogDb",
  synchronize: true,
  // dropSchema: true,
  entities: [User, Post, Tag],
});
