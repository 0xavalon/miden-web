import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Icons } from "./icons";
import teamwork from "../assets/images/teamwork.png";
import {
  createMultipleNotes,
  createNote,
  exportNote,
  getAccountsFromDb,
  getBalance,
  sleep,
  syncClient,
} from "../utils";

const recipientSchema = z.object({
  username: z.string().min(1, "Username is required"),
  amount: z
    .number({ required_error: "Amount is required" })
    .min(1, "Amount must be greater than 0"),
});
const formSchema = z.object({
  recipients: z.array(recipientSchema),
});

type FormSchema = z.infer<typeof formSchema>;

type SendProps = {
  onClose: () => void;
};

const Send = ({ onClose }: SendProps) => {
  const [accountId, setAccountId] = useState("");
  const [balance, setBalance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [noteResults, setNoteResults] = useState<
    { noteData: any; recipientId: string; filename: string }[]
  >([]);

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<FormSchema>({
    defaultValues: {
      recipients: [{ username: "", amount: undefined }],
    },
    resolver: zodResolver(formSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "recipients",
  });

  const createFile = async (
    recipient: { username: string; amount: number },
    index: number
  ) => {
    return {
      name: `December00${index + 1}.mno`,
      content: `Recipient: ${recipient.username}\nAmount: ${recipient.amount}`,
    };
  };

  const getExistingAccounts = async () => {
    try {
      const accounts = await getAccountsFromDb();

      if (accounts.length > 0) {
        const _id = accounts[0].id().to_string();
        const _balance = await getBalance(_id);
        setAccountId(accounts[0].id().to_string());
        setBalance(_balance || "");
      }
    } catch (error: any) {
      console.error("Error fetching existing accounts:", error.message);
    }
  };

  // Use useEffect to check for existing accounts when the component mounts
  useEffect(() => {
    getExistingAccounts();
  }, []);

  const downloadFile = (fileName: string, result: any) => {
    const byteArray = new Uint8Array(result);
    exportNote(byteArray, fileName);
  };

  const downloadAllFiles = () => {
    noteResults.forEach(({ filename, noteData }) => {
      downloadFile(filename, noteData);
    });
  };

  const onSubmit = async (data: FormSchema) => {
    if (!accountId || !Number(balance)) {
      console.log("account not valid or not enough balance");
    }
    setIsLoading(true);
    await sleep(100);
    await syncClient();
    const recipients: { username: string; amount: number }[] = data.recipients;
    
    // await createMultipleNotes(accountId, recipients);

    let _noteResults = [];
    for (let recipient of recipients) {
      const { username, amount } = recipient;
      const noteData = await createNote(accountId, username, String(amount));
      _noteResults.push({
        noteData,
        recipientId: username,
        filename: `${username}_${amount}.mno`,
      });
    }
    console.log(_noteResults);
    setNoteResults(_noteResults);

    // setFiles(generatedFiles);
    setIsLoading(false);

    // Clear the form and reset to default state
    reset({
      recipients: [{ username: "", amount: undefined }],
    });
  };

  return (
    <div className=" px-8 py-10 flex flex-col bg-white rounded-[32px] shadow-lg min-h-[430px] w-[433px]">
      {isLoading ? (
        <div className="flex flex-col  h-full">
          <h1 className="text-lg font-semibold text-start">Send</h1>
          <div className="mt-10 flex flex-col items-center justify-center">
            <img src={teamwork} alt="Importing..." className="w-40 h-40" />
            <p className="mt-4 text-lg font-semibold text-gray-600">
              Creating notes...
            </p>
          </div>
        </div>
      ) : noteResults.length > 0 ? (
        <div className="flex flex-col ">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">Files</h1>
            <button
              // onClick={() => setFiles([])}
              onClick={() => setNoteResults([])}
              className="text-gray-500 text-sm"
            >
              <Icons.close />
            </button>
          </div>
          <div className="space-y-4 min-h-[228px]">
            {noteResults.map(({ filename, noteData }, index) => (
              <div
                key={filename}
                className="flex items-center justify-between bg-yellow-100 p-4 rounded-lg"
              >
                <p className="font-semibold">For recipient {index + 1}</p>
                <div className="flex items-center space-x-4">
                  <span>{filename}</span>
                  <button
                    // onClick={() => downloadFile(file.name, file.content)}
                    onClick={() => downloadFile(filename, noteData)}
                    className="text-blue-600"
                  >
                    <Icons.arrowDownToLine />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={downloadAllFiles}
            className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-full font-semibold"
          >
            Download all
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="w-full flex flex-row items-center justify-between">
            <h1 className="text-xl font-bold">Send</h1>
            <button
              onClick={onClose}
              className=" text-gray-700 text-xl font-bold"
            >
              <Icons.close />
            </button>
          </div>

          <p className="text-gray-600">Enter username or wallet address</p>
          <div className="overflow-y-scroll max-h-[344px] pr-5">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-3 mt-6">
                <div>
                  <div className="flex items-center w-full justify-between mb-[6px]">
                    <label className="block text-sm font-medium">
                      Recipient {index + 1}
                    </label>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          remove(index);
                        }}
                      >
                        <Icons.circleMinus className="h-4" />
                      </button>
                    )}
                  </div>

                  <input
                    {...register(`recipients.${index}.username` as const)}
                    placeholder="Enter username"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-blue-500"
                  />
                  {errors.recipients?.[index]?.username && (
                    <p className="text-sm text-red-600">
                      {errors.recipients[index]?.username?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-[6px]">
                    Amount
                  </label>
                  <input
                    {...register(`recipients.${index}.amount` as const, {
                      valueAsNumber: true,
                    })}
                    type="number"
                    inputMode="decimal"
                    placeholder="Enter amount"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-blue-500"
                    min="0"
                    style={{
                      WebkitAppearance: "none",
                      MozAppearance: "textfield",
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e") {
                        e.preventDefault();
                      }
                    }}
                  />

                  {errors.recipients?.[index]?.amount && (
                    <p className="text-sm text-red-600">
                      {errors.recipients[index]?.amount?.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              append({ username: "", amount: 0 });
            }}
            className="text-blue-600 flex items-center space-x-1 mt-4"
          >
            <span>+</span> <span>Add another recipient</span>
          </button>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-[#0b3ceb] text-white font-inter font-bold rounded-[48px] shadow-lg hover:bg-[#0b3ceb]/90 mt-8"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
};

export default Send;
