interface UserMessageComponentProps {
    message: string;
}

const UserMessageComponent: React.FC<UserMessageComponentProps> = ({ message }) => {
    return (
        <div className="mt-6 mb-1">
            <h2 className="text-xl font-semibold text-[--text-primary] leading-snug">{message}</h2>
        </div>
    );
};

export default UserMessageComponent;
