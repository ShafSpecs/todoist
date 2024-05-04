import { z } from "zod"
import { requireUserId } from "./auth"
import { prisma } from "./db"

export const TodoSchema = z.object({
  done: z.boolean().default(false),
  text: z.string(),
})

export const getAllTodoLists = async (request: Request) => {
  const user = await requireUserId(request)

  const todoLists = await prisma.user.findUnique({
    select: {
      lists: {
        select: {
          name: true,
          todos: true,
          id: true,
        }
      },
      name: true
    },
    where: { id: user }
  })

  return todoLists
}

export const getTodoList = async (request: Request, listId: string) => {
  const user = await requireUserId(request)

  const todoList = await prisma.todoList.findFirst({
    where: {
      id: listId,
      userId: user
    },
    include: {
      todos: {
        select: {
          id: true,
          title: true,
          done: true,
        }
      }
    }
  })

  return todoList
}

export const createTodoList = async (request: Request, name: string, todos: z.infer<typeof TodoSchema>[]) => {
  const user = await requireUserId(request)

  const todoList = await prisma.todoList.create({
    data: {
      userId: user,
      name,
      todos: {
        create: todos.map(todo => ({
          title: todo.text,
          done: todo.done,
        }))
      }
    }
  })

  return todoList
}

export const deleteTodoList = async (request: Request, listId: string) => {
  const user = await requireUserId(request)

  await prisma.todoList.deleteMany({
    where: {
      id: listId,
      userId: user
    }
  })

  return true
}

export const createTodo = async (listId: string, todo: z.infer<typeof TodoSchema>) => {
  const newTodo = await prisma.todo.create({
    data: {
      listId,
      title: todo.text,
      done: todo.done,
    }
  })

  return newTodo
}

export const updateTodo = async (todoId: number, todo: z.infer<typeof TodoSchema>) => {
  const updatedTodo = await prisma.todo.update({
    where: { id: todoId },
    data: {
      title: todo.text,
      done: todo.done,
    }
  })

  return updatedTodo
}

export const deleteTodo = async (todoId: number) => {
  await prisma.todo.delete({
    where: { id: todoId }
  })

  return true
}