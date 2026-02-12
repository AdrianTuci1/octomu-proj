#!/bin/bash
set -e

# Octomus Installer
# Installs backend (Go) and frontend (Node/Vite)

echo "🐙 Octomus Installer"
echo "===================="

# 1. Check Dependencies
echo "🔍 Checking dependencies..."

if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go (https://go.dev/doc/install) and try again."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ Node/npm is not installed. Please install Node.js (https://nodejs.org/) and try again."
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git and try again."
    exit 1
fi

echo "✅ All dependencies found."

# 2. Setup Directory
INSTALL_DIR="$HOME/.octomus"
REPO_URL="https://github.com/octomus/octomus.git" # Placeholder
# For local development within existing repo, we assume we are at root or using relative paths
# But for a real installer, we would verify where we are.
# As requested, this script assumes we are running it potentially from curl.

# Since we are creating this file inside the repo for the user, let's assume this script is meant to be run
# FROM the root of the repo for now, or it handles cloning if arguments are passed.
# To keep it simple for the "curl | bash" scenario, let's assume it clones if not present.

if [ -d "$INSTALL_DIR" ]; then
    echo "📂 Octomus is already installed in $INSTALL_DIR. Updating..."
    cd "$INSTALL_DIR"
    # If it's a git repo, pull. If not, maybe it was a manual install?
    if [ -d ".git" ]; then
        git pull
    fi
else
    # For now, since we don't have a public repo URL effectively, we'll assume the user is installing
    # the current directory context or we create the structure.
    # ADAPTATION FOR CURRENT CONTEXT: 
    # The user has the repo locally at /Users/adriantucicovenco/Proiecte/octomus
    # So strictly speaking, "installing" means building the binaries.
    
    # Let's make this script robust for the Local Development Context
    echo "📂 Setting up Octomus..."
fi

# Define paths relative to script location if we are in the repo
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
BACKEND_DIR="$SCRIPT_DIR/local"
FRONTEND_DIR="$SCRIPT_DIR/local/frontend"
BIN_DIR="$SCRIPT_DIR/bin"

# 3. Build Frontend
echo "🎨 Building Frontend..."
if [ -d "$FRONTEND_DIR" ]; then
    cd "$FRONTEND_DIR"
    echo "   Running npm install..."
    npm install --silent
    echo "   Running npm build..."
    npm run build --silent
    cd "$SCRIPT_DIR"
else
    echo "❌ Frontend directory not found at $FRONTEND_DIR"
    exit 1
fi

# 4. Build Backend
echo "⚙️  Building Backend..."
if [ -d "$BACKEND_DIR" ]; then
    cd "$BACKEND_DIR"
    mkdir -p "$BIN_DIR"
    go build -o "$BIN_DIR/octomus-server" ./cmd/server/main.go
    cd "$SCRIPT_DIR"
else
    echo "❌ Backend directory not found at $BACKEND_DIR"
    exit 1
fi

# 5. Helper Script
echo "📝 Creating 'octomus' command wrapper..."
cat <<EOF > "$BIN_DIR/octomus"
#!/bin/bash
ROOT_DIR="$SCRIPT_DIR"
BIN_PATH="\$ROOT_DIR/bin/octomus-server"

case "\$1" in
    start)
        cd "\$ROOT_DIR/local" # Run from local dir so it finds data/ and frontend/dist
        shift
        exec "\$BIN_PATH" "\$@"
        ;;
    update)
        echo "Updating..."
        cd "\$ROOT_DIR"
        git pull
        ./install.sh
        ;;
    remove)
        echo "⚠️  Uninstalling Octomus..."
        read -p "Are you sure? This will remove the binary and build files. [y/N] " confirm
        if [[ \$confirm =~ ^[Yy]$ ]]; then
            rm -f "\$ROOT_DIR/bin/octomus"
            rm -f "\$ROOT_DIR/bin/octomus-server"
            rm -rf "\$ROOT_DIR/local/frontend/dist"
            rm -rf "\$ROOT_DIR/local/frontend/node_modules"
            echo "✅ Binaries and build files removed."
            
            read -p "Do you also want to remove persistent DATA (databases)? [y/N] " deldata
            if [[ \$deldata =~ ^[Yy]$ ]]; then
                rm -rf "\$ROOT_DIR/local/data"
                echo "✅ Data removed."
            else
                echo "ℹ️  Data kept in \$ROOT_DIR/local/data"
            fi
        else
            echo "Cancelled."
        fi
        ;;
    *)
        echo "Usage: octomus {start|update|remove}"
        echo "  start   : Start the server (pass --secure or set OCTOMUS_AUTH=true for auth)"
        echo "  update  : Pull latest code and rebuild"
        echo "  remove  : Uninstall and clean up"
        exit 1
        ;;
esac
EOF

chmod +x "$BIN_DIR/octomus"

echo "🎉 Installation Complete!"
echo "======================="
echo "You can now run:"
echo "  $BIN_DIR/octomus start"
echo ""
echo "Note: Add $BIN_DIR to your PATH for easier access."
