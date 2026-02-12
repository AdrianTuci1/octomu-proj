# Octomus: Technical Deep-Dive
The Universal Nervous System for Agentic Interoperability
Octomus este un Agentic Gateway de înaltă performanță, conceput să rezolve fragmentarea dintre modelele LLM și ecosistemul de unelte (tools) prin protocolul MCP. Arhitectura este construită pe principiul "Security-First, Privacy-by-Design".

1. Arhitectura Duală: Local vs. Managed
Octomus este livrat în două arome, partajând același nucleu de execuție, dar cu strategii de stocare diferite:
A. Varianta Local (Self-Hosted Docker)
* Deployment: Container unic care rulează pe infrastructura utilizatorului.
* Storage: Folosește un volum local pentru persistență.
* Vector DB: Conectori nativi pentru Qdrant sau LanceDB (embedded), asigurând că datele nu părăsesc niciodată rețeaua privată.
* Identity: Fișier .mcp-identity criptat local.
B. Varianta Managed (SaaS / Enterprise)
* Deployment: Arhitectură multi-tenant pe Kubernetes.
* Storage: PostgreSQL cu pgvector pentru scalabilitate masivă și căutări semantice complexe.
* Isolation: Procesele MCP ale fiecărui utilizator sunt izolate în medii de execuție segregate (Sandboxed Processes).

2. Core Engine: The Runner & MCP Orchestrator
Inima Octomus este un Orchestrator asincron (Node.js/Go) care gestionează ciclul de viață al serverelor MCP.
* Hot-Swapping Tooling: Posibilitatea de a activa/dezactiva servere MCP la cald, fără a restarta Gateway-ul.
* Transport Layer: Suportă atât stdio (pentru procese locale), cât și SSE/WebSockets (pentru servere MCP remote).
* Latency Optimization: Implementează un strat de Schema Caching. Octomus cache-uiește capabilitățile uneltelor pentru a nu interoga serverul MCP la fiecare cerere, reducând latența sub 500ms.

3. Security Layer: Zero-Knowledge Vault
Securitatea este pilonul care diferențiază Octomus de un simplu wrapper.
* Encryption: Toate credentialele (API Keys pentru Sunsama, Slack, etc.) sunt stocate folosind AES-256-GCM.
* Key Management: În varianta Managed, folosim un sistem de derivare a cheilor unde cheia master este derivată din parola utilizatorului și nu este niciodată stocată în text clar pe serverele noastre.
* Just-in-Time Injection: Credențialele sunt injectate ca variabile de mediu în procesul copil MCP doar în momentul execuției, fiind șterse din memorie imediat după.

4. MCP Marketplace & Dependency Manager
Octomus transformă instalarea complexă de servere MCP într-o experiență de tip "App Store".
* Integrated Catalog: Accesibil direct din Dashboard-ul local sau din platforma Hosted.
* One-Click Deploy: Octomus gestionează automat descărcarea pachetului, instalarea dependențelor (NPM/Python/Binaries) și verificarea integrității.
* Verified Sources: Catalogul indexează surse oficiale (Anthropic, Smithery) 