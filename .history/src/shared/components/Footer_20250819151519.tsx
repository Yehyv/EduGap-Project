const Footer = () => {
  return (
    <footer className="bg-gray-100 p-4 text-center text-sm text-gray-600">
      © {new Date().getFullYear()} My App. All rights reserved.
      <InnovaLogo className="w-32 absolute" />
    </footer>
  );
};

export default Footer;
