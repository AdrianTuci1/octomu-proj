import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import InstallModal from "../components/InstallModal";

interface RegistryServer {
    id: string;
    name: string;
    description: string;
    homepage?: string;
}

export default function Catalog() {
    const [servers, setServers] = useState<RegistryServer[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedServer, setSelectedServer] = useState<RegistryServer | null>(null);

    const handleInstall = async (config: any) => {
        const res = await fetch("/api/servers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(config)
        });
        if (!res.ok) throw new Error("Failed");
    };

    useEffect(() => {
        fetch("/api/registry")
            .then((res) => res.json())
            .then((data) => {
                const list = data.results || data || [];
                setServers(list);
            })
            .catch((err) => console.error("Failed to fetch registry:", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <h1>MCP Catalog</h1>
                <div className="input-group">
                    <Search className="input-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search servers..."
                        className="input"
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading catalog...</div>
            ) : (
                <div className="grid-catalog">
                    {servers.map((server) => (
                        <div key={server.id || server.name} className="card">
                            <div className="server-card-header">
                                <h3 className="card-title">{server.name}</h3>
                                {server.homepage && (
                                    <a href={server.homepage} target="_blank" rel="noreferrer" className="server-link">
                                        Docs ↗
                                    </a>
                                )}
                            </div>
                            <p className="server-desc">
                                {server.description}
                            </p>
                            <button
                                className="btn btn-secondary btn-full"
                                onClick={() => setSelectedServer(server)}
                            >
                                Install
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {selectedServer && (
                <InstallModal
                    server={selectedServer}
                    onClose={() => setSelectedServer(null)}
                    onInstall={handleInstall}
                />
            )}
        </div>
    );
}
