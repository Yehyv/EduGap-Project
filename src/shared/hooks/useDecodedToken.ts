import { jwtDecode } from "jwt-decode";

const useDecodedToken = (token) => {
  const decoded = jwtDecode(token);
  return {
    userRole: decoded?.role,
    instituteId: decoded?.instituteId,
  };
};

export default useDecodedToken;
