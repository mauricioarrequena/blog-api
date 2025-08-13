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
const mockFoundPost = {
  id: 1,
  title: "post title",
  content: "psot content",
} as Post;
const mockFindAndCoutResult: [Post[], number] = [
  [
    {
      id: 1,
      title: "post title",
      content: "psot content",
    } as Post,
    {
      id: 2,
      title: "post title2",
      content: "psot content2",
    } as Post,
  ],
  2,
];
const mockUpdatePostUserOwner = {
  id: 1,
  email: "user1false@example.com",
} as User;
const mockUpdatePost = {
  id: 1,
  title: "post title",
  content: "psot content",
  userId: mockUpdatePostUserOwner.id,
} as Post;
const mockPostChanges = {
  id: 1,
  title: "a updated title",
  content: "a updated content",
} as Post;

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

  describe("getPostById", () => {
    beforeEach(() => {
      tagRepotisory = { find: jest.fn() } as any;
      userRepository = { findOne: jest.fn() } as any;
      postRepository = { findOne: jest.fn() } as any;
      postService = new PostService(
        postRepository,
        tagRepotisory,
        userRepository
      );
    });

    it("should return he corect post with valid postId", async () => {
      postRepository.findOne.mockResolvedValue(mockFoundPost);
      const postId = 1;

      const result = await postService.getPostById(postId);

      expect(result?.id).toBe(1);
    });

    it("should return null when postId does not exist", async () => {
      postRepository.findOne.mockResolvedValue(null);
      const postId = 999;

      const result = await postService.getPostById(postId);

      expect(result).toBe(null);
    });

    it("it should handle erros", async () => {
      postRepository.findOne.mockRejectedValue(mockError);
      const postId = 999;

      await expect(postService.getPostById(postId)).rejects.toThrow(
        new Error("db error")
      );
    });

    it("should call finOne method", async () => {
      postRepository.findOne.mockResolvedValue(mockFoundPost);
      const postId = 1;

      await postService.getPostById(postId);

      expect(postRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it("should call findOne with the correct query object", async () => {
      postRepository.findOne.mockResolvedValue(mockFoundPost);
      const postId = 1;

      await postService.getPostById(postId);

      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: { id: postId },
      });
    });
  });

  describe("getPaginatedPosts", () => {
    beforeEach(() => {
      tagRepotisory = { find: jest.fn() } as any;
      userRepository = { findOne: jest.fn() } as any;
      postRepository = { findAndCount: jest.fn() } as any;
      postService = new PostService(
        postRepository,
        tagRepotisory,
        userRepository
      );
    });

    it("shold return a list of posts and total count", async () => {
      postRepository.findAndCount.mockResolvedValue(mockFindAndCoutResult);

      const [posts, totalPosts] = await postService.getPaginatedPosts();

      expect(posts).toEqual([
        {
          id: 1,
          title: "post title",
          content: "psot content",
        } as Post,
        {
          id: 2,
          title: "post title2",
          content: "psot content2",
        } as Post,
      ]);
      expect(totalPosts).toBe(2);
    });

    it("should calculate skip", async () => {
      postRepository.findAndCount.mockResolvedValue(mockFindAndCoutResult);

      await postService.getPaginatedPosts(2, 10);

      expect(postRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });

    it("should return posts ordered by createdAt descending", async () => {
      postRepository.findAndCount.mockResolvedValue(mockFindAndCoutResult);

      await postService.getPaginatedPosts();

      expect(postRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { createdAt: "DESC" },
        })
      );
    });

    it("should use dafault valid values", async () => {
      postRepository.findAndCount.mockResolvedValue(mockFindAndCoutResult);

      await postService.getPaginatedPosts();

      expect(postRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 5,
        })
      );
    });

    it("shoud propagate repository errors", async () => {
      postRepository.findAndCount.mockRejectedValue(mockError);

      await expect(postService.getPaginatedPosts()).rejects.toThrow(
        new Error("db error")
      );
    });

    it("should call findAndAcoutn", async () => {
      postRepository.findAndCount.mockResolvedValue(mockFindAndCoutResult);

      await postService.getPaginatedPosts();

      expect(postRepository.findAndCount).toHaveBeenCalledTimes(1);
    });

    it("should call findAndAcoutn with the correct object", async () => {
      postRepository.findAndCount.mockResolvedValue(mockFindAndCoutResult);

      await postService.getPaginatedPosts();

      expect(postRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 5,
          order: { createdAt: "DESC" },
        })
      );
    });
  });

  describe("updatePost", () => {
    beforeEach(() => {
      userRepository = { findOne: jest.fn() } as any;
      postRepository = { findOne: jest.fn(), save: jest.fn() } as any;
      postService = new PostService(
        postRepository,
        tagRepotisory,
        userRepository
      );
    });

    it("should update a post successfully", async () => {
      userRepository.findOne.mockResolvedValue(mockUpdatePostUserOwner);
      postRepository.findOne.mockResolvedValue(mockUpdatePost);
      postRepository.save.mockImplementation(async (post) => post as Post);
      const userId = 1;

      const result = await postService.udpatePost(userId, mockPostChanges);

      expect(result).toEqual({
        id: 1,
        title: "a updated title",
        content: "a updated content",
        userId: 1,
        updatedAt: expect.any(Date),
      });
    });

    it("should throw an error if the user is not foudn", async () => {
      userRepository.findOne.mockResolvedValue(null);
      const userId = 999;

      await expect(
        postService.udpatePost(userId, mockPostChanges)
      ).rejects.toThrow(new Error("user not found"));
    });

    it("should throw an error if the post is not found", async () => {
      userRepository.findOne.mockResolvedValue(mockUpdatePostUserOwner);
      postRepository.findOne.mockResolvedValue(null);
      const userId = 1;
      const postNotFoundError = new Error("post not found");

      await expect(
        postService.udpatePost(userId, mockPostChanges)
      ).rejects.toThrow(postNotFoundError);
    });

    it("should throw an error if the user found is not ther owner of the psot", async () => {
      const notOwnerUser = { id: 999, email: "user999@example.com" } as User;
      userRepository.findOne.mockResolvedValue(notOwnerUser);
      postRepository.findOne.mockResolvedValue(mockUpdatePost);
      const notOwnerError = new Error("user is not owner of this post");

      await expect(
        postService.udpatePost(notOwnerUser.id, mockPostChanges)
      ).rejects.toThrow(notOwnerError);
    });

    it("should not modify the postChanges object", async () => {
      userRepository.findOne.mockResolvedValue(mockUpdatePostUserOwner);
      postRepository.findOne.mockResolvedValue(mockUpdatePost);
      postRepository.save.mockResolvedValue(mockPostChanges);
      const postChangesCopy = { ...mockPostChanges };

      await postService.udpatePost(1, mockPostChanges);

      return expect(mockPostChanges).toEqual(postChangesCopy);
    });

    it("should should call the repository save method", async () => {
      userRepository.findOne.mockResolvedValue(mockUpdatePostUserOwner);
      postRepository.findOne.mockResolvedValue(mockUpdatePost);
      postRepository.save.mockResolvedValue(mockPostChanges);

      await postService.udpatePost(1, mockPostChanges);

      expect(postRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
