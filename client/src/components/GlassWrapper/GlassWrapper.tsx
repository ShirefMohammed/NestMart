import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const GlassWrapper = ({ setOpenGlassWrapper, children }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-999999 w-full h-full p-5">
      <div className="absolute inset-0" onClick={() => setOpenGlassWrapper(false)}></div>

      <button
        type="button"
        className="absolute top-4 right-4 text-red-500 bg-black bg-opacity-85 rounded-full w-8 h-8 hover:bg-opacity-100 transition z-20"
        onClick={() => setOpenGlassWrapper(false)}
      >
        <FontAwesomeIcon icon={faX} />
      </button>

      <div className="relative z-10 h-full overflow-auto">{children}</div>
    </div>
  );
};

export default GlassWrapper;
