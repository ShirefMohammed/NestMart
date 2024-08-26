import { useRef } from "react";

import uploadMultipleImages from "../assets/uploadMultipleImages.svg";
import { useNotify } from "../hooks";

const MultiImagesUpload = ({ selectedFiles, setSelectedFiles }) => {
  const fileInputRef = useRef(null);
  const acceptedFileExtensions = ["jpg", "png", "jpeg", "jfif"];
  const acceptedFileTypesString = acceptedFileExtensions.map((ext) => `.${ext}`).join(",");
  const notify = useNotify();

  const handleFileChange = (event) => {
    const newFilesArray = Array.from(event.target.files);
    processFiles(newFilesArray);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const processFiles = (filesArray) => {
    const newSelectedFiles = [...selectedFiles];

    let hasError = false;

    const fileTypeRegex = new RegExp(acceptedFileExtensions.join("|"), "i");

    filesArray.forEach((file) => {
      if (newSelectedFiles.some((f) => f.name === file.name)) {
        notify("info", "File names must be unique");
        hasError = true;
      } else if (!fileTypeRegex.test(file.name.split(".").pop())) {
        notify("info", `Only ${acceptedFileExtensions.join(", ")} files are allowed`);
        hasError = true;
      } else {
        newSelectedFiles.push(file);
      }
    });

    if (!hasError) {
      setSelectedFiles(newSelectedFiles);
    }
  };

  const handleCustomButtonClick = () => {
    // Trigger the click event of the hidden file input
    fileInputRef.current.click();
  };

  const handleFileDelete = (index) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
  };

  return (
    <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
      <div className="flex flex-col gap-4">
        <div
          className="min-h-55 border-2 border-dashed border-blue-500 bg-transparent rounded-lg p-4 flex flex-col justify-center items-center space-y-4"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e)}
        >
          <img src={uploadMultipleImages} alt="Upload Icon" className="w-24 h-24 mb-2" />

          <p className="font-semibold">Drag and Drop the files</p>

          <p className="font-bold">or</p>

          <button
            type="button"
            onClick={handleCustomButtonClick}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
          >
            Upload Files
          </button>

          <input
            type="file"
            id="files"
            name="files"
            multiple
            accept={acceptedFileTypesString}
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            onClick={(event) => {
              // Reset the input value to allow selecting the same file again
              event.target.value = null;
            }}
          />
        </div>

        <div className="border-gray-300 rounded-lg max-h-[23rem] overflow-auto border-[1.5px] border-stroke bg-transparent py-3 px-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
          {selectedFiles.length > 0 ? (
            <ul className="px-4">
              {selectedFiles.map((file, index) => (
                <li key={file.name} className="flex justify-between items-center border-b py-2">
                  <div className="flex items-center">
                    <img src={URL.createObjectURL(file)} alt={file.name} className="w-8 h-8 mr-2" />
                    <span className="text-base truncate max-w-[150px]">{file.name}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFileDelete(index)}
                    className="text-red-500 hover:text-red-700 focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="w-6 h-6"
                    >
                      <path stroke="currentColor" strokeWidth="2" d="M6 4l8 8M14 4l-8 8" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="h-full flex justify-center items-center">
              <p className="font-semibold text-gray-500 text-center">No Files Uploaded Yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiImagesUpload;
