"use client"
import { Button } from '@/components/ui/button'
import { db } from '@/utils/db'
import { MockInterview } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import { Lightbulb, WebcamIcon } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam'

function Interview({params}) {

    const [interviewData,setInterviewData]=useState();
    const [webCamEnabled,setWebCamEnabled]=useState(false);
    useEffect(()=>{
        console.log(params.interviewID)
        GetInterviewDetails();
    },[])
    
    /**
     * Used to get Interview Detail by MockId/Interview Id
     */
    const GetInterviewDetails=async()=>{
        const result=await db.select().from(MockInterview)
        .where(eq(MockInterview.mockId,params.interviewID))

        setInterviewData(result[0]);
    }
  return (
    <div className='my-10 '>
        <h2 className='font-bold text-2xl'>Let's Get Started</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
        
            <div className='flex flex-col my-5 gap-5'>
            <div className='flex flex-col my-5 gap-5 p-5 rounded-lg border'>
            <h2 className='text-lg'><strong>Job Role/Job Position: </strong> 
                    {interviewData?.jobPosition || 'Not Available'}</h2>
                <h2 className='text-lg'><strong>Job Description/Tech Stack: </strong> 
                    {interviewData?.jobDesc || 'Not Available'}</h2>
                <h2 className='text-lg'><strong>Years of Experience: </strong> 
                    {interviewData?.jobExperience || 'Not Available'}</h2>
            </div>
            <div className='p-5 border rounded-lg border-blue-300 bg-blue-100'>
                <h2 className='flex gap-2 items-center text-blue-500'> <Lightbulb /><strong>Information</strong></h2>
                <h2 className='mt-3 text-blue-500'>{process.env.NEXT_PUBLIC_INFORMATION}</h2>
            </div>   
            </div>
            <div>
            {webCamEnabled? <Webcam 
            onUserMedia={()=>setWebCamEnabled(true)}
            onUserMediaError={()=>setWebCamEnabled(false)}
            mirrored={true}
            style={{
                height:300,
                width:300
            }}
            />
            :
            <>
            <WebcamIcon className='h-72 w-full my-7 p-20 bg-secondary rounded-lg border'/>
            <Button /* variant="ghost" */ className="w-full" onClick={()=>setWebCamEnabled(true)}>Enabled Web Cam and microphone</Button>
            </>
            }
            </div>
        </div>
        
        <div className='flex justify-end items-end'>
            <Link href={'/dashboard/interview/'+params.interviewID+'/start'}>
                <Button >Start Interview</Button>
            </Link>
        </div>         
    </div>   
  )
}

export default Interview