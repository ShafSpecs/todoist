import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { ZodError } from "zod";
import { AuthFormSchema, createUserSession, register } from "~/.server/auth";

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData()
  const fields = Object.fromEntries(form)

  try {
    const { password, username } = AuthFormSchema.parse(fields)
    const { id } = await register({ password, username })
    return createUserSession(id, '/todos')
  } catch (e) {
    console.log(e)
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
        <h3>Register</h3>
        {data && <p className={`error-card ${data.error ? 'error-show' : ''}`}>
          {data.error}
        </p>}
        <Form className="auth-form" method="POST">
          <input type="text" name="username" placeholder="Username" />
          <input type="password" name="password" placeholder="Password" />
          <button>Create Account</button>
        </Form>
        <p>Already have an account? <Link to='/login'>Login</Link></p>
      </div>
    </div>
  );
}