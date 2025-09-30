import profileImage from "@/assets/imgs/ForDev/Person.jpg";
const MyProfile = () => {
  return (
    <div className="flex gap-6">
      <div className="w-1/4">
        <img src={profileImage}></img>
      </div>
      <div>
        <h4>محمد عبد السلام </h4>
        <p>باحث وخبير في التسويق بإستخدام الذكاء الاصطناعي</p>
        <p>
          يقوم بدور مهم في الشرق الأوسط، من خلال رصد وتحليل الاتجاهات المختلفة
          في مجالات الأعمال التجارية والمشروعات الناشئة والسفر والإعلام. وقد
          شارك فادي في دورات تدريبية ومؤتمرات دولية في مصر، وتونس، والمملكة
          العربية السعودية، والكويت، وكينيا، وإيطاليا، وغيرها من الدول المزيد...
        </p>
      </div>
    </div>
  );
};

export default MyProfile;
