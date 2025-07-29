import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateGroupDto } from './dto/create.group.dto';
import { GroupService } from './group.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateGroupDto } from './dto/update.group.dto';
import { GroupStatus } from '@prisma/client';

@ApiTags('Groups') // Group API documentation tag
@ApiBearerAuth()
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @ApiOperation({ summary: 'Create new group' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'New group created successfully',
    schema: {
      example: {
        status: HttpStatus.CREATED,
        message: 'New group created',
        data: {
          group_id: 'uuid-example',
          name: 'N14',
          description: 'Advanced programming group',
          course_id: 'course-uuid-example',
          created_at: '2025-04-10T05:42:33.401Z',
          updated_at: '2025-04-10T05:42:33.401Z',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Group with this name already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async createGroup(@Body() createGroupDto: CreateGroupDto) {
    return this.groupService.createGroup(createGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups for the admin' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Groups retrieved successfully',
    type: [CreateGroupDto], // Or whatever type represents your group
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No groups found for this admin',
  })
  @ApiQuery({ name: 'page', required: false, type: 'number' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'start_date', required: false, type: 'string' })
  @ApiQuery({ name: 'status', required: false, type: 'string' })
  @ApiQuery({ name: 'name', required: false, type: 'string' })
  getAllGroups(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('start_date') startDate: string,
    @Query('status') status: GroupStatus,
    @Query('name') name: string,
  ) {
    return this.groupService.findAllGroup(page, limit, startDate, status, name);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific group by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group details retrieved successfully',
    type: CreateGroupDto, // Or the DTO type representing the group
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Group not found',
  })
  getOneGroup(@Param('id') groupId: string) {
    return this.groupService.findOneGroup(groupId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a group' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Group not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Group name already exists',
  })
  updateGroup(
    @Param('id') groupId: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupService.updateGroup(groupId, updateGroupDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a group' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Group not found',
  })
  deleteOne(@Param('id') groupId: string) {
    return this.groupService.remove(groupId);
  }
}
