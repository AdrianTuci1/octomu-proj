import { useState } from 'react';
import { X } from 'lucide-react';

interface InstallModalProps {
    server: any;
    onClose: () => void;
    onInstall: (config: any) => Promise<void>;
}

export default function InstallModal({ server, onClose, onInstall }: InstallModalProps) {
    // Attempt to guess command. 
    // Simple heuristic: if it's an npm package, suggest `npx -y package`
    const defaultCommand = `npx -y ${server.name.includes('/') ? server.name : '@modelcontextprotocol/' + server.name}`;

    const [config, setConfig] = useState({
        name: server.name,
        command: defaultCommand,
        args: "",
        env: "{}",
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const argsArray = config.args.split(' ').filter(a => a.length > 0);
            let envMap = {};
            try {
                envMap = JSON.parse(config.env);
            } catch (e) {
                alert("Invalid JSON for Environment Variables");
                setLoading(false);
                return;
            }

            await onInstall({
                name: config.name,
                command: config.command,
                args: argsArray,
                env: envMap
            });
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to install");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full max-w-lg border rounded-xl shadow-lg p-6 relative">
                <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-4">Install {server.name}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Command</label>
                        <input
                            className="input font-mono text-sm"
                            value={config.command}
                            onChange={e => setConfig({ ...config, command: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            The command to run this server (e.g. <code>npx -y ...</code> or <code>docker run ...</code>)
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Arguments</label>
                        <input
                            className="input font-mono text-sm"
                            value={config.args}
                            placeholder="arg1 arg2"
                            onChange={e => setConfig({ ...config, args: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Environment Variables (JSON)</label>
                        <textarea
                            className="input font-mono text-sm h-24"
                            value={config.env}
                            onChange={e => setConfig({ ...config, env: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Installing...' : 'Save & Install'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
