import AppRouter from './router'

// Si usas Redux añade: import { Provider } from 'react-redux'
// Si usas React Query añade: import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// const queryClient = new QueryClient()

export default function Providers() {
  return (
    // <Provider store={store}>
    //   <QueryClientProvider client={queryClient}>
        <AppRouter />
    //   </QueryClientProvider>
    // </Provider>
  )
}
