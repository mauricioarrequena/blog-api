import { DataSource } from "typeorm";
import User from "./entities/user";

export const AppDatasource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "blogDb",
  synchronize: true,
  entities: [User],
});
