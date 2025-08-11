import { PostService } from "./postService";
import { Repository } from "typeorm";
import Post from "../../entities/post";
import Tag from "../../entities/tag";
import User from "../../entities/user";

const mockFoundTags: Tag[] = [
  { id: 1, name: "tech" } as Tag,
  { id: 2, name: "news" } as Tag,
  { id: 3, name: "sports" } as Tag,
];
const mockFoundUser = {
  id: 10,
  email: "user1@example.com",
} as User;
const mockCraetedPost = {
  id: 99,
  title: "post title",
  content: "post content",
  tags: mockFoundTags,
  user: mockFoundUser,
} as Post;
const mockError = new Error("db error");

describe("postService", () => {
  let tagRepotisory: jest.Mocked<Repository<Tag>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let postRepository: jest.Mocked<Repository<Post>>;
  let postService: PostService;

  describe("createPost", () => {
    beforeEach(() => {
      tagRepotisory = { find: jest.fn() } as any;
      userRepository = { findOne: jest.fn() } as any;
      postRepository = { save: jest.fn() } as any;
      postService = new PostService(
        postRepository,
        tagRepotisory,
        userRepository
      );
    });

    it("should create a post successfully with valid data", async () => {
      tagRepotisory.find.mockResolvedValue(mockFoundTags);
      userRepository.findOne.mockResolvedValue(mockFoundUser);
      postRepository.save.mockResolvedValue(mockCraetedPost);

      const result = await postService.createPost(
        "post title",
        "post content",
        [1, 2],
        10
      );

      expect(tagRepotisory.find).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 10 },
      });
      expect(postRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "post title",
          content: "post content",
          tags: [
            { id: 1, name: "tech" },
            { id: 2, name: "news" },
          ],
          user: { id: 10, email: "user1@example.com" },
        })
      );
      expect(result).toEqual(mockCraetedPost);
    });

    it("throws an error if the user does not exitst", async () => {
      tagRepotisory.find.mockResolvedValue([]);
      userRepository.findOne.mockResolvedValue(null);
      await expect(
        postService.createPost("post title", "post content", [1, 2], 999)
      ).rejects.toThrow();
      expect(postRepository.save).not.toHaveBeenCalled();
    });

    it("shoud only associate existing tags", async () => {
      tagRepotisory.find.mockResolvedValue(mockFoundTags);
      userRepository.findOne.mockResolvedValue(mockFoundUser);
      postRepository.save.mockImplementation(
        async (post) => post as Partial<Post> as Post
      );

      const result = await postService.createPost(
        "title",
        "content",
        [1, 999, 3],
        10
      );

      expect(result.tags).toHaveLength(2);
      expect(result.tags[0].id).toBe(1);
      expect(result.tags[1].id).toBe(3);
      expect(result.tags.find((t: Tag) => t.id === 999)).toBeUndefined();
    });

    it("shoud save a psot with empty tags array, when no matchig tags are found", async () => {
      tagRepotisory.find.mockResolvedValue(mockFoundTags);
      userRepository.findOne.mockResolvedValue(mockFoundUser);
      postRepository.save.mockImplementation(async (post) => post as Post);

      const result = await postService.createPost(
        "title",
        "content",
        [998, 999],
        10
      );

      expect(result.tags).toEqual([]);
      expect(result.title).toBe("title");
      expect(result.content).toBe("content");
      expect(result.user).toEqual({ id: 10, email: "user1@example.com" });
    });

    it("should propagate repository errors", async () => {
      tagRepotisory.find.mockResolvedValue(mockFoundTags);
      userRepository.findOne.mockResolvedValue(mockFoundUser);
      postRepository.save.mockRejectedValue(mockError);

      await expect(
        postService.createPost("ttile", "content", [1], 10)
      ).rejects.toThrow(new Error("db error"));
    });

    it("should not mutate the original tagIds array", async () => {
      tagRepotisory.find.mockResolvedValue(mockFoundTags);
      userRepository.findOne.mockResolvedValue(mockFoundUser);
      postRepository.save.mockResolvedValue(mockCraetedPost);
      const tagIdsInput = [1, 2];
      const originalTagIdsCopy = [...tagIdsInput];

      await postService.createPost(
        "post title",
        "post content",
        tagIdsInput,
        10
      );

      expect(tagIdsInput).toEqual(originalTagIdsCopy);
    });
  });
});
