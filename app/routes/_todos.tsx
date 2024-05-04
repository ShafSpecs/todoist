import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet } from "@remix-run/react";
import { requireUserId } from "~/.server/auth";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return await requireUserId(request, request.url);
}

export default function Component() {
  return (
    <div className="todo-page">
      <nav className="todo-header">
        <Link to={'/todos'}>Todoist</Link>
        <Link to='/logout'>Logout</Link>
      </nav>
      <Outlet />
    </div>
  );
}