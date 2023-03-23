/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/common/decorators/api-paginated-response.decorator';
import { UserEnum } from 'src/common/decorators/user.decorator';
import { UserInfoPipe } from 'src/common/pipes/user-info.pipe';
import { ReqPostListDto } from '../post/dto/req-post.dto';
import { PostService } from '../post/post.service';
import { ReqRoleListDto } from '../role/dto/req-role.dto';
import { RoleService } from '../role/role.service';
import {
  ReqAddUserDto,
  ReqChangeStatusDto,
  ReqResetPwdDto,
  ReqUpdataSelfDto,
  ReqUpdateAuthRoleDto,
  ReqUpdateSelfPwd,
  ReqUpdateUserDto,
  ReqUserListDto,
} from './dto/req-user.dto';
import { ResAuthRoleDto, ResUserDto, ResUserInfoDto } from './dto/res-user.dto';
import { User } from './entities/user.entity';
import { User as UserDec } from 'src/common/decorators/user.decorator';
import { UserService } from './user.service';
import { ApiException } from 'src/common/exceptions/api.exception';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { ExcelService } from 'src/modules/common/excel/excel.service';
import { Keep } from 'src/common/decorators/keep.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { BusinessTypeEnum, Log } from 'src/common/decorators/log.decorator';
import { DataScope } from 'src/common/decorators/datascope.decorator';
import { DataScopeSql } from 'src/common/decorators/data-scope-sql.decorator';
import { RequiresPermissions } from 'src/common/decorators/requires-permissions.decorator';
import { RepeatSubmit } from 'src/common/decorators/repeat-submit.decorator';

@ApiTags('Quản lý người dùng')
@Controller('system/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
    private readonly excelService: ExcelService,
    @Inject(forwardRef(() => RoleService))
    private readonly roleService: RoleService,
  ) {}

  /* Danh sách người dùng truy vấn Pagling */
  @Get('list')
  @DataScope({
    userAlias: 'user2',
  })
  @RequiresPermissions('system:user:query')
  @ApiPaginatedResponse(User)
  async list(
    @Query(PaginationPipe) reqUserListDto: ReqUserListDto,
    @DataScopeSql() sataScopeSql: string,
  ) {
    return this.userService.list(reqUserListDto, null, null, sataScopeSql);
  }

  /* Thêm Người dùng, có được các tùy chọn */
  @Get()
  async getPostAndRole(): Promise<ResUserInfoDto> {
    const posts = await this.postService.list(new ReqPostListDto());
    const roles = await this.roleService.list(new ReqRoleListDto());
    return {
      posts: posts.rows,
      roles: roles.rows,
    };
  }

  /* Nhận thông tin người dùng */
  @Get('profile')
  async profile(@UserDec(UserEnum.userId) userId: number) {
    const data = await this.userService.userAllInfo(userId);
    const postGroup = data.posts.map((item) => item.postName).join('、');
    const roleGroup = data.roles.map((item) => item.roleName).join('、');
    return {
      data,
      postGroup,
      roleGroup,
    };
  }

  /* Thay đổi thông tin người dùng cá nhân */
  @RepeatSubmit()
  @Put('profile')
  @Log({
    title: 'Quản lý người dùng',
    businessType: BusinessTypeEnum.update,
  })
  async updataProfile(
    @Body() reqUpdataSelfDto: ReqUpdataSelfDto,
    @UserDec(UserEnum.userId) userId: number,
  ) {
    await this.userService.updataProfile(reqUpdataSelfDto, userId);
  }

  /* Thay đổi mật khẩu cá nhân */
  @RepeatSubmit()
  @Put('profile/updatePwd')
  @Log({
    title: 'Quản lý người dùng',
    businessType: BusinessTypeEnum.update,
  })
  async updateSelfPwd(
    @Query() reqUpdateSelfPwd: ReqUpdateSelfPwd,
    @UserDec(UserEnum.userName, UserInfoPipe) userName: string,
  ) {
    await this.userService.updateSelfPwd(reqUpdateSelfPwd, userName);
  }

  /* Tải lên hình đại diện của bạn */
  @RepeatSubmit()
  @Post('profile/avatar')
  @UseInterceptors(FileInterceptor('avatarfile'))
  async avatar(
    @UploadedFile() file: Express.Multer.File,
    @Query('fileName') fileName,
    @UserDec(UserEnum.userId) userId: number,
  ) {
    const reqUpdataSelfDto = new ReqUpdataSelfDto();
    reqUpdataSelfDto.avatar = fileName;
    await this.userService.updataProfile(reqUpdataSelfDto, userId);
    return {
      imgUrl: fileName,
    };
  }

  /* Truy vấn thông tin người dùng thông qua ID */
  @Get(':userId')
  @RequiresPermissions('system:user:query')
  async one(@Param('userId') userId: number): Promise<ResUserInfoDto> {
    const posts = await this.postService.list(new ReqPostListDto());
    const roles = await this.roleService.list(new ReqRoleListDto());
    const user = (await this.userService.userAllInfo(userId)) as ResUserDto;
    user.deptId = user.dept ? user.dept.deptId : null;
    const postIds = user.posts.map((item) => item.postId);
    const roleIds = user.roles.map((item) => item.roleId);
    user.postIds = [];
    user.roleIds = [];
    return {
      data: user,
      postIds,
      roleIds,
      posts: posts.rows,
      roles: roles.rows,
    };
  }

  /* Thêm người dùng */
  @RepeatSubmit()
  @Post()
  @RequiresPermissions('system:user:add')
  @Log({
    title: 'Quản lý người dùng',
    businessType: BusinessTypeEnum.insert,
  })
  async add(
    @Body() reqAddUserDto: ReqAddUserDto,
    @UserDec(UserEnum.userName, UserInfoPipe) userName: string,
  ) {
    const user = await this.userService.findOneByUserNameState(
      reqAddUserDto.userName,
    );
    if (user) throw new ApiException('Tên người dùng này đã tồn tại, vui lòng thay thế nó');
    reqAddUserDto.createBy = reqAddUserDto.updateBy = userName;
    await this.userService.addUser(reqAddUserDto);
  }

  /* Người dùng biên tập */
  @RepeatSubmit()
  @Put()
  @RequiresPermissions('system:user:edit')
  @Log({
    title: 'Quản lý người dùng',
    businessType: BusinessTypeEnum.update,
  })
  async update(
    @Body() reqUpdateUserDto: ReqUpdateUserDto,
    @UserDec(UserEnum.userName, UserInfoPipe) userName: string,
  ) {
    const user = await this.userService.findOneByUserNameState(
      reqUpdateUserDto.userName,
    );
    if (user) {
      reqUpdateUserDto.updateBy = userName;
      await this.userService.updateUser(reqUpdateUserDto);
    } else {
      throw new ApiException('người dùng này không tòn tại');
    }
  }

  /* Xoá người dùng */
  @Delete(':userIds')
  @RequiresPermissions('system:user:remove')
  @Log({
    title: 'Quản lý người dùng',
    businessType: BusinessTypeEnum.delete,
  })
  async delete(
    @Param('userIds') userIds: string,
    @UserDec(UserEnum.userName, UserInfoPipe) userName: string,
  ) {
    const userIdArr = userIds.split(',');
    await this.userService.delete(userIdArr, userName);
  }

  //Làm mới mật khẩu mở khóa
  @RepeatSubmit()
  @Put('resetPwd')
  @RequiresPermissions('system:user:resetPwd')
  async resetPwd(
    @Body() reqResetPwdDto: ReqResetPwdDto,
    @UserDec(UserEnum.userName, UserInfoPipe) userName: string,
  ) {
    await this.userService.resetPwd(
      reqResetPwdDto.userId,
      reqResetPwdDto.password,
      userName,
    );
  }

  /* Truy vấn danh sách nhân vật và vai trò của người dùng được gán */
  @Get('authRole/:userId')
  async authRole(@Param('userId') userId: number): Promise<ResAuthRoleDto> {
    return await this.userService.authRole(userId);
  }

  /* Gán vai trò cho người dùng */
  @RepeatSubmit()
  @Put('authRole')
  async updateAuthRole(
    @Query() reqUpdateAuthRoleDto: ReqUpdateAuthRoleDto,
    @UserDec(UserEnum.userName, UserInfoPipe) userName: string,
  ) {
    const roleIdArr = reqUpdateAuthRoleDto.roleIds
      .split(',')
      .map((item) => Number(item));
    await this.userService.updateAuthRole(
      reqUpdateAuthRoleDto.userId,
      roleIdArr,
      userName,
    );
  }

  /* Biến đổi Trạng thái */
  @RepeatSubmit()
  @Put('changeStatus')
  async changeStatus(
    @Body() reqChangeStatusDto: ReqChangeStatusDto,
    @UserDec(UserEnum.userName, UserInfoPipe) userName: string,
  ) {
    await this.userService.changeStatus(
      reqChangeStatusDto.userId,
      reqChangeStatusDto.status,
      userName,
    );
  }

  /* Xuất Excel người dùng */
  @RepeatSubmit()
  @DataScope({
    userAlias: 'user2',
  })
  @Post('export')
  @RequiresPermissions('system:user:export')
  @Keep()
  @Log({
    title: 'Quản lý người dùng',
    businessType: BusinessTypeEnum.export,
    isSaveResponseData: false,
  })
  async export(
    @Body(PaginationPipe) reqUserListDto: ReqUserListDto,
    @DataScopeSql() dataScopeSql: string,
  ) {
    const { rows } = await this.userService.list(
      reqUserListDto,
      null,
      null,
      dataScopeSql,
    );
    const file = await this.excelService.export(User, rows);
    return new StreamableFile(file);
  }

  /* Tải xuống mẫu */
  @RepeatSubmit()
  @Post('importTemplate')
  @Keep()
  async importTemplate() {
    const file = await this.excelService.importTemplate(User);
    return new StreamableFile(file);
  }

  /* người dùng Nhập Excel */
  @RepeatSubmit()
  @Post('importData')
  @RequiresPermissions('system:user:import')
  @UseInterceptors(FileInterceptor('file'))
  async importData(
    @UploadedFile() file: Express.Multer.File,
    @UserDec(UserEnum.userName, UserInfoPipe) userName: string,
  ) {
    const data = await this.excelService.import(User, file);
    await this.userService.insert(data, userName);
  }
}
