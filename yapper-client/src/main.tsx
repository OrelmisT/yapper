import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Home from './pages/Home/Home.tsx'
import Login from './pages/Login.tsx'
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from 'react-router'
import AuthProvider from './providers/AuthProvider.tsx'
import './styles/main.css'
import Signup from './pages/Signup.tsx'
import NavLayout from './components/NavLayout.tsx'
import Profile from './pages/Profile.tsx'
import FriendsProvider from './providers/FriendsProvider.tsx'
import ConversationsProvider from './providers/ConversationsProvider.tsx'
import HomeViewProvider from './providers/HomeViewProvider.tsx'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import SocketProvider from './providers/SocketProvider.tsx'



const queryClient = new QueryClient()


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
    <Route element={<NavLayout/>}>
      <Route path='/' element={
          <FriendsProvider>
            <ConversationsProvider>
              <HomeViewProvider>
                <QueryClientProvider client={queryClient}>
                  <SocketProvider>
                     <Home/>
                  </SocketProvider>
                </QueryClientProvider>
              </HomeViewProvider>
            </ConversationsProvider>
          </FriendsProvider> 
        } />
      <Route path='/account' element={<Profile/>} />
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
