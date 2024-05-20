import { usePWAManager } from "@remix-pwa/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet } from "@remix-run/react";
import { requireUserId } from "~/.server/auth";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return await requireUserId(request, request.url);
}

export default function Component() {
  const { promptInstall, userInstallChoice } = usePWAManager()

  return (
    <div className="todo-page">
      <nav className="todo-header">
        <Link to={'/todos'}>Todoist</Link>
        <div>
          {(!userInstallChoice || userInstallChoice !== 'accepted') && <button type="button" onClick={promptInstall}>Install</button>}
          <Link to='/logout'>Logout</Link>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}