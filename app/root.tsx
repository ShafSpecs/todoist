import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { ManifestLink, useSWEffect } from "@remix-pwa/sw";

import "./styles/auth.css"
import "./styles/index.css"
import "./styles/todos.css"

export const meta = () => {
  return [
    { title: "Todoist" },
    {
      property: "og:title",
      content: "Todoist",
    },
    {
      name: "description",
      content: "A Remix Todo PWA. Quite a beautiful app",
    },
  ]
}

export function Layout({ children }: { children: React.ReactNode }) {
  useSWEffect()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#121212" />
        <meta name="apple-mobile-web-app-title" content="Todoist" />
        <meta name="application-name" content="Todoist" />
        <Meta />
        <ManifestLink manifestUrl="/manifest.webmanifest" />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
