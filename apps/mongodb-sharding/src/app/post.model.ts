import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now } from 'mongoose';

// Scenario: Wanna show the latest posts of each user on their profile the best shard key would be handle. Since then we have a targeted query instead of scatter and gather.

export type PostDocument = HydratedDocument<Post>;

@Schema({
  timestamps: true,
  validateBeforeSave: true,
})
export class Post {
  @Prop({
    required: true, // To be a shard key all the docs have to have it.
  })
  handle: string; // Unique identifier for each user
  // TODO: add the user doc + its relationship.
  // It is actually our relationship field to the users document.

  @Prop()
  postText: string; // Text content of the post

  @Prop()
  postImage: string; // URL of the image in the post

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
