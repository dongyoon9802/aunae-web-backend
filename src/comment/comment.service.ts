import { COMMENT_STATUS } from './types/comment.type';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { UserService } from '../user/user.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entities';
import { Repository, UpdateResult } from 'typeorm';
import { ResponseCommentDto } from './dtos/response-comment.dto';
import { Comment } from './entities/comment.entities';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    private userService: UserService,
  ) {}
  /**
   *
   * @param commentId id of comment
   * @param userId id of user
   * @returns comment entity
   */
  async getComment(
    commentId: string,
    userId: string,
  ): Promise<ResponseCommentDto> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (
      comment.status === COMMENT_STATUS.PRIVATE &&
      userId !== comment.author.id
    ) {
      comment.description = null;
    }
    return comment;
  }

  async createComment(userId: string, dto: CreateCommentDto): Promise<Comment> {
    const comment = this.commentRepository.create({
      authorId: userId,
      ...dto,
    });

    return await this.commentRepository.save(comment);
  }

  async getAllCommentsOnBoard(userId: string, boardId: number) {
    const comments = await this.commentRepository.find({ where: { boardId } });
    comments.map((comment) =>
      comment.status === COMMENT_STATUS.PRIVATE && comment.author.id !== userId
        ? { description: null, ...comment }
        : comment,
    );
    return comments;
  }

  /**
   *
   * @param user user entity
   * @param commentId id of comment
   * @returns failed throws BadRequestException, success returns UpdateResult
   */
  async deleteComment(user: User, commentId: string): Promise<UpdateResult> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment)
      throw new BadRequestException(`Can not find comment by id ${commentId}`);
    if (user.id !== comment.author.id)
      throw new BadRequestException(
        `Can not delete comment by user ${user.username}`,
      );

    const result = await this.commentRepository.softDelete(comment.id);
    return result;
  }
}
