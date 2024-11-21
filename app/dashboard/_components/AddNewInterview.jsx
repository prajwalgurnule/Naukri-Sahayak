"use client"
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { chatSession } from '@/utils/GeminiAIModel';
import { LoaderCircle } from 'lucide-react';
import { db } from '@/utils/db';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs';
import moment from 'moment';
import { MockInterview } from '@/utils/schema';
import { useRouter } from 'next/navigation';

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition,setJobPosition]=useState();
  const [jobDesc,setJobDesc]=useState();
  const [jobExperience,setJobExperienc]=useState();
  const [loading,setLoading]=useState(false);
  const [JsonResponse,setJsonResponse]=useState([]);
  const router=useRouter();
  const {user} = useUser();
  
  const onSubmit=async(e)=> {
    setLoading(true)
    e.preventDefault()
    console.log(jobPosition,jobDesc,jobExperience);
    //const InputPrompt="Job position: "+jobPosition+", Job Description: "+jobDesc+", Years of Experience : "+jobExperience+" , Depends on Job Position, Job Description & Years of Experiance give us "+process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT+" interview question along with Answer in JSON format, Give us question and answer field on JSON"
    // const result = await chatSession.sendMessage(InputPrompt);
    const InputPromt = "Job position: "+jobPosition+", Job Description: "+jobDesc+", Years of Experience : "+jobExperience+" , Depends on Job Position, Job Description & Years of Experiance give us "+process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT+" interview question along with Answer in JSON format, Give us question and answer field on JSON";
    const result = await chatSession.sendMessage(InputPromt);
    const MockJsonResp = result.response
      .text()
      .replace("```json", "")
      .replace("```", "");
    //console.log(JSON.parse(MockJsonResp))
    setJsonResponse(MockJsonResp);
    if(MockJsonResp){
    const resp=await db.insert(MockInterview).values({
      mockId: uuidv4(),
      jsonMockResp: MockJsonResp,
      jobPosition: jobPosition,
      jobDesc: jobDesc,
      jobExperience: jobExperience,
      createdBy: user?.primaryEmailAddress?.emailAddress,
      createdAt: moment().format("DD-MM-yyyy"),
    }).returning({mockId:MockInterview.mockId})
    console.log("Insert ID:", resp)
    if(resp)
    {
      setOpenDialog(false);
      router.push('/dashboard/interview/'+resp[0]?.mockId)
    }
    setLoading(false);
  }
  else{
    console.log("ERROR")
   }
  }
  return (
    <div>
      <div
        className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all'
        onClick={() => setOpenDialog(true)}>
        <h2 className='text-lg text-center'>+ Add New</h2>
      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader >
            <DialogTitle className='text-2xl' >Tell us more about your job Interviewing</DialogTitle>
            <DialogDescription>
              <form onSubmit={onSubmit}>
              <div>
                <h2>Add Details about your Job Position/Role, Job Description and years of experience</h2>
                <div className='mt-7 my-2'>
                  <label>Job Role/Job Position</label>
                  <Input placeholder="Ex. Machine Learning Engineer" required
                  onChange={(event)=>setJobPosition(event.target.value)}
                  />
                </div>
                <div className=' my-3'>
                  <label>Job Description/ Tech Stack (In Short)</label>
                  <Textarea placeholder="Ex. Python"  required 
                  onChange={(event)=>setJobDesc(event.target.value)}
                  />
                </div>
                <div className=' my-3'>
                  <label>Years of experience</label>
                  <Input placeholder="Ex. 1" type="number"  max="50" min="0" required 
                  onChange={(event)=>setJobExperienc(event.target.value)}
                  />
                </div>
              </div>
              <div className='flex gap-5 justify-end'>
                <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={loading} >
                  {loading?
                  <>
                  <LoaderCircle className='animate-spin' /> Generating from AI
                  </>: 'Start Interview'
                }
                  </Button>
              </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default AddNewInterview