import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <section className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
        <section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6 rounded-lg shadow-lg overflow-hidden">
          <img
            alt="Background image"
            src="./ai.jpg"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />

          <div className="hidden lg:relative lg:block lg:p-12">

            <h2 className="mt-6 text-4xl font-extrabold text-white sm:text-5xl md:text-6xl drop-shadow-lg">
              Welcome to Naukri Sahayak 🚀
            </h2>

            <p className="mt-4 text-lg text-white/90 leading-relaxed">
              Empowering Job Seekers with AI-Driven Mock Interviews: Practice, Improve, and Succeed with Personalized Feedback and Realistic Simulations to Ace Every Interview.
            </p>
          </div>
        </section>

        <main className="flex items-center justify-center bg-white px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6 rounded-lg shadow-lg">
          <div className="max-w-xl lg:max-w-3xl">
            <div className="relative block lg:hidden -mt-16 text-center">
              <a
                className="inline-flex items-center justify-center rounded-full bg-white text-blue-600 p-4 shadow-md transition-transform transform hover:scale-105"
                href="#"
              >
                <span className="sr-only">Home</span>
                <svg
                  className="h-8 sm:h-10"
                  viewBox="0 0 28 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.41 10.3847C1.14777 7.4194 2.85643 4.7861 5.2639 2.90424C7.6714 1.02234 10.6393 0 13.695 0C16.7507 0 19.7186 1.02234 22.1261 2.90424..."
                    fill="currentColor"
                  />
                </svg>
              </a>

              <h1 className="mt-4 text-4xl font-extrabold text-gray-900 sm:text-5xl">
                Welcome to Naukri Sahayak 🚀
              </h1>

              <p className="mt-4 text-gray-500 leading-relaxed">
                Empowering Job Seekers with AI-Driven Mock Interviews: Practice, Improve, and Succeed.
              </p>
            </div>

            <div className="mt-8">
              <SignIn />
            </div>
          </div>
        </main>
      </div>
    </section>
  )
}
