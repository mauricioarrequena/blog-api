import { Repository } from "typeorm";
import bcrypt from "bcrypt";
import User from "../entities/user";

export default class AuthenticationService {
  constructor(private userRepository: Repository<User>) {}

  public async createUser(email: string, password: string): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User();
      newUser.email = email;
      newUser.passwordHash = hashedPassword;
      const user = await this.userRepository.save(newUser);

      return user;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  public async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
}
