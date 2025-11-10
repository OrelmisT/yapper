import { createContext } from "react";

const HomeViewContext = createContext<{view:number, setView: (view:number) => void}>(
    {
        view: 0,
        setView: () => {}
    }
)

export default HomeViewContext
