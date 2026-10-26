import {useCallback, useRef, useState} from "react";

const useFetch = (cb, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const callbackRef = useRef(cb);
  const optionsRef = useRef(options);
  const requestRef = useRef(0);

  callbackRef.current = cb;
  optionsRef.current = options;

  const fn = useCallback(async (...args) => {
    const requestId = ++requestRef.current;
    setLoading(true);
    setData(null);
    setError(null);
    try {
      const response = await callbackRef.current(optionsRef.current, ...args);
      if (requestId === requestRef.current) {
        setData(response);
        setError(null);
      }
      return response;
    } catch (error) {
      if (requestId === requestRef.current) setError(error);
      return undefined;
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, []);

  return {data, loading, error, fn};
};

export default useFetch;
