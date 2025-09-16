import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

export class TasksService {
  private tasks: Task[] = [];
  private id = 0;
  create(createTaskDto: CreateTaskDto) {
    const taskExists = this.tasks.find(
      (task) => task.title === createTaskDto.title,
    );
    if (taskExists) {
      return new ConflictException(
        `Task with title ${createTaskDto.title} already exists`,
      );
    }
    const newTask = { ...createTaskDto, id: this.id++ };
    this.tasks.push(newTask);
    return newTask;
  }

  findAll() {
    return this.tasks;
  }

  findOne(id: number) {
    const task = this.tasks.find((task) => task.id === id);
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    let task = this.findOne(id);
    task = { ...task, ...updateTaskDto };
    return task;
  }

  remove(id: number) {
    const task = this.findOne(id);
    this.tasks = this.tasks.filter((task) => task.id !== id);
    return task;
  }
}
