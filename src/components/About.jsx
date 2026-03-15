import React from 'react';
import { Lightbulb, LayoutDashboard, LineChart } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[size:20px_20px]"></div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-ll-blue blur-[100px] opacity-20 rounded-full"></div>

              <div className="grid grid-cols-2 gap-4 relative">
                <div className="space-y-4 translate-y-8">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 bg-opacity-80 backdrop-blur">
                    <Lightbulb className="w-10 h-10 text-yellow-500 mb-4" />
                    <h4 className="font-bold text-ll-dark mb-2">Identify Weaknesses</h4>
                    <p className="text-sm text-gray-500">Pinpoint subjects requiring urgent attention.</p>
                  </div>
                  <div className="bg-ll-dark p-6 rounded-2xl shadow-xl border border-ll-dark text-white transform hover:scale-105 transition-transform cursor-pointer">
                    <LineChart className="w-10 h-10 text-ll-pale-blue mb-4" />
                    <h4 className="font-bold mb-2 text-white">Visualize Trends</h4>
                    <p className="text-sm text-gray-300">Track your performance trajectory over semesters.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-ll-pale-blue p-6 rounded-2xl shadow-md border border-ll-light-blue transform hover:scale-105 transition-transform cursor-pointer">
                    <LayoutDashboard className="w-10 h-10 text-ll-dark mb-4" />
                    <h4 className="font-bold text-ll-dark mb-2">Analytics Hub</h4>
                    <p className="text-sm text-ll-dark/80">All your academic data in one intuitive dashboard.</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 bg-opacity-80 backdrop-blur">
                    <div className="flex justify-between items-end h-20 mb-4 space-x-2">
                      <div className="bg-gray-200 w-1/4 h-1/3 rounded-t-sm"></div>
                      <div className="bg-ll-light-blue w-1/4 h-2/3 rounded-t-sm"></div>
                      <div className="bg-ll-blue w-1/4 h-[80%] rounded-t-sm"></div>
                      <div className="bg-ll-dark w-1/4 h-full rounded-t-sm"></div>
                    </div>
                    <h4 className="font-bold text-ll-dark mb-2">Grow Smarter</h4>
                    <p className="text-sm text-gray-500">Transform strategies to score higher.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <h2 className="text-ll-blue font-bold text-lg mb-2 uppercase tracking-wider">About Our Platform</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-ll-dark mb-8 leading-tight">
              Empowering Students with Data-Driven Clarity
            </h3>

            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Marks are just numbers until they become insights. LearnLens analyzes academic performance, reveals trends, and highlights weak subjects so students can improve strategically.            </p>




            <button className="px-6 py-3 bg-white text-ll-dark font-semibold border-2 border-ll-dark rounded-lg hover:bg-ll-dark hover:text-white transition-colors">
              Read Our Mission
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
