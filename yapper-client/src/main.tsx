import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Home from './pages/Home.tsx'
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from 'react-router'
import AuthProvider from './providers/AuthProvider.tsx'


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Home/>} />
  )
)


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
