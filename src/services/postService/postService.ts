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
}
