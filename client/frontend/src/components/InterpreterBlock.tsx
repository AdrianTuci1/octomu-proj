import React from 'react';
import { Terminal, ShieldCheck } from 'lucide-react';
import { IPendingCommand } from '../domain/types';
import './InterpreterBlock.css';

interface InterpreterBlockProps {
    pendingCommand: IPendingCommand;
    onApprove: () => void;
    onReject: () => void;
    onAlwaysApprove?: (toolName: string) => void;
}

export const InterpreterBlock: React.FC<InterpreterBlockProps> = ({
    pendingCommand,
    onApprove,
    onReject,
    onAlwaysApprove
}) => {
    // Extract tool name from command string (e.g. "search {"query": "..."}")
    const toolName = pendingCommand.command.split(' ')[0];

    const handleAlwaysApprove = () => {
        if (onAlwaysApprove) {
            onAlwaysApprove(toolName);
        }
        onApprove();
    };

    return (
        <div className="interpreter-block">
            <div className="interpreter-meta">
                <div className="interpreter-header">
                    <Terminal size={14} />
                    <span>Action Required: {toolName}</span>
                </div>
                <div className="interpreter-trust-badge">
                    <ShieldCheck size={12} />
                    <span>Verified Tool</span>
                </div>
            </div>

            <div className="command-preview">
                <span className="prompt-char">$</span> {pendingCommand.command} {pendingCommand.args && (
                    <span className="command-args">{JSON.stringify(pendingCommand.args)}</span>
                )}
            </div>

            <div className="interpreter-footer">
                <div className="interpreter-actions-primary">
                    <button className="btn-approve" onClick={onApprove}>Run Once</button>
                    {onAlwaysApprove && (
                        <button className="btn-always" onClick={handleAlwaysApprove}>Always Run</button>
                    )}
                </div>
                <button className="btn-reject" onClick={onReject}>Reject</button>
            </div>
        </div>
    );
};
