import { ToastOptions, toast } from "react-toastify";

const useNotify = () => {
  const toastOptions: ToastOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  };

  const notify = (status: string, message: string) => {
    if (status === "success") {
      toast.success(message, toastOptions);
    } else if (status === "info") {
      toast.info(message, toastOptions);
    } else if (status === "error") {
      toast.error(message, toastOptions);
    } else {
      toast(message, toastOptions);
    }
  };

  return notify;
};

export default useNotify;
