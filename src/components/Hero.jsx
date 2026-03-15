import React from 'react';
import { ArrowRight, BarChart3, TrendingUp, Presentation } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section id="home" className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -z-10 w-full h-full overflow-hidden opacity-40">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-ll-pale-blue blur-3xl mix-blend-multiply"></div>
        <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-ll-light-blue blur-3xl mix-blend-multiply opacity-50"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-8">

          {/* Left Column (Will be Right visually by flex-col-reverse on mobile, but let's match prompt: Left Side Vector, Right Side Text... wait, prompt says Left Side Illustration, Right Side Text. Oh! Let me fix order) */}

          <div className="w-full lg:w-1/2 flex justify-center lg:justify-start relative lg:-translate-x-16 xl:-translate-x-24">
            <div className="relative w-full max-w-lg aspect-square">
              {/* Abstract Illustration using CSS + Lucide Icons since we can't load external SVGs without them breaking if missing */}
              <div className="absolute inset-0 bg-gradient-to-br from-ll-pale-blue to-white rounded-3xl shadow-2xl transform rotate-3 border-4 border-white"></div>
              <div className="absolute inset-0 bg-ll-blue rounded-3xl shadow-xl transform -rotate-2 opacity-10"></div>
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col p-6 gap-4 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-ll-light-blue rounded-full opacity-20"></div>
                  {/* Mock Dashboard UI */}
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                    <div>
                      <div className="w-24 h-3 bg-gray-200 rounded-full mb-2"></div>
                      <div className="w-16 h-2 bg-gray-200 rounded-full"></div>
                    </div>
                    <BarChart3 className="text-ll-blue w-8 h-8" />
                  </div>
                  <div className="flex-grow flex gap-4 mt-2">
                    <div className="w-1/3 flex items-end justify-center bg-slate-50 p-2 rounded-t-lg border-b-2 border-ll-dark relative">
                      <div className="w-full bg-ll-light-blue h-1/2 rounded-t-sm" style={{ height: '60%' }}></div>
                    </div>
                    <div className="w-1/3 flex items-end justify-center bg-slate-50 p-2 rounded-t-lg border-b-2 border-ll-dark">
                      <div className="w-full bg-ll-blue h-[80%] rounded-t-sm" style={{ height: '80%' }}></div>
                    </div>
                    <div className="w-1/3 flex items-end justify-center bg-slate-50 p-2 rounded-t-lg border-b-2 border-ll-dark relative overflow-hidden">
                      <div className="absolute top-2 right-2"><TrendingUp className="text-green-500 w-4 h-4" /></div>
                      <div className="w-full bg-ll-dark h-[40%] rounded-t-sm" style={{ height: '95%' }}></div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-4">
                    <div className="flex-1 bg-ll-pale-blue h-12 rounded-lg flex items-center justify-center">
                      <Presentation className="text-ll-blue w-5 h-5" />
                    </div>
                    <div className="flex-1 bg-slate-100 h-12 rounded-lg"></div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column (Text) */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center gap-8 text-center lg:text-left">
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full bg-ll-pale-blue text-ll-dark font-semibold text-sm mb-6 border border-ll-light-blue/30 backdrop-blur-sm">
                Smart Academic Analytics
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-ll-dark leading-tight tracking-tight mb-6">
                Turn Your Marks <br className="hidden lg:block" /> into <span className="text-transparent bg-clip-text bg-gradient-to-r from-ll-blue to-cyan-500">Meaningful Insights</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                LearnLens analyzes your performance to reveal weak subjects and help you improve faster              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-ll-dark hover:bg-ll-blue text-white rounded-full font-semibold text-lg transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-2 group text-center">
                Create an Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="pt-4 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500 font-medium">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-ll-pale-blue flex items-center justify-center text-xs font-bold text-ll-dark z-10">
                    S{i}
                  </div>
                ))}
              </div>
              <p>Trusted by <span className="text-ll-dark font-bold">10,000+</span> students</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
