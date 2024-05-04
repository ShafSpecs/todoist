import { useLoaderData } from "@remix-run/react";
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { createTodo, getTodoList, updateTodo } from "~/.server/todos";
import { useRef, useState } from "react";
import { useFetcher } from "react-router-dom";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const form = await request.formData()
  const formEntries = Object.fromEntries(form)

  switch (formEntries.type) {
    case 'add': {
      const todo = JSON.parse(formEntries.todo as string)
      await createTodo(params.todoId!, todo)

      return new Response('Successfully created todo')
    }
    case 'update': {
      const { id, ...todo } = JSON.parse(formEntries.todo as string)
      await updateTodo(id, todo)

      return new Response('Successfully updated todo')
    }
    default:
      return new Response('No action specified')
  }
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const list = await getTodoList(request, params.todoId!)

  if (!list) {
    return redirect('/todos')
  }

  return json({
    listName: list.name,
    listTodos: list.todos,
  })
}

export default function Component() {
  const fetcher = useFetcher()
  const { listName, listTodos } = useLoaderData<typeof loader>()

  const [todos, setTodos] = useState(listTodos)
  const addTodoRef = useRef<HTMLInputElement>(null!)

  if (listTodos !== todos) setTodos(listTodos)

  const addTodo = () => {
    if (!addTodoRef.current.value) return
    const text = addTodoRef.current.value

    setTodos(prev => [...prev, { title: text, done: false, id: Math.random() }])
    addTodoRef.current.value = ''

    fetcher.submit({
      type: 'add',
      todo: JSON.stringify({ text, done: false })
    }, {
      method: 'POST',
    })
  }

  return (
    <div className="todo-content todo-id-content">
      <p className="todo-id-header">{listName}</p>
      {todos
        .sort((a, b) => (
          a.done === b.done ? 0 : a.done ? 1 : -1
        ))
        .map(todo => (
          <div key={todo.title}>
            <input
              type="checkbox"
              value={todo.title}
              checked={todo.done}
              form={undefined}
              id={`${todo.title}-input`}
              onChange={(e) => {
                setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, done: e.target.checked } : t))
                fetcher.submit({
                  type: 'update',
                  todo: JSON.stringify({ id: todo.id, title: todo.title, done: e.target.checked })
                }, {
                  method: 'POST'
                })
              }}
            />
            <label htmlFor={`${todo.title}-input`}>{todo.title}</label>
          </div>
        ))
      }
      <div className="todo-id-submit">
        <input type="text" form={undefined} placeholder="Add Todo" ref={addTodoRef} />
        <button
          type="button"
          onClick={addTodo}
        >
          Add Todo
        </button>
      </div>
    </div>
  )
}