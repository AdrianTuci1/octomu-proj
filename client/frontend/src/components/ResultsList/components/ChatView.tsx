import React from 'react';
import { Layout } from 'lucide-react';
import { InterpreterBlock } from '../../InterpreterBlock';
import { IMessage, IPendingCommand } from '../../../domain/types';
import './ChatView.css';

interface ChatViewProps {
    conversation: IMessage[];
    pendingCommand: IPendingCommand | null;
    executeCommand: () => void;
    rejectCommand: () => void;
    allowTool: (name: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
    conversation,
    pendingCommand,
    executeCommand,
    rejectCommand,
    allowTool
}) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [conversation, pendingCommand]);

    return (
        <div className="chat-view">
            {conversation.length === 0 && !pendingCommand ? (
                <div className="chat-empty-state">
                    <div className="empty-content">
                        <div className="empty-icon-wrapper">
                            <Layout size={32} className="pulsing-icon" />
                        </div>
                        <h3 className="empty-title">Conversations & Tools</h3>
                        <p className="empty-text">
                            Manage and continue your conversations here. <br />
                            Mention specific tools with <span className="highlight">@</span> to boost accuracy and unlock specialized capabilities.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="messages-container" ref={scrollRef}>
                    {conversation.map(msg => (
                        <div key={msg.id} className={`message ${msg.type}`}>
                            <div className="msg-bubble">
                                {msg.type === 'tool' && <span className="msg-label">Tool Output: </span>}
                                {msg.type === 'system' && <span className="msg-label">System: </span>}
                                {msg.content}
                            </div>
                            <div className="msg-meta">{msg.timestamp}</div>
                        </div>
                    ))}
                </div>
            )}

            {pendingCommand && (
                <div className="pending-area">
                    <InterpreterBlock
                        pendingCommand={pendingCommand}
                        onApprove={executeCommand}
                        onReject={rejectCommand}
                        onAlwaysApprove={allowTool}
                    />
                </div>
            )}
        </div>
    );
};
