const UserNav = ({ userName }: { userName: string }) => {
  return (
    <div>
      <p>
        <span>اهلا بك.</span>
        <span>{userName}</span>
      </p>
    </div>
  );
};

export default UserNav;
