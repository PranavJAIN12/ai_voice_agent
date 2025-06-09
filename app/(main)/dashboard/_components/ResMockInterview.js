import { useFilePicker } from "use-file-picker";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const ResMockInterview = () => {
  const { openFilePicker, filesContent, loading } = useFilePicker({
    accept: ['.txt', '.pdf', '.docx']
  });

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>
            📄 Resume-Based Mock Interview
            <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-400 text-black rounded-full">
              New
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Upload your resume and get personalized AI interview questions based
            on it.
          </p>
          {/* <Link href="/mock-interview/resume"> */}
            <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer" onClick={() => openFilePicker()}>
              Try Now
            </button>
            <div>

            {filesContent.map((file,index)=>(
              <div key={index}>
                <h3 className="mt-3">{file.name}</h3>
                {/* <div key={index}>{file.content}</div> */}
              </div>
            ))}
            </div>
          {/* </Link> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResMockInterview;
