import { useState, useEffect } from "react";
import Loader from "@/shared/components/Loader";

function withLoader<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  // Return a new component that keeps the props
  const ComponentWithLoader = (props: P) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }, []);

    if (isLoading) return <Loader />;
    return <WrappedComponent {...props} />;
  };

  // ✅ preserve component name in React DevTools
  ComponentWithLoader.displayName = `withLoader(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return ComponentWithLoader;
}

export default withLoader;
