import React from "react"
import ReactDOM from "react-dom/client"
import { HelmetProvider } from "react-helmet-async"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import App from "./App.jsx"
import "./styles/3dops.css"
import Home from "./pages/Home.jsx"
import Services from "./pages/Services.jsx"
import Manufacturing from "./pages/Manufacturing.jsx"
import Engineering from "./pages/Engineering.jsx"
import Software from "./pages/Software.jsx"
import Fulfillment from "./pages/Fulfillment.jsx"
import About from "./pages/About.jsx"
import Team from "./pages/Team.jsx"
import Contact from "./pages/Contact.jsx"
import NotFound from "./pages/NotFound.jsx"

const router = createBrowserRouter(
  [
    { path: "/", element: <App />, children: [
      { index: true, element: <Home /> },
      { path: "services", element: <Services /> },
      { path: "manufacturing", element: <Manufacturing /> },
      { path: "engineering", element: <Engineering /> },
      { path: "software", element: <Software /> },
      { path: "fulfillment", element: <Fulfillment /> },
      { path: "about", element: <About /> },
      { path: "team", element: <Team /> },
      { path: "contact", element: <Contact /> },
      { path: "*", element: <NotFound /> }
    ]}
  ],
  { basename: import.meta.env.BASE_URL }
)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </React.StrictMode>
)