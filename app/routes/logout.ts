import { LoaderFunctionArgs } from "@remix-run/node"
import { logout } from "~/.server/auth"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  throw await logout(request)
}