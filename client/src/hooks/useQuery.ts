import React from "react";
import { useLocation } from "react-router-dom";

const useQuery = () => {
  const { search } = useLocation();

  return React.useMemo(() => {
    const params = new URLSearchParams(search);
    const queryObj: { [key: string]: string } = {};
    params.forEach((value, key) => {
      queryObj[key] = value;
    });
    return queryObj;
  }, [search]);
};

export default useQuery;
