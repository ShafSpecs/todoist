import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { ZodError } from "zod";
import { AuthFormSchema, createUserSession, login } from "~/.server/auth";

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData()
  const fields = Object.fromEntries(form)

  try {
    const { password, username } = AuthFormSchema.parse(fields)
    const user = await login({ password, username })

    if (!user) {
      return json({
        error: 'Invalid username or password'
      })
    }

    return createUserSession(user.id, '/todos')
  } catch (e) {
    return json({
      error: (e as ZodError).issues[0].message
    })
  }
}

export default function Component() {
  const data = useActionData<typeof action>()

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h3>Login</h3>
        {data && <p className={`error-card ${data.error ? 'error-show' : ''}`}>
          {data.error}
        </p>}
        <Form className="auth-form" method="POST">
          <input type="text" name="username" placeholder="Username" />
          <input type="password" name="password" placeholder="Password" />
          <button>Login</button>
        </Form>
        <p>Don&apos;t have an account? <Link to='/register'>Create account</Link></p>
      </div>
    </div>
  );
}