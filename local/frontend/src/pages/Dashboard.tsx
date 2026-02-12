export default function Dashboard() {
    return (
        <div>
            <h1>Dashboard</h1>
            <div className="grid-dashboard">
                {/* Metric Cards */}
                <div className="card">
                    <h3 className="card-subtitle">Active Servers</h3>
                    <div className="card-value">0</div>
                </div>
                <div className="card">
                    <h3 className="card-subtitle">Total Executions</h3>
                    <div className="card-value">0</div>
                </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h2>Recent Activity</h2>
                <div className="card">
                    <p>No recent activity.</p>
                </div>
            </div>
        </div>
    );
}
