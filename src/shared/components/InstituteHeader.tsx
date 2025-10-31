import { useUser } from "@/features/auth/context/UserContext";
const InstituteHeader = () => {
  const { user } = useUser();
  return (
    <div className="p-4 bg-gradient-to-r from-header-gradient-start to-header-gradient-end">
      <div className="relative container">
        <img
          src={user?.logo}
          className="w-16 absolute left-4 top-1/2 -translate-y-1/2 max-sm:w-10"
        ></img>
        <h4 className="text-center text-[18px] max-md:text-sm max-w-2/3 mx-auto">
          {user?.instituteName}
        </h4>
      </div>
    </div>
  );
};

export default InstituteHeader;
