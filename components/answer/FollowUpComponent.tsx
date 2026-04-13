import { ArrowRight } from '@phosphor-icons/react';

interface FollowUp {
    choices: {
        message: {
            content: string;
        };
    }[];
}

function parseFollowUpQuestions(followUp: FollowUp): string[] {
    try {
        const content = followUp?.choices?.[0]?.message?.content;
        if (!content) return [];
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed?.followUp)) return parsed.followUp;
        return [];
    } catch {
        return [];
    }
}

const FollowUpComponent = ({ followUp, handleFollowUpClick }: { followUp: FollowUp; handleFollowUpClick: (question: string) => void }) => {
    const questions = parseFollowUpQuestions(followUp);
    if (questions.length === 0) return null;

    return (
        <div className="bg-[--card-bg] border border-[--card-border] rounded-xl p-4 mt-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[--text-muted] mb-3">Follow-up</h2>
            <div className="flex flex-col gap-1.5">
                {questions.map((question: string, index: number) => (
                    <button
                        key={index}
                        onClick={() => handleFollowUpClick(question)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm text-[--text-muted] hover:text-[--text-primary] hover:bg-[--card-hover] transition-all group"
                    >
                        <ArrowRight size={14} className="flex-shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        <span>{question}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FollowUpComponent;
