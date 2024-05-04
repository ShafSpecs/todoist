import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { getUserId } from "~/.server/auth";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUserId(request)

  if (user) {
    throw redirect('/todos')
  }

  return null;
}

export default function Component() {
  return <Outlet />
}