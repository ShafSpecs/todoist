import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { Fragment, useRef, useState } from "react";
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
    <Fragment>
      <div className="todo-content">
        <header className="content-header">
          <h3>New List</h3>
        </header>
        <Form method="post">
          <label>
            List Name
            <input type="text" name="name" required />
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
          <div>
            <input type="text" form={undefined} placeholder="Add Todo" ref={addTodoRef} />
            <button
              type="button"
              onClick={addTodo}
            >
              Add Todo
            </button>
          </div>
          <button type="submit">Create</button>
        </Form>
      </div>
    </Fragment>
  );
}