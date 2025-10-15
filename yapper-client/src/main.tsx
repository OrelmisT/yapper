import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Home from './pages/Home.tsx'
import Login from './pages/Login.tsx'
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from 'react-router'
import AuthProvider from './providers/AuthProvider.tsx'
import './styles/main.css'
import Signup from './pages/Signup.tsx'
import NavLayout from './components/NavLayout.tsx'


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
    <Route element={<NavLayout/>}>
      <Route path='/' element={<Home/>} />
    </Route>
    <Route path='/login' element={<Login/>} />
    <Route path='/signup' element={<Signup/>} />
    </>
  )
)


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
