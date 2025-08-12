import React from "react"
import ReactDOM from "react-dom/client"
import { HelmetProvider } from "react-helmet-async"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import App from "./App.jsx"
import "./styles/3dops.css"
import Home from "./pages/Home.jsx"
import Services from "./pages/Services.jsx"
import About from "./pages/About.jsx"
import Contact from "./pages/Contact.jsx"
import Work from "./pages/Work.jsx"
import NotFound from "./pages/NotFound.jsx"

const router = createBrowserRouter([
  { path: "/", element: <App />, children: [
    { index: true, element: <Home /> },
    { path: "services", element: <Services /> },
    { path: "work", element: <Work /> },
    { path: "about", element: <About /> },
    { path: "contact", element: <Contact /> },
    { path: "*", element: <NotFound /> }
  ]}
], { basename: import.meta.env.BASE_URL })

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </React.StrictMode>
)
