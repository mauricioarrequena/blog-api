import { Repository } from "typeorm";
import Post from "../../entities/post";
import Tag from "../../entities/tag";
import User from "../../entities/user";

export class PostService {
  constructor(
    private postRepository: Repository<Post>,
    private tagRepository: Repository<Tag>,
    private userRepository: Repository<User>
  ) {}

  public async createPost(
    title: string,
    content: string,
    tagIds: number[],
    userId: number
  ) {
    try {
      const allTags = await this.tagRepository.find();
      const tags = allTags.filter((tag) => tagIds.includes(tag.id));
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error(`user with id ${userId} does not exist`);
      }
      const newPost = new Post();
      newPost.title = title;
      newPost.content = content;
      newPost.tags = tags;
      newPost.user = user;
      const post = await this.postRepository.save(newPost);

      return post;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  public async getPostById(postId: number): Promise<Post | null> {
    try {
      return await this.postRepository.findOne({ where: { id: postId } });
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  public async getPaginatedPosts(
    page: number = 1,
    limit: number = 5
  ): Promise<[Post[], number]> {
    try {
      const skippedRows = (page - 1) * limit;
      return await this.postRepository.findAndCount({
        skip: skippedRows,
        take: limit,
        order: { createdAt: "DESC" },
      });
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  public async udpatePost(userId: number, postChanges: Post) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error("user not found");
      }
      const post = await this.postRepository.findOne({
        where: { id: postChanges.id },
      });
      if (!post) {
        throw new Error("post not found");
      }
      if (post.userId != user.id) {
        throw new Error("user is not owner of this post");
      }
      const updatedPost: Post = {
        ...post,
        ...postChanges,
        updatedAt: new Date(),
      };

      return await this.postRepository.save(updatedPost);
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
}
