import React from 'react';
import * as LucideIcons from 'lucide-react';
import { useStore } from '../store/useStore';
import { IExtension } from '../store/storeTypes';
import './MentionsOverlay.css';

export const MentionsOverlay: React.FC = () => {
    const extensions = useStore(state => state.command?.extensions) ?? [];
    const { selectedIndex, query } = useStore(state => state.ui) ?? {};
    const { core } = useStore();

    const lastWord = (query ?? '').split(' ').pop() || '';
    const filter = lastWord.startsWith('@') ? lastWord.slice(1).toLowerCase() : '';

    // Extensions are already ordered with LLM first in commandSlice
    const filteredExtensions = (extensions as IExtension[]).filter((ex: IExtension) =>
        ex.label.toLowerCase().includes(filter) ||
        ex.handle.toLowerCase().includes(filter)
    );

    if (filteredExtensions.length === 0) return null;

    return (
        <div className="mentions-overlay">
            <div className="mentions-header">Tools & Models</div>
            <div className="mentions-list">
                {filteredExtensions.map((ex: IExtension, index: number) => {
                    const Icon = (LucideIcons as any)[ex.icon] || LucideIcons.Package;
                    return (
                        <div
                            key={ex.id}
                            className={`mention-item ${selectedIndex === index ? 'active' : ''}`}
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent focus loss
                                core.navigation.addMention(ex);
                            }}
                        >
                            <div className="mention-icon">
                                <Icon size={14} />
                            </div>
                            <div className="mention-info">
                                <div className="mention-label">{ex.label} <span className="mention-handle">@{ex.handle}</span></div>
                                <div className="mention-desc">{ex.subtitle}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
