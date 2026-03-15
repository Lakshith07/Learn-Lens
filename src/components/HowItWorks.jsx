import React from 'react';
import { UploadCloud, FileSearch, Target } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: 'Upload or Scan Marksheets',
      description: 'Users upload or scan their academic results directly into the platform effortlessly.',
      icon: <UploadCloud className="w-12 h-12 text-ll-blue" />,
      bg: 'bg-ll-pale-blue/30',
      border: 'border-ll-pale-blue'
    },
    {
      id: 2,
      title: 'Get Performance Metrics',
      description: 'The system analyzes marks and generates comprehensive subject-level insights.',
      icon: <FileSearch className="w-12 h-12 text-ll-dark" />,
      bg: 'bg-gray-100',
      border: 'border-gray-200'
    },
    {
      id: 3,
      title: 'Improve Weak Subjects',
      description: 'Identify weak subjects and receive actionable insights to convert them into strengths.',
      icon: <Target className="w-12 h-12 text-ll-blue" />,
      bg: 'bg-ll-light-blue/20',
      border: 'border-ll-light-blue'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white relative">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-ll-dark mb-6 tracking-tight">How It Works</h2>
          <p className="text-gray-600 text-lg">
            A simple three-step process to transform your academic data into a strategic roadmap for success.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-[25%] left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-ll-pale-blue via-ll-blue to-ll-pale-blue -z-10 w-2/3 mx-auto translate-y-[2rem]"></div>

          {steps.map((step) => (
            <div key={step.id} className="relative group perspective">
              <div className={`
                flex flex-col items-center text-center p-8 rounded-2xl 
                border-2 ${step.border} bg-white
                transition-all duration-300 hover:-translate-y-2 hover:shadow-xl
                h-full z-10
              `}>
                <div className={`
                  w-24 h-24 flex items-center justify-center rounded-2xl mb-8
                  ${step.bg} transform group-hover:rotate-3 transition-transform
                `}>
                  {step.icon}
                </div>

                <div className="absolute -top-4 -right-4 w-10 h-10 bg-ll-dark text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  {step.id}
                </div>

                <h3 className="text-2xl font-bold text-ll-dark mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
