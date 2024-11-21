import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className='my-10 flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg p-10'>
  {/* Logo Section */}
  <Image src={'/logo.svg'} width={400} height={400} alt='logo' className='mb-6' />

  {/* Heading Section */}
  <h2 className='font-bold text-3xl lg:text-4xl mb-4'>
    Naukri Sahayak: <span className="text-yellow-300">AI Mock Interview Portal</span>
  </h2>

  {/* Description Section */}
  <p className='text-lg lg:text-xl text-center mb-6'>
    Empowering your job search with AI-driven interview simulations. Prepare, Practice, Succeed.
  </p>

  {/* Button Section */}
  <Link href={'/dashboard'}>
    <Button className='bg-yellow-400 text-indigo-900 font-semibold px-6 py-3 rounded-md hover:bg-yellow-300 transition duration-300 ease-in-out shadow-lg transform hover:scale-105'>
      Get Started
    </Button>
  </Link>

  {/* Features Section */}
  <div className='mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8 text-center'>
    <div className='p-6 bg-white text-indigo-900 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300'>
      <img src={'/feature 1.jpg'} alt="Feature 1" className='mx-auto w-100 h-100 mb-4' />
      <h3 className='font-bold text-xl mb-2'>AI-Powered Mock Interview</h3>
      <p className='text-sm'>Experience real-time AI-driven interview simulations to prepare for real job scenarios.</p>
    </div>
    
    <div className='p-6 bg-white text-indigo-900 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300'>
      <img src="/feature 2.jpg" alt="Feature 2" className='mx-auto w-100 h-100 mb-4' />
      <h3 className='font-bold text-xl mb-2'>Personalized Rating for Interview</h3>
      <p className='text-sm'>Elevate Your Interview Game with Tailored Insights !</p>
    </div>
    
    <div className='p-6 bg-white text-indigo-900 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300'>
      <img src="/feature 3.jpg" alt="Feature 3" className='mx-auto w-100 h-100 mb-4' />
      <h3 className='font-bold text-xl mb-2'>AI-Powered Interview Feedback</h3>
      <p className='text-sm'>Get detailed feedback and analytics on your performance to improve your answers.</p>
    </div>
  </div>

  {/* Testimonials Section */}
  <div className='mt-16 text-center'>
    <h2 className='text-3xl font-bold mb-6'>What Our Users Say</h2>
    
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
      <div className='p-6 bg-indigo-800 text-white rounded-lg shadow-lg'>
        <p className='mb-4'>"The AI interviews were so realistic, I felt more confident in my actual job interviews!"</p>
        <h3 className='font-bold text-lg'></h3>
      </div>

      <div className='p-6 bg-indigo-800 text-white rounded-lg shadow-lg'>
        <p className='mb-4'>"Naukri Sahayak's feedback system helped me understand my weak points and improve!"</p>
        <h3 className='font-bold text-lg'></h3>
      </div>
    </div>
  </div>

  {/* Call to Action Section */}
  <div className='mt-16 bg-yellow-400 text-indigo-900 py-8 px-4 rounded-lg text-center'>
    <h2 className='text-2xl lg:text-3xl font-bold mb-4'>Ready to Ace Your Next Interview?</h2>
    <p className='mb-6 text-lg'>Join Naukri Sahayak today and boost your confidence with AI mock interviews!</p>
    <Link href={'/signup'}>
      <Button className='bg-indigo-900 text-white px-8 py-4 rounded-md hover:bg-indigo-800 transition duration-300 ease-in-out'>
        Sign Up Now
      </Button>
    </Link>
  </div>
</div>

  );
}

