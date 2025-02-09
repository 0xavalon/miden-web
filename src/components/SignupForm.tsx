import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Icons } from "./icons";

// Define validation schema
const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  companyName: z
    .string()
    .min(3, "Company name must be at least 3 characters")
    .max(50, "Company name must be at most 50 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").max(50),
});

interface SignupFormProps {
  onSubmit: (email: string, companyName: string, password: string) => void;
  onBack: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSubmit, onBack }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onFormSubmit = (data: any) => {
    onSubmit(data.email, data.companyName, data.password);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* Back Button and Title */}
      <div className="flex items-center bg-white rounded-full shadow-md pr-8 p-3 w-[420px]">
        <button onClick={onBack} className="p-2">
          <Icons.arrowLeft className="h-5 w-5" />
        </button>
        <h2 className="flex-grow text-[#151515] text-center text-base font-semibold">
          Enter details
        </h2>
      </div>

      {/* Form Container */}
      <div className="bg-white p-6 rounded-2xl shadow-md w-[420px] mt-6">
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="w-full flex flex-col gap-4"
        >
          <div>
            <label className="block text-gray-600 text-base font-medium">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="Enter email address"
              className="w-full p-3 border-2 border-[#F2F2F2] rounded-full mt-1 outline-none focus:border-[#1E1E1E]"
            />
            {errors.email?.message && (
              <p className="text-red-500 text-sm">
                {String(errors.email.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-600 font-medium">
              Company Name
            </label>
            <input
              {...register("companyName")}
              type="text"
              placeholder="Enter company name"
              className="w-full p-3 border-2 border-[#F2F2F2] rounded-full mt-1 outline-none focus:border-[#1E1E1E]"
            />
            {errors.companyName?.message && (
              <p className="text-red-500 text-sm">
                {String(errors.companyName.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-600 font-medium">Password</label>
            <input
              {...register("password")}
              type="password"
              placeholder="Enter password"
              className="w-full p-3 border-2 border-[#F2F2F2] rounded-full mt-1 outline-none focus:border-[#1E1E1E]"
            />
            {errors.email?.message && (
              <p className="text-red-500 text-sm">
                {String(errors.email.message)}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#0B3CEB] text-white font-medium py-3 rounded-full mt-4 hover:bg-blue-700 transition"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
