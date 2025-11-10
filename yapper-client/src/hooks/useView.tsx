import { useContext } from "react"
import HomeViewContext from "../contexts/HomeViewContext"

const useView = () => {

    return useContext(HomeViewContext)
}
export default useView