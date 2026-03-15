import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const QAItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 bg-white transition-all hover:border-ll-light-blue shadow-sm">
      <button
        className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="font-semibold text-lg text-ll-dark pr-4">{question}</h4>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-ll-blue flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      <div
        className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <p className="text-gray-600 leading-relaxed pt-2 border-t border-gray-100">{answer}</p>
      </div>
    </div>
  );
};

const FAQ = () => {
  const faqs = [
    {
      question: "What is LearnLens?",
      answer: "LearnLens is an advanced academic analytics platform that helps students turn their marks into meaningful insights. It visualizes performance trends and pinpoints areas for improvement."
    },
    {
      question: "How does LearnLens analyze marks?",
      answer: "By uploading your marksheets, our system extracts the grades, calculates subject-wise averages, and utilizes data visualization tools to detect patterns, strengths, and weaknesses across different subjects and semesters."
    },
    {
      question: "Is my academic data secure?",
      answer: "Yes, absolutely. We use industry-standard encryption protocols. Your data is stored securely and is never shared with third parties without your explicit consent."
    },
    {
      question: "Can I track my performance over time?",
      answer: "Definitely! LearnLens offers historical trend analysis charts that allow you to track your academic progress across different terms, seamlessly showing if you're improving or dipping in specific subjects."
    }
  ];

  return (
    <section id="faqs" className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-ll-dark mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 text-lg">
            Got questions about LearnLens? We've got answers.
          </p>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <QAItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        <div className="text-center mt-12 bg-gray-50 p-8 rounded-2xl border border-gray-100">
          <h4 className="font-semibold text-ll-dark text-xl mb-2">Still have questions?</h4>
          <p className="text-gray-500 mb-6">Our support team is always ready to help you out.</p>
          <button className="text-ll-blue font-bold px-6 py-3 rounded-lg border-2 border-ll-blue hover:bg-ll-blue hover:text-white transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
