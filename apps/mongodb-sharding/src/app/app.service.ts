import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { posts } from './dummy-data';
import { Post } from './post.model';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
  ) {}

  onModuleInit() {
    Logger.log('Initializing some sample data...', 'AppService');
    this.postModel.create(posts);
  }

  getData(): { message: string } {
    return { message: 'Hello API' };
  }
}
