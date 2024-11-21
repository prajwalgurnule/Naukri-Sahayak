

// -----------------------------------------------------------------------------------------------
// Dont Touch this video vala code 
"use client";
import Image from "next/image";
import Webcam from "react-webcam";
import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, StopCircle } from "lucide-react";
import { toast } from "sonner";
import useSpeechToText from "react-hook-speech-to-text";
import { chatSession } from "@/utils/GeminiAIModel";
import { UserAnswer } from "@/utils/schema";
import moment from "moment";
import { useUser } from "@clerk/nextjs";
import { db } from "@/utils/db";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";

function RecordAnswerSection({ activeQuestionIndex, mockInterViewQuestion, interviewData }) {
  const [userAnswer, setUserAnswer] = useState('');
  const [overallRating, setOverallRating] = useState(0); // Track overall rating
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false); // To prevent double submissions
  const [model, setModel] = useState(null);
  const [isLooking, setIsLooking] = useState(true);
  const [confidence, setConfidence] = useState(100);
  const [lookAwayCount, setLookAwayCount] = useState(0);

  const penaltyFactor = 2;
  const recoveryRate = 0.3;
  const maxConfidence = 100;
  const minConfidence = 0;
  const webcamRef = useRef(null);

  const API_BASE_URL = "https://naukri-sahayak-portal-backend-4urm.onrender.com";

  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false
  });

  // Append results to userAnswer when results change
  useEffect(() => {
    results.map((result) => {
      setUserAnswer((prevAns) => prevAns + result?.transcript);
    });
  }, [results]);

  // Automatically submit when recording stops and answer is long enough
  useEffect(() => {
    if (!isRecording && userAnswer.length > 10 && !submitted) {
      UpdateUserAnswerInDb();
    }
  }, [isRecording, userAnswer, submitted]);

  // Confidence model
  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await blazeface.load();
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      detectFace();
    }, 500);
    return () => clearInterval(interval);
  }, [model]);

  // Start or Stop Recording based on current state
  const StartStopRecording = async () => {
    try {
      if (isRecording) {
        await stopSpeechToText();
      } else {
        await startSpeechToText();
        setSubmitted(false); // Reset submission state for new recording
      }
    } catch (error) {
      console.error("Error in Start/Stop Recording: ", error);
      toast.error("Something went wrong while starting/stopping recording.");
    }
  };

  const detectFace = async () => {
    if (webcamRef.current && model) {
      const video = webcamRef.current.video;
      const predictions = await model.estimateFaces(video, false);

      if (predictions.length > 0) {
        const face = predictions[0];
        const rightEye = face.landmarks[0];
        const leftEye = face.landmarks[1];

        const centerX = video.videoWidth / 2;
        const centerY = video.videoHeight / 2;
        const strictThresholdX = 0.13 * video.videoWidth;
        const strictThresholdY = 0.10 * video.videoHeight;

        const eyeCenterX = (rightEye[0] + leftEye[0]) / 2;
        const eyeCenterY = (rightEye[1] + leftEye[1]) / 2;

        if (Math.abs(eyeCenterX - centerX) > strictThresholdX || Math.abs(eyeCenterY - centerY) > strictThresholdY) {
          setIsLooking(false);
          setLookAwayCount(prev => prev + 1);
        } else {
          setIsLooking(true);
        }
      } else {
        setIsLooking(false);
      }
    }
  };

  useEffect(() => {
    const updateConfidence = () => {
      setConfidence(prev => {
        if (isLooking) {
          return Math.min(prev + recoveryRate, maxConfidence);
        } else {
          const adjustedPenalty = penaltyFactor;
          return Math.max(prev - adjustedPenalty, minConfidence);
        }
      });
    };

    const confidenceInterval = setInterval(updateConfidence, 500);
    return () => clearInterval(confidenceInterval);
  }, [isLooking, lookAwayCount]);

  // Submit the user's answer and get feedback
  const UpdateUserAnswerInDb = async () => {
    console.log(userAnswer)
    setLoading(true);
    const response = await fetch(`${API_BASE_URL}/api/generate-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        correctAnswer: mockInterViewQuestion[activeQuestionIndex]?.answer,
        userAnswer,
      }),
    });

    const feedback = await response.json();
    console.log(feedback);

    if (feedback.error) {
      toast('Error generating feedback');
      setLoading(false);
      return;
    }
    try {
      const feedbackPromt = `Question: ${mockInterViewQuestion[activeQuestionIndex]?.question}, User Answer: ${userAnswer}, depend on question and user answer for given interview question please give us rating for answer and feedback as area of improvement if any in just 3 to 5 lines to improve it in JSON format with rating and feedback fields.`;

      const result = await chatSession.sendMessage(feedbackPromt);
      const mockJsonResp = (await result.response.text()).replace("```json", "").replace("```", "");
      const JsonFeedbackResp = JSON.parse(mockJsonResp);

      const resp = await db.insert(UserAnswer).values({
        mockIdRef: interviewData?.mockId,
        question: mockInterViewQuestion[activeQuestionIndex]?.question,
        correctAns: mockInterViewQuestion[activeQuestionIndex]?.answer,
        userAns: userAnswer,
        feedback: JsonFeedbackResp?.feedback,
        rating: feedback?.rating,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format('DD-MM-yyyy')
      });

      // Update overall rating
    if (feedback?.rating) {
      setOverallRating((prevRating) => prevRating + parseFloat(feedback?.rating));
    }

    // If the user answered the last question, calculate and store the overall rating
    if (activeQuestionIndex === mockInterViewQuestion.length - 1) {
      const overall_averageRating = overallRating / mockInterViewQuestion.length;
      const averageRating = overall_averageRating.toFixed(1);
      await updateOverallRating(interviewData?.mockId, averageRating);
      toast('User Answer recorded and User rated successfully');
      console.log("Average Overall Rating:-",averageRating)
    }

      if (resp) {
        toast.success('User Answer recorded Successfully');
        setUserAnswer('');
        setResults([]);
        setSubmitted(true); // Mark as submitted to prevent multiple DB inserts
      }
    } catch (error) {
      console.error("Error in UpdateUserAnswerInDb: ", error);
      toast.error("Failed to record answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const updateOverallRating = async (mockId, overallRating) => {
    try {
      await fetch(`${API_BASE_URL}/api/update-overall-rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mockId, overallRating: overallRating }),
      });
      toast('Overall Rating Updated Successfully');
    } catch (error) {
      console.error('Error updating overall rating:', error);
    }
  };

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5">
      <Image src={'/webcam.png'} width={200} height={200} className='absolute' />
        <Webcam mirrored={true} ref={webcamRef} style={{ height: 300, width: '100%', zIndex: 10 }} />
      </div>
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        {isLooking ? (
          <p style={{ color: "green" }}>Looking at the screen</p>
        ) : (
          <p style={{ color: "red" }}>Warning: Movement Detected!</p>
        )}
        <p>Confidence: {confidence.toFixed(1)}%</p>
      </div>
      <Button
        disabled={loading}
        variant="outline"
        className="my-10"
        onClick={StartStopRecording}
      >
        {isRecording ? (
          <h2 className="flex items-center animate-pulse justify-center text-red-600 gap-2">
            <StopCircle />
            Stop Recording
          </h2>
        ) : (
          <h2 className="text-purple-600 flex items-center justify-center gap-2">
            <Mic />
            Start Recording
          </h2>
        )}
      </Button>

      {/* Display the transcribed text */}
          <div className="w-full max-w-lg mx-auto bg-gray-100 p-4 rounded-lg shadow-md my-5">
            <h3 className="text-lg text-gray-700 mb-3">Your Recorded Text:</h3>
            <ul className="overflow-y-auto max-h-48 text-gray-800 space-y-2">
              {results.map((result) => (
                <li key={result.timestamp} className="p-2 bg-white rounded-md shadow-sm">
                  {result.transcript}
                </li>
              ))}
              {interimResult && (
                <li className="p-2 bg-yellow-100 rounded-md animate-pulse">
                  {interimResult}
                </li>
              )}
            </ul>
          </div>

    </div>
  );
}

export default RecordAnswerSection;



// // -------------------------
// // "use client";
// // import Image from "next/image";
// // import Webcam from "react-webcam";
// // import React, { useEffect, useState } from 'react';
// // import { Button } from "@/components/ui/button";
// // import { Mic, StopCircle } from "lucide-react";
// // import { toast } from "sonner";
// // import useSpeechToText from "react-hook-speech-to-text";
// // import { chatSession } from "@/utils/GeminiAIModel";
// // import { UserAnswer } from "@/utils/schema";
// // import moment from "moment";
// // import { useUser } from "@clerk/nextjs";
// // import { db } from "@/utils/db";

// // function RecordAnswerSection({ activeQuestionIndex, mockInterViewQuestion, interviewData }) {
// //   const [userAnswer, setUserAnswer] = useState('');
// //   const [overallRating, setOverallRating] = useState(0); // Track overall rating
// //   const { user } = useUser();
// //   const [loading, setLoading] = useState(false);
// //   const [submitted, setSubmitted] = useState(false); // To prevent double submissions

// //   const {
// //     error,
// //     interimResult,
// //     isRecording,
// //     results,
// //     startSpeechToText,
// //     stopSpeechToText,
// //     setResults
// //   } = useSpeechToText({
// //     continuous: true,
// //     useLegacyResults: false
// //   });

// //   // Append results to userAnswer when results change
// //   useEffect(() => {
// //     results.map((result) => {
// //       setUserAnswer((prevAns) => prevAns + result?.transcript);
// //     });
// //   }, [results]);

// //   // Automatically submit when recording stops and answer is long enough
// //   useEffect(() => {
// //     if (!isRecording && userAnswer.length > 10 && !submitted) {
// //       UpdateUserAnswerInDb();
// //     }
// //   }, [isRecording, userAnswer, submitted]);

// //   // Start or Stop Recording based on current state
// //   const StartStopRecording = async () => {
// //     try {
// //       if (isRecording) {
// //         await stopSpeechToText();
// //       } else {
// //         await startSpeechToText();
// //         setSubmitted(false); // Reset submission state for new recording
// //       }
// //     } catch (error) {
// //       console.error("Error in Start/Stop Recording: ", error);
// //       toast.error("Something went wrong while starting/stopping recording.");
// //     }
// //   };

// //   // Submit the user's answer and get feedback
// //   const UpdateUserAnswerInDb = async () => {
// //     console.log(userAnswer)
// //     setLoading(true);
// //     const response = await fetch('/api/generate-feedback', {
// //       method: 'POST',
// //       headers: {
// //         'Content-Type': 'application/json',
// //       },
// //       body: JSON.stringify({
// //         correctAnswer: mockInterViewQuestion[activeQuestionIndex]?.answer,
// //         userAnswer,
// //       }),
// //     });

// //     const feedback = await response.json();
// //     console.log(feedback);

// //     if (feedback.error) {
// //       toast('Error generating feedback');
// //       setLoading(false);
// //       return;
// //     }
// //     try {
// //       const feedbackPromt = `Question: ${mockInterViewQuestion[activeQuestionIndex]?.question}, User Answer: ${userAnswer}, depend on question and user answer for given interview question please give us rating for answer and feedback as area of improvement if any in just 3 to 5 lines to improve it in JSON format with rating and feedback fields.`;

// //       const result = await chatSession.sendMessage(feedbackPromt);
// //       const mockJsonResp = (await result.response.text()).replace("```json", "").replace("```", "");
// //       const JsonFeedbackResp = JSON.parse(mockJsonResp);

// //       const resp = await db.insert(UserAnswer).values({
// //         mockIdRef: interviewData?.mockId,
// //         question: mockInterViewQuestion[activeQuestionIndex]?.question,
// //         correctAns: mockInterViewQuestion[activeQuestionIndex]?.answer,
// //         userAns: userAnswer,
// //         feedback: JsonFeedbackResp?.feedback,
// //         rating: feedback?.rating,
// //         userEmail: user?.primaryEmailAddress?.emailAddress,
// //         createdAt: moment().format('DD-MM-yyyy')
// //       });

// //       // Update overall rating
// //     if (feedback?.rating) {
// //       setOverallRating((prevRating) => prevRating + parseFloat(feedback?.rating));
// //     }

// //     // If the user answered the last question, calculate and store the overall rating
// //     if (activeQuestionIndex === mockInterViewQuestion.length - 1) {
// //       const overall_averageRating = overallRating / mockInterViewQuestion.length;
// //       const averageRating = overall_averageRating.toFixed(1);
// //       await updateOverallRating(interviewData?.mockId, averageRating);
// //       toast('User Answer recorded and User rated successfully');
// //       console.log("Average Overall Rating:-",averageRating)
// //     }

// //       if (resp) {
// //         toast.success('User Answer recorded Successfully');
// //         setUserAnswer('');
// //         setResults([]);
// //         setSubmitted(true); // Mark as submitted to prevent multiple DB inserts
// //       }
// //     } catch (error) {
// //       console.error("Error in UpdateUserAnswerInDb: ", error);
// //       toast.error("Failed to record answer. Please try again.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const updateOverallRating = async (mockId, overallRating) => {
// //     try {
// //       await fetch('/api/update-overall-rating', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({ mockId, overallRating: overallRating }),
// //       });
// //       toast('Overall Rating Updated Successfully');
// //     } catch (error) {
// //       console.error('Error updating overall rating:', error);
// //     }
// //   };

// //   return (
// //     <div className="flex items-center justify-center flex-col">
// //       <div className="flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5">
// //         <Image
// //           src={"/webcam.png"}
// //           width={200}
// //           height={200}
// //           className="absolute"
// //         />
// //         <Webcam
// //           mirrored={true}
// //           style={{
// //             height: 300,
// //             width: "100%",
// //             zIndex: 10,
// //           }}
// //         />
// //       </div>
// //       <Button
// //         disabled={loading}
// //         variant="outline"
// //         className="my-10"
// //         onClick={StartStopRecording}
// //       >
// //         {isRecording ? (
// //           <h2 className="flex items-center animate-pulse justify-center text-red-600 gap-2">
// //             <StopCircle />
// //             Stop Recording
// //           </h2>
// //         ) : (
// //           <h2 className="text-purple-600 flex items-center justify-center gap-2">
// //             <Mic />
// //             Start Recording
// //           </h2>
// //         )}
// //       </Button>

// //       {/* Display the transcribed text */}
// //           <div className="w-full max-w-lg mx-auto bg-gray-100 p-4 rounded-lg shadow-md my-5">
// //             <h3 className="text-lg text-gray-700 mb-3">Your Recorded Text:</h3>
// //             <ul className="overflow-y-auto max-h-48 text-gray-800 space-y-2">
// //               {results.map((result) => (
// //                 <li key={result.timestamp} className="p-2 bg-white rounded-md shadow-sm">
// //                   {result.transcript}
// //                 </li>
// //               ))}
// //               {interimResult && (
// //                 <li className="p-2 bg-yellow-100 rounded-md animate-pulse">
// //                   {interimResult}
// //                 </li>
// //               )}
// //             </ul>
// //           </div>

// //     </div>
// //   );
// // }

// // export default RecordAnswerSection;

