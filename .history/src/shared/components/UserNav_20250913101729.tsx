import { logoutUser } from "@/features/auth";
import { useAuth } from "@/features/auth/context/AuthContext";

const UserNav = () => {
  const { logout } = useAuth();
  const handleLogOut = () => {
    logoutUser()
      .then(() => {
        logout();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <p className="text-lg">
        <span>اهلا بك.</span>
        <span>محمد عبدالسلام محمد</span>
      </p>
      <button onClick={handleLogOut} className="text-red-500 cursor-pointer">
        تسجيل الخروج
      </button>
    </>
  );
};

export default UserNav;
