import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import MenuView from "./views/MenuView";

export default function App() {

    const browserRouter = createBrowserRouter(
        createRoutesFromElements(
            <Route>
                <Route element={<MainLayout/>}>
                    <Route index element={<MenuView/>}/>
                </Route>
            </Route>
        )
    );
    
    return (
        <RouterProvider router={browserRouter}/>
    );
}