"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ExpertName } from "@/services/options";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";

const UserImputDial = ({ children, coachingOpt }) => {
  const [selectedExpert, setSelectedExpert] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const createDiscussionRoom = useMutation(api.DiscussionRoom.createNewRoom);
  const router = useRouter();

  const onClickNext = async () => {
    try {
      setLoading(true);
      const result = await createDiscussionRoom({
        topic: topic,
        coachingOption: coachingOpt.name,
        expertName: selectedExpert,
      });
      console.log(result);
      setLoading(false);
      setOpenDialog(false);
      router.push('/discussionRoom/'+ result)
    } catch (error) {
      console.error("Error occured:", error);
    }
  };
  return (
    <Dialog open = {openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a session with {coachingOpt.name}</DialogTitle>
          <DialogDescription>
            Choose a topic to discuss with this expert. The AI will guide you
            through the conversation.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <img
                src={coachingOpt.image}
                alt={coachingOpt.name}
                className="h-12 w-12 rounded-full"
              />
            </div>
            <div>
              <h4 className="font-medium">{coachingOpt.name}</h4>
              <p className="text-sm text-gray-500">
                {coachingOpt.specialty || "Expert"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Enter a topic:</label>
            <Textarea
              placeholder="Enter your topic here"
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            Choose a AI agent:
            <div className="grid grid-cols-3">
              {ExpertName.map((expert, index) => (
                <div key={index} onClick={() => setSelectedExpert(expert.name)}>
                  <Image
                    src={expert.image}
                    alt="img"
                    height={"80"}
                    width={80}
                    className="rounded-4xl cover"
                  />
                  <p>{expert.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between  py-2 rounded-md">
            <DialogClose asChild>
              <Button variant={"ghost"}>Cancel</Button>
            </DialogClose>
            <Button
              disabled={!topic || !selectedExpert || loading}
              onClick={onClickNext}
            >
              {loading && <Loader className="animate-spin" />}Next
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserImputDial;
