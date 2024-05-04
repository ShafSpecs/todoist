import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Fragment } from "react";
import { getAllTodoLists } from "~/.server/todos";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const todoLists = await getAllTodoLists(request)

  if (!todoLists) {
    throw new Error("User not found")
  }

  return json({
    list: todoLists.lists,
    username: todoLists.name,
  })
}

export default function Component() {
  const { list, username } = useLoaderData<typeof loader>()

  return (
    <Fragment>
      <div className="todo-content">
        <header className="content-header">
          <h3>{username} Todos</h3>
          <Link to='/new'>New List</Link>
        </header>
        {list.length ? list.map((list) => (
          <Link to={`/${list.id}`} className="todo-list" key={list.id}>
            <h4>{list.name}</h4>
            <ul>
              {list.todos.slice(0, 3).map((todo) => (
                <li key={todo.id}>
                  {todo.done ? "✅" : "❌"} {todo.title}
                </li>
              ))}
            </ul>
          </Link>
        )) : (
          <p>No todo lists found</p>
        )}
      </div>
    </Fragment>
  );
}