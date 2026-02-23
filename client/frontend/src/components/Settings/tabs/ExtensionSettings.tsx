import React from 'react';
import { useStore } from '../../../store/useStore';
import { Search, Filter, Plus, ChevronRight } from 'lucide-react';

export const ExtensionSettings: React.FC = () => {
    const { results, extensions } = useStore();

    // Filter to show extensions or commands that are relevant
    const allExtensions: any[] = [
        ...extensions.map(e => ({ ...e, type: 'Extension', isGroup: false })),
        { label: 'AI Commands', type: 'Group', isGroup: true },
        { label: 'Applications', type: 'Group', isGroup: true }
    ];

    const { toggleExtension } = useStore();

    return (
        <div className="settings-tab-content extensions-settings">
            <div className="extensions-toolbar">
                <div className="toolbar-search">
                    <Search size={14} />
                    <input type="text" placeholder="Search..." />
                </div>
                <div className="toolbar-filters">
                    <button className="filter-btn active">All</button>
                    <button className="filter-btn">Commands</button>
                    <button className="filter-btn">Scripts</button>
                    <button className="filter-btn">Apps</button>
                </div>
                <div className="toolbar-actions">
                    <button className="icon-btn"><Filter size={14} /></button>
                    <button className="icon-btn plus"><Plus size={14} /></button>
                </div>
            </div>

            <div className="extensions-table-container">
                <table className="extensions-table">
                    <thead>
                        <tr>
                            <th className="col-name">Name</th>
                            <th className="col-type">Type</th>
                            <th className="col-alias">Alias</th>
                            <th className="col-hotkey">Hotkey</th>
                            <th className="col-enabled">Enabled</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allExtensions.map((ext, i) => (
                            <tr key={i} className={ext.isGroup ? 'group-row' : ''}>
                                <td className="col-name">
                                    <div className="name-cell">
                                        {ext.isGroup ? <ChevronRight size={14} /> : <div className="ext-icon"></div>}
                                        <span>{ext.label}</span>
                                    </div>
                                </td>
                                <td className="col-type">{ext.type}</td>
                                <td className="col-alias">{ext.isGroup ? '--' : 'Add Alias'}</td>
                                <td className="col-hotkey">{ext.isGroup ? '--' : 'Record Hotkey'}</td>
                                <td className="col-enabled">
                                    {!ext.isGroup && (
                                        <input
                                            type="checkbox"
                                            checked={ext.isEnabled !== false}
                                            onChange={() => toggleExtension(ext.id)}
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
