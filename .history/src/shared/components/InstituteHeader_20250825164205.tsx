import HIMSLogo from "@/assets/imgs/ForDev/HIMSLogo.png";
const InstituteHeader = () => {
  return (
    <div className="p-2 bg-gradient-to-r from-header-gradient-start to-header-gradient-end">
      <h4 className="text-center">المعهد العالي للعلوم الإدارية - القطامية</h4>
      <img src={HIMSLogo} className="w-20"></img>
    </div>
  );
};

export default InstituteHeader;
