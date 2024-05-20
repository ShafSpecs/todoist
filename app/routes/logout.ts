import { EnhancedCache, Logger, WorkerLoadContext, WorkerLoaderArgs } from '@remix-pwa/sw';
import { BackgroundSyncQueue } from "@remix-pwa/sync"
import { LoaderFunctionArgs } from "@remix-run/node"
import { logout } from "~/.server/auth"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  throw await logout(request)
}

type ExtendedContext = WorkerLoadContext & { 
  logger: Logger,
  queue: BackgroundSyncQueue
  documentCache: EnhancedCache,
  dataCache: EnhancedCache,
}

export const workerLoader = async ({ context }: WorkerLoaderArgs) => {
  const { fetchFromServer, documentCache, dataCache } = context as ExtendedContext

  // EnhancedCache.purgeCache(documentCache, ({ request, response }) => {
  //   if (response?.status === 200) {
  //     return true
  //   }

  //   return false
  // })
  // EnhancedCache.purgeCache(dataCache, ({ request, response }) => {
  //   const url = new URL(request.url)
  //   const params = new URLSearchParams(url.searchParams)

  //   if (params.has('_data') && params.get('_data')?.includes('_todos')) {
  //     return true
  //   }

  //   return false
  // })

  return await fetchFromServer()
}