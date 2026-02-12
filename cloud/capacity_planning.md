# Capacity Planning & Scaling Analysis

## Hardware Configuration
- **Control Plane Node**: 6 vCPU, 12GB RAM
- **Worker Node**: 6 vCPU, 12GB RAM

## 1. Resource Bottlenecks

### Control Plane (The Orchestrator)
The Control Plane runs the API Server (Go), PostgreSQL, and Nginx. 
- **Resource Usage**: Very low per request.
- **Limit**: Can handle **thousands** of concurrent requests/users. 
- **Status**: **Significantly Overprovisioned**. This node will primarily be idle unless you have massive Postgres queries.

### Worker Node (The Factory)
The Worker Node runs the `node-agent` and hosts the Firecracker MicroVMs. This is your bottleneck.

#### Per-VM Overhead (Approximate)
| Resource | Firecracker Base | Kernel/OS | MCP Runtime (Node.js) | **Total Per VM** |
| :--- | :--- | :--- | :--- | :--- |
| **RAM** | ~10MB | ~25MB | ~30-60MB | **~100MB - 128MB** |
| **CPU** | Negligible (Idle) | Negligible | Spikey (Startup/Exec) | **0.1 - 1.0 vCPU** |

*Note: We recommend allocating **256MB** per VM to be safe for larger MCPs (e.g., image analysis).*

#### Scaling Limits (Worker Node)
With **10GB** usable RAM (leaving 2GB for host OS):

1.  **Memory Constrained (Safe Estimate)**:
    - `10,000MB / 256MB` = **~39 Concurrent VMs**
2.  **Memory Constrained (Aggressive - 128MB/VM)**:
    - `10,000MB / 128MB` = **~78 Concurrent VMs**

3.  **CPU Constrained**:
    - With 6 vCPUs and ~40 VMs, you are overcommitting CPU by roughly **6:1**.
    - Since MCPs are **I/O Bound** (waiting for APIs, web searches, DBs), this is perfectly acceptable.
    - If you run CPU-heavy tasks (video processing, heavy crypto), you will limited to **~6 concurrent VMs**.

## 2. Theoretical Concurrency
**You can comfortably support ~40-50 concurrent active agent sessions.**

- **"Concurrent Users" vs. "Active Sessions"**: 
  - If a user sends a prompt every 1 minute, and the tool runs for 5 seconds, 1 Active Session supports 12 users.
  - **Total Users supported** ≈ `40 slots * 12` = **480 active users on the platform**.

## 3. VM Lifecycle (Architecture Confirmation)

Your assumption is correct. The current architecture uses an **Ephemeral / One-Off** model for security and reliability:

1.  **Pre-warming**: The `node-agent` keeps a pool of "blank" VMs ready (booted to Linux login).
2.  **Claim (Spawn)**: When a request comes, a VM is taken from the pool instantly (sub-10ms).
3.  **Inject**: Credentials and Config are injected into MMDS.
4.  **Execute**: The MCP server runs, performs the task, and returns the result.
5.  **Destroy**: The VM is killed (`ReleaseVM`). It is **never reuse**.
6.  **Replenish**: The background pre-warmer creates a new fresh VM to refill the pool slot.

### Why this approach?
- **Security**: No data leaks between users. User A's Google Token handles the request, then the entire machine is wiped.
- **Stability**: No "process rot" or memory leaks in long-running MCP servers.
## 4. Alternatives & Validations
"Do we really need Firecracker?"

### Option A: Docker Containers (Not Recommended)
- **Pros**: Very low memory overhead (shared kernel). You could run ~200+ containers.
- **Cons**: **Critical Security Risk**. If you allow users to upload code, a container escape (common) gives them root on your Worker Node.
- **Verdict**: **Unsafe** for "Upload your own MCP". Only safe for trusted, internal tools.

### Option B: WebAssembly (Wasm) (The efficient future)
- **Pros**: Extreme density. You could run 1,000+ active agents on this hardware.
- **Cons**: **Compatibility**. Your users must write code that compiles to WASI (WebAssembly System Interface).
  - *Standard Node.js/Python libraries (like `fs`, `net`, `child_process`) often break or require polyfills.*
  - You lose the ability to just run standard Docker containers or random Python scripts.
- **Verdict**: Great for a niche "Serverless Function" platform, bad for a general-purpose "Run any MCP" platform.

### Option C: Optimized Firecracker (The Solution)
Firecracker is what AWS Lambda and Fly.io use for this exact reason. It is the **industry standard** for isolating untrusted code.

To improve density:
1.  **Kernel Tuning**: Strip the Linux kernel to the bare minimum (<5MB).
2.  **Memory Ballooning**: Allow the host to reclaim unused memory from VMs.
3.  **Swap**: Enable swap on the host (NVMe SSDs are fast).
    - If efficient, you can overcommit memory by 2x or 3x, pushing capacity to **~100-150 concurrent VMs**.

### Conclusion
Stick with **Firecracker**. The memory cost is the "insurance premium" you pay to safely allow user-uploaded code without them hacking your infrastructure.

## 5. Storage & Security of MCPs

### Where are they stored?
**Hybrid Approach (Best Performance)**:
1.  **Source of Truth**: Object Store (MinIO/S3) on the Control Plane.
2.  **Worker Cache**: Worker Nodes **cache** frequently used MCPs on their local NVMe disk.
    - 100 MCPs x 50MB = ~5GB. This is negligible on a 100GB+ disk.
    - Since files are "safe at rest", keeping them cached on the Worker Node is perfectly fine and makes VM startup instantaneous (no download time).

### Can they be malicious when idle?
**No.** Code "at rest" (stored on disk/S3) cannot do anything.
- It consumes 0 CPU and 0 RAM.
- It cannot access the network.
- It is just a file, like a text document.

### When does it become dangerous?
Only when **Executed**.
1.  **Orchestrator** downloads the zip to a Worker Node.
2.  **Firecracker** boots a VM.
3.  The code runs **inside** the VM.

**Safety Interlocks**:
- **Ephemeral**: The VM acts as a "bomb disposal chamber". The code runs, does its job, and then the chamber is destroyed.
- **Network Policy**: You can configure the VM's firewall to *only* allow outbound connections to specific APIs (e.g., `api.weather.gov`), blocking it from scanning your internal network or mining crypto.
