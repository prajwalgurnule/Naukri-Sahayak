
// import { NextResponse } from 'next/server';
// import { spawn } from 'child_process';

// export async function POST(request) {
//   const { correctAnswer, userAnswer } = await request.json();

//   try {
//     // Sanitize input to ensure it doesn't cause issues
//   const sanitizedCorrectAnswer = correctAnswer.replace(/"/g, '\\"').replace(/\n/g, '\\n');
//   const sanitizedUserAnswer = userAnswer.replace(/"/g, '\\"').replace(/\n/g, '\\n');
//     // Log request payload for debugging
//     console.log('Request Payload:', { sanitizedCorrectAnswer, sanitizedUserAnswer });

//     // Run Python script asynchronously
//     const pythonProcess = spawn('python', ['feedback_model.py', sanitizedCorrectAnswer, sanitizedUserAnswer]);

//     let feedback = '';
//     pythonProcess.stdout.on('data', (data) => {
//       feedback += data.toString(); // Accumulate data
//     });

//     pythonProcess.stderr.on('data', (error) => {
//       console.error('Python script stderr:', error.toString());
//     });

//     pythonProcess.on('error', (err) => {
//       console.error('Error spawning Python process:', err);
//       throw new Error('Error spawning Python process');
//     });

//     // Ensure Python script completion
//     await new Promise((resolve, reject) => {
//       pythonProcess.on('close', (code) => {
//         if (code !== 0) {
//           reject(new Error(`Python script exited with code ${code}`));
//         } else {
//           resolve();
//         }
//       });
//     });

//     // Try parsing and returning the feedback
//     try {
//       const parsedFeedback = JSON.parse(feedback);
//       return NextResponse.json(parsedFeedback);
//     } catch (error) {
//       console.error('Error parsing feedback:', error.message);
//       return NextResponse.json({ error: 'Error parsing feedback' }, { status: 500 });
//     }
//   } catch (error) {
//     console.error('Error:', error.message);
//     return NextResponse.json({ error: 'Error generating feedback' }, { status: 500 });
//   }
// }

import { spawn } from 'child_process';

export async function generateFeedback(req, res) {
  const { correctAnswer, userAnswer } = req.body;

  try {
    // Sanitize input to ensure it doesn't cause issues
    const sanitizedCorrectAnswer = correctAnswer.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    const sanitizedUserAnswer = userAnswer.replace(/"/g, '\\"').replace(/\n/g, '\\n');

    // Log request payload for debugging
    console.log('Request Payload:', { sanitizedCorrectAnswer, sanitizedUserAnswer });

    // Run Python script asynchronously
    const pythonProcess = spawn('python', ['./feedback_model.py', sanitizedCorrectAnswer, sanitizedUserAnswer]);

    let feedback = '';
    pythonProcess.stdout.on('data', (data) => {
      feedback += data.toString(); // Accumulate data
    });

    pythonProcess.stderr.on('data', (error) => {
      console.error('Python script stderr:', error.toString());
    });

    pythonProcess.on('error', (err) => {
      console.error('Error spawning Python process:', err);
      return res.status(500).json({ error: 'Error spawning Python process' });
    });

    // Ensure Python script completion
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        return res.status(500).json({ error: `Python script exited with code ${code}` });
      }

      // Try parsing and returning the feedback
      try {
        const parsedFeedback = JSON.parse(feedback);
        return res.json(parsedFeedback);
      } catch (error) {
        console.error('Error parsing feedback:', error.message);
        return res.status(500).json({ error: 'Error parsing feedback' });
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Error generating feedback' });
  }
}

