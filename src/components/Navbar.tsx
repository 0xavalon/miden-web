import { Icons } from "./icons";

interface NavbarProps {
  companyName: string;
  totalRecipients: number;
}

const Navbar = ({ companyName, totalRecipients }: NavbarProps) => {
    if(!companyName) companyName = "Company XYZ";
    if(!totalRecipients) totalRecipients = 0;

  return (
    <div className="w-full flex items-center justify-between gap-3 p-4">
      {/* Company Info */}
      <div className="flex items-center justify-between gap-3">
        <div className="h-14 w-14 rounded-full bg-black text-white flex items-center justify-center">
          <span className="text-2xl font-semibold">
            {companyName.charAt(0).toUpperCase()}
          </span>
        </div>
        <h1 className="font-inter text-2xl font-bold text-black">
          {companyName}
        </h1>
      </div>

      {/* Recipients and Button */}
      <div className="flex items-center justify-between gap-3">
        <div className="border-2 border-[#F2F2F2] rounded-[64px] inline-flex items-center px-6 py-3">
          <Icons.people className="h-7" />
          <span className="font-semibold text-base text-black ml-3">
            {totalRecipients}
          </span>
        </div>
        <button className="text-white bg-[#0B3CEB] text-base font-semibold px-6 py-4 rounded-[64px]">
          Export account
        </button>
      </div>
    </div>
  );
};

export default Navbar;