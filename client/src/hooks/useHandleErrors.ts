import { useLocation, useNavigate } from "react-router-dom";

interface AxiosError extends Error {
  response?: any;
}

const useHandleErrors = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNoServerResponse = (err: AxiosError) => {
    if (!err?.response) {
      navigate("/noServerResponse", {
        state: { from: location },
        replace: true,
      });
    }
  };

  const handleServerError = (err: AxiosError) => {
    if (err?.response?.status === 500) {
      navigate("/serverError", { state: { from: location }, replace: true });
    }
  };

  const handleUnauthorized = (err: AxiosError) => {
    if (err?.response?.status === 401) {
      navigate("/unauthorized", { state: { from: location }, replace: true });
    }
  };

  const handleForbidden = (err: AxiosError) => {
    if (err?.response?.status === 403) {
      navigate("/forbidden", { state: { from: location }, replace: true });
    }
  };

  const handleNoResourceFound = (err: AxiosError) => {
    if (err?.response?.status === 404) {
      navigate("/noResourceFound", {
        state: { from: location },
        replace: true,
      });
    }
  };

  const handleErrors = (err: AxiosError) => {
    handleNoServerResponse(err);
    handleServerError(err);
    handleUnauthorized(err);
    handleForbidden(err);
    handleNoResourceFound(err);
  };

  return handleErrors;
};

export default useHandleErrors;
