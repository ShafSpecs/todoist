import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useRef, useState } from "react";
import { z } from "zod";
import { createTodoList } from "~/.server/todos";

const TodoSchema = z.object({
  done: z.boolean().default(false),
  text: z.string(),
})

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData()
  const formEntries = Object.fromEntries(form)
  const todos = JSON.parse(formEntries.todos as string) as z.infer<typeof TodoSchema>[]
  const name = formEntries.name as string

  const { id } = await createTodoList(request, name, todos)

  return redirect(`/${id}`);
}

export default function Component() {
  const [todos, setTodos] = useState<z.infer<typeof TodoSchema>[]>([])
  const addTodoRef = useRef<HTMLInputElement>(null!)

  const addTodo = () => {
    if (!addTodoRef.current.value) return
    const text = addTodoRef.current.value

    setTodos(prev => [...prev, { text, done: false } as z.infer<typeof TodoSchema>])
    addTodoRef.current.value = ''
  }

  return (
    <div className="todo-content todo-id-content">
      <header className="content-header">
        <h3>New List</h3>
      </header>
      <Form method="post">
        <label>
          List Name
          <input
            type="text"
            name="name"
            required
            style={{
              padding: '6px 12px',
              margin: '0 4px 8px 4px',
              border: '1px solid #121212',
              borderRadius: '4px'
            }}
          />
        </label>
        <input type="hidden" name="todos" value={JSON.stringify(todos)} />
        {todos
          .sort((a, b) => (
            a.done === b.done ? 0 : a.done ? 1 : -1
          ))
          .map(todo => (
            <div key={todo.text}>
              <input
                type="checkbox"
                value={todo.text}
                checked={todo.done}
                form={undefined}
                onChange={(e) => (
                  setTodos(prev => prev.map(t => t.text === todo.text ? { ...t, done: e.target.checked } : t))
                )}
              />
              <label>{todo.text}</label>
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
        <button
          type="submit"
          style={{
            padding: '6px 12px',
            margin: '8px 4px',
            backgroundColor: '#121212',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >Create</button>
      </Form>
    </div>
  );
}