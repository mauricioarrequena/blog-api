jest.mock("bcrypt");
import { Repository } from "typeorm";
import bcrypt from "bcrypt";
import AuthenticationService from "./authenticationService";
import User from "../../entities/user";

describe("authenticationService", () => {
  let userRepository: jest.Mocked<Repository<User>>;
  let authenticationService: AuthenticationService;

  beforeEach(() => {
    userRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
    } as any;
    authenticationService = new AuthenticationService(userRepository);
  });

  describe("createUser", () => {
    it("hashes the password and save the user", async () => {
      const email = "test@example.com";
      const password = "password123";
      const passwordHash = "hashed_passowrd";
      (bcrypt.hash as jest.Mock).mockResolvedValue(passwordHash);
      userRepository.save.mockResolvedValue({
        id: 1,
        email,
        passwordHash,
      } as User);

      const result = await authenticationService.createUser(email, password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email,
          passwordHash,
        })
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          email,
          passwordHash,
        })
      );
    });

    it("throws an error if hashing fails", async () => {
      const email = "test@example.com";
      const password = "password123";
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error("hash error"));

      await expect(
        authenticationService.createUser(email, password)
      ).rejects.toThrow("hash error");
    });

    it("throws an error if saving user fails", async () => {
      const email = "test@example.com";
      const password = "password123";
      const passwordHash = "hashed_password";
      (bcrypt.hash as jest.Mock).mockResolvedValue(passwordHash);
      userRepository.save.mockRejectedValue(new Error("db error"));

      await expect(
        authenticationService.createUser(email, password)
      ).rejects.toThrow("db error");
    });
  });

  describe("findByEmail", () => {
    it("find a returns user by email", async () => {
      const email = "user@example.com";
      const user = { id: 1, email } as User;
      userRepository.findOne.mockResolvedValue(user);

      const result = await authenticationService.findByEmail(email);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toBe(user);
    });

    it("returns null if no user is found", async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await authenticationService.findByEmail(
        "nonexistent@example.com"
      );

      expect(result).toBeNull();
    });

    it("throws an error if findone fails", async () => {
      userRepository.findOne.mockRejectedValue(new Error("db error"));

      await expect(
        authenticationService.findByEmail("email@example.com")
      ).rejects.toThrow("db error");
    });
  });
});
