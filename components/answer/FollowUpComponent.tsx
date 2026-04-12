import { IconPlus } from '@/components/ui/icons';

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
        <div className="dark:bg-[#282a2c] bg-white shadow-lg rounded-lg p-4 mt-4">
            <h2 className="text-lg font-semibold dark:text-white text-black mb-2">Follow-Up</h2>
            <ul className="mt-2">
                {questions.map((question: string, index: number) => (
                    <li
                        key={index}
                        className="flex items-center mt-2 cursor-pointer"
                        onClick={() => handleFollowUpClick(question)}
                    >
                        <span className="mr-2 dark:text-white text-black">
                            <IconPlus />
                        </span>
                        <p className="dark:text-white text-black hover:underline">{question}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FollowUpComponent;
