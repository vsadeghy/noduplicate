import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { tryCatch } from '~/utils/trycatch';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService, type Task } from './prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}
  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const [taskExists, error] = await tryCatch(
      this.prisma.task.findUnique({
        where: { title: createTaskDto.title },
      }),
    );

    if (error) {
      console.error(error);
      throw new Error('Unexpected error');
    }
    if (taskExists) {
      throw new ConflictException(
        `Task with title ${createTaskDto.title} already exists`,
      );
    }
    return this.prisma.task.create({ data: createTaskDto });
  }

  async findAll(): Promise<Task[]> {
    return this.prisma.task.findMany();
  }

  async findOne(id: number): Promise<Task> {
    const [task, error] = await tryCatch(
      this.prisma.task.findUnique({
        where: { id },
      }),
    );
    if (error) {
      console.error(error);
      throw new Error('Unexpected error');
    }
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    let task = await this.findOne(id);
    const [updatedTask, error] = await tryCatch(
      this.prisma.task.update({ where: task, data: updateTaskDto }),
    );
    if (error) {
      console.error(error);
      throw new Error('Unexpected error');
    }
    return updatedTask;
  }

  async remove(id: number): Promise<Task> {
    const task = await this.findOne(id);
    const [removedTask, error] = await tryCatch(
      this.prisma.task.delete({ where: task }),
    );
    if (error) {
      console.error(error);
      throw new Error('Unexpected error');
    }
    return removedTask;
  }
}
