import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/solid-router';
import { TanStackRouterDevtools } from '@tanstack/solid-router-devtools';

import { HydrationScript } from 'solid-js/web';

import Header from '../components/Header';

import styleCss from '../styles.css?url';

export const Route = createRootRouteWithContext()({
  head: () => ({
    links: [{ rel: 'stylesheet', href: styleCss }],
  }),
  shellComponent: RootComponent,
})

function RootComponent() {
  return (
    <html>
      <head>
        <HydrationScript />
      </head>
      <body>
        <HeadContent />
        <Header />

        <Outlet />
        <TanStackRouterDevtools />
        <Scripts />
      </body>
    </html>
  )
}
