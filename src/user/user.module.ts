import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entities';
import { UserAct } from './entities/userAct.entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserAct])],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
