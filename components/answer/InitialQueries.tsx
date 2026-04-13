import React from 'react';
import { ArrowRight } from '@phosphor-icons/react';

interface InitialQueriesProps {
  questions: string[];
  handleFollowUpClick: (question: string) => void;
}

const InitialQueries = ({ questions, handleFollowUpClick }: InitialQueriesProps) => {
  return (
    <div className="flex flex-col gap-1.5 mt-2">
      {questions.map((question, index) => (
        <button
          key={index}
          onClick={() => handleFollowUpClick(question)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm text-[--text-muted] hover:text-[--text-primary] bg-[--card-bg] border border-[--card-border] hover:bg-[--card-hover] transition-all group"
        >
          <ArrowRight size={14} className="flex-shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          <span>{question}</span>
        </button>
      ))}
    </div>
  );
};

export default InitialQueries;
