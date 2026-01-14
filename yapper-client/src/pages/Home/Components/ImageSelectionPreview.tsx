import { IoIosCloseCircle } from "react-icons/io";



const ImageSelectionPreview = ({imageUrl, imageUrls, setImageFiles, setImageFileUrls}:{imageUrl:string, imageUrls:string[], setImageFiles:React.Dispatch<React.SetStateAction<File[]>>, setImageFileUrls:React.Dispatch<React.SetStateAction<string[]>>}) => {


    const handleRemoveImage = () => {

        const indexToRemove = imageUrls.findIndex((url) => url === imageUrl)

        setImageFileUrls(prev => prev.filter(url => url !== imageUrl))

        setImageFiles(prev => {
            const newFiles = [...prev]
            newFiles.splice(indexToRemove, 1)
            return newFiles

        })



    }

    return (
        <div className="image-selection-preview">

            <IoIosCloseCircle onClick={() => handleRemoveImage()} className="close-image-preview"></IoIosCloseCircle>

            <img src={imageUrl} style={{borderRadius:'5px'}}></img>
        </div>
    )
}

export default ImageSelectionPreview