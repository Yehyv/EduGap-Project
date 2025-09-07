import { useState, useEffect } from "react";
import { Loader } from "../components";

const withLoader = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return (props: P) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      setIsLoading(false);
    }, []);

    if (isLoading) return <Loader />;
    return <WrappedComponent {...props} />;
  };
};

export default withLoader;
