import profileImage from "@/assets/imgs/ForDev/Person.jpg";
const MyProfile = () => {
  return (
    <div className="flex">
      <div>
        <img src={profileImage}></img>
      </div>
      <div>
        <h4>محمد عبد السلام </h4>
        <p>باحث وخبير في التسويق بإستخدام الذكاء الاصطناعي</p>
      </div>
    </div>
  );
};

export default MyProfile;
