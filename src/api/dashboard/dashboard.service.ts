import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import Redis from 'ioredis';
import { config } from 'src/config';
import { UserRole } from '@prisma/client';

export interface DashboardStats {
  students: number;
  teachers: number;
  groups: number;
  courses: number;
}

// export interface AttendanceStats {
//   totalLessons: number;
//   attendance: number;
//   details: Array<{ status: string; _count: number }>;
// }

export interface GroupStats {
  totalGroups: number;
  activeGroups: number;
  averageStudents: number;
  groupsData: Array<{
    name: string;
    status: string;
    students: number;
  }>;
}

export interface TeacherStats {
  totalTeachers: number;
  teachersData: Array<{
    name: string;
    groups: number;
    students: number;
  }>;
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  private async getCachedData<T>(cacheKey: string, getData: () => Promise<T>): Promise<T> {
    try {
      const cachedData = await this.redis.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      
      const data = await getData();
      await this.redis.set(cacheKey, JSON.stringify(data), 'EX', config.REDIS_EX_TIME);
      return data;
    } catch (error) {
      console.error(`Error fetching ${cacheKey}:`, error);
      throw error;
    }
  }

  private getCacheKey(prefix: string): string {
    return `dashboard:${prefix}_stats:${new Date().toISOString().split('T')[0]}`;
  }

  async getGeneralStats(): Promise<DashboardStats> {
    return this.getCachedData(this.getCacheKey('general'), async () => {
      const [studentsCount, teachersCount, groupsCount, coursesCount] = await Promise.all([
        this.prisma.user.count({ where: { role: UserRole.STUDENT } }),
        this.prisma.user.count({ where: { role: UserRole.TEACHER } }),
        this.prisma.groups.count(),
        this.prisma.course.count(),
      ]);

      return {
        students: studentsCount,
        teachers: teachersCount,
        groups: groupsCount,
        courses: coursesCount,
      };
    });
  }

  // async getAttendanceStats(): Promise<AttendanceStats> {
  //   return this.getCachedData(this.getCacheKey('attendance'), async () => {
  //     const totalLessons = await this.prisma.lessons.count();
  //     const attendanceStats = await this.prisma.attendance.groupBy({
  //       by: ['status'],
  //       _count: true,
  //     });

  //     const presentCount = attendanceStats.find(stat => stat.status === 'PRESENT')?._count ?? 0;
  //     const totalAttendance = attendanceStats.reduce((acc, stat) => acc + stat._count, 0);

  //     return {
  //       totalLessons,
  //       attendance: totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0,
  //       details: attendanceStats,
  //     };
  //   });
  // }

  async getGroupsStats(): Promise<GroupStats> {
    return this.getCachedData(this.getCacheKey('groups'), async () => {
      const groups = await this.prisma.groups.findMany({
        include: {
          _count: {
            select: {
              group_members: true,
            },
          },
        },
      });

      return {
        totalGroups: groups.length,
        activeGroups: groups.filter(group => group.status === 'ACTIVE').length,
        averageStudents: groups.reduce((acc, group) => acc + group._count.group_members, 0) / groups.length,
        groupsData: groups.map(group => ({
          name: group.name,
          status: group.status,
          students: group._count.group_members,
        })),
      };
    });
  }

  async getTeachersStats(): Promise<TeacherStats> {
    return this.getCachedData(this.getCacheKey('teachers'), async () => {
      const teachers = await this.prisma.user.findMany({
        where: { role: UserRole.TEACHER },
        include: {
          group_members: {
            include: {
              group: {
                include: {
                  group_members: true
                }
              }
            }
          }
        }
      });

      return {
        totalTeachers: teachers.length,
        teachersData: teachers.map(teacher => ({
          name: teacher.username,
          groups: teacher.group_members.length,
          students: teacher.group_members.reduce((acc, member) => {
            const groupMembersCount = member.group.group_members.length;
            return acc + groupMembersCount;
          }, 0),
        })),
      };
    });
  }
}
