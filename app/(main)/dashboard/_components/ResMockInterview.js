"use client";

import React, { useContext, useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { ExpertName } from "@/services/options";
import { useFilePicker } from "use-file-picker";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { UserContext } from "@/app/_context/UserContext";
import { Loader } from "lucide-react";

const ResumeMockInterviewDialog = ({ children }) => {
  const [selectedExpert, setSelectedExpert] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [resumeData, setResumeData] = useState("")

  const { openFilePicker, filesContent, loading: fileLoading } = useFilePicker({
    accept: [".txt", ".pdf", ".docx"],
  });

  const createResumeBasedDiscussionRoom = useMutation(api.ResumeBasedDiscussionRoom.createNewRoom);
  const router = useRouter();
  const { userData } = useContext(UserContext);
  const FREE_CREDIT_LIMIT = 5000;

  // Load resume content into state when file is picked
  useEffect(() => {
    if (filesContent.length > 0) {
      setResumeText(filesContent[0].name);
      setResumeData(filesContent[0].content)
    }
    
  }, [filesContent]);
  

  const onClickNext = async () => {
    const isPaidUser = Boolean(userData?.subscriptionId);
    const maxCredits = isPaidUser ? 50000 : FREE_CREDIT_LIMIT;
    const creditsRemaining = userData?.credits || 0;

    if (creditsRemaining <= 0) {
      alert("You’ve used all your tokens. Please upgrade to continue.");
      router.push("/dashboard");
      return;
    }

    try {
      setLoading(true);
      const result = await createResumeBasedDiscussionRoom({
        topic: resumeText,
        coachingOption: "Resume Based Interview",
        expertName: selectedExpert,
        uid: userData?._id,
        data: resumeData || {},
      });

      setOpenDialog(false);
      router.push("/resumeBasedInterview/" + result);
      setLoading(false);
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resume-Based Mock Interview</DialogTitle>
          <DialogDescription>
            Upload your resume and choose an AI interviewer.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Upload Resume */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload Resume:</label><br/>
            <p className="text-gray-600 text-sm">only .pdf </p>
            <Button onClick={openFilePicker} disabled={fileLoading} className="cursor-pointer my-3">
              {fileLoading ? "Loading..." : "Select File"}
            </Button>
            {filesContent.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {filesContent[0].name}
              </p>
            )}
          </div>

          {/* Choose AI Expert */}
          <div className="space-y-2">
            Choose an AI interviewer:
            <div className="grid grid-cols-3 gap-2">
              {ExpertName.map((expert, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedExpert(expert.name)}
                  className="cursor-pointer text-center"
                >
                  <Image
                    src={expert.image}
                    alt="img"
                    height={80}
                    width={80}
                    className={`rounded-full mx-auto hover:border-2 ${
                      selectedExpert === expert.name
                        ? "border-4 border-blue-500"
                        : ""
                    }`}
                  />
                  <p className="text-sm mt-1">{expert.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-2">
            <DialogClose asChild>
              <Button variant={"ghost"} className="cursor-pointer">Cancel</Button>
            </DialogClose>
            <Button
              disabled={!resumeText || !selectedExpert || loading} className="cursor-pointer"
              onClick={onClickNext}
            >
              {loading && <Loader className="animate-spin mr-2" />}
              Next
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeMockInterviewDialog;
