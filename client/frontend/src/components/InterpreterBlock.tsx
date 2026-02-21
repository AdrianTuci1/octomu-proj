import React from 'react';
import { Terminal } from 'lucide-react';
import { IPendingCommand } from '../domain/types';
import './InterpreterBlock.css';

interface InterpreterBlockProps {
    pendingCommand: IPendingCommand;
    onApprove: () => void;
    onReject: () => void;
}

export const InterpreterBlock: React.FC<InterpreterBlockProps> = ({
    pendingCommand,
    onApprove,
    onReject
}) => {
    return (
        <div className="interpreter-block">
            <div className="interpreter-header">
                <Terminal size={14} />
                <span>Proposed Command</span>
            </div>
            <div className="command-preview">
                $ {pendingCommand.command}
            </div>
            <div className="interpreter-actions">
                <button className="btn-approve" onClick={onApprove}>Approve</button>
                <button className="btn-reject" onClick={onReject}>Reject</button>
            </div>
        </div>
    );
};
