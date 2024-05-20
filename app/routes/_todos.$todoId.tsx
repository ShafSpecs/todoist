import { useLoaderData } from "@remix-run/react";
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { createTodo, getTodoList, updateTodo } from "~/.server/todos";
import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router-dom";
import { Logger, WorkerActionArgs, WorkerLoadContext } from "@remix-pwa/sw";
import { BackgroundSyncQueue } from "@remix-pwa/sync";
import { useNetworkConnectivity } from "@remix-pwa/client";

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

type ExtendedContext = WorkerLoadContext & { logger: Logger, queue: BackgroundSyncQueue }

export const workerAction = async ({ context }: WorkerActionArgs) => {
  const { fetchFromServer, queue, event } = context as ExtendedContext

  let response;

  try {
    response = await fetchFromServer()
  } catch {
    await queue.pushRequest({
      request: event.request,
    })
    response = Response.error()
  }

  return response
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

type Toast = {
  title: string
  body: string
}

export default function Component() {
  const fetcher = useFetcher()
  const { listName, listTodos } = useLoaderData<typeof loader>()

  const [todos, setTodos] = useState(listTodos)
  const [toast, setToast] = useState<Toast | null>(null)
  const addTodoRef = useRef<HTMLInputElement>(null!)

  const isOnline = useNetworkConnectivity({
    onOnline: () => {
      setToast({ title: 'Online', body: 'Thank Goodness! We are back online' })
    },
    onOffline: () => {
      setToast({ title: 'Offline', body: 'Oh no! You are offline' })
    }
  })

  useEffect(() => {
    if (toast) setTimeout(() => setToast(null), 3000)
  }, [toast])

  useEffect(() => {
    if (isOnline) {
      setTodos(listTodos)
    } else {
      return;
    }
  }, [listTodos])

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
      {toast && <div className="toast">
        <h2>{toast.title}</h2>
        <p>{toast.body}</p>
      </div>
      }
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