#!/bin/bash
# setup-tracer-spec.sh
# Quick setup script for Tracer Spec Workflow

set -e

REPO_URL="${REPO_URL:-https://github.com/rattermeyer/tracer-spec.git}"
INSTALL_DIR="${1:-tracer-spec}"
ANTORA_TRACER_PATH="${ANTORA_TRACER_PATH:-/home/richard/devel/git/antora-tracer}"

echo "🚀 Setting up Tracer Spec Workflow..."
echo ""

# Check prerequisites
echo "Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js not found"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "❌ Git not found"; exit 1; }
[ -d "$ANTORA_TRACER_PATH" ] || { echo "❌ antora-tracer not found at $ANTORA_TRACER_PATH"; exit 1; }
echo "✅ Prerequisites OK"
echo ""

# Clone the template
echo "Cloning Tracer Spec Workflow template..."
git clone "$REPO_URL" "$INSTALL_DIR"
cd "$INSTALL_DIR"
echo "✅ Template cloned"
echo ""

# Install dependencies
echo "Installing npm dependencies..."
npm install --silent
echo "✅ Dependencies installed"
echo ""

# Install skills to Pi (if Pi agent exists)
if [ -d "$HOME/.pi/agent/skills" ]; then
  echo "Installing skills to Pi agent..."
  mkdir -p "$HOME/.pi/agent/skills"
  cp -r skills/* "$HOME/.pi/agent/skills/"
  echo "✅ Skills installed to ~/.pi/agent/skills"
else
  echo "⚠️  Pi agent not found at ~/.pi/agent"
  echo "   Skills are available in ./skills/ for manual installation"
fi
echo ""

# Validate the example
echo "Validating the example graph..."
node "$ANTORA_TRACER_PATH/lib/src/cli.js" validate -i docs --config traceability.yml >/dev/null 2>&1
echo "✅ Graph validation passed"
echo ""

echo "════════════════════════════════════════════════════════"
echo "✅ Tracer Spec Workflow installed successfully!"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo ""
echo "1. Customize for your project:"
echo "   • Edit docs/*.adoc with your own artifacts"
echo "   • Update README.md, antora.yml with your project name"
echo ""
echo "2. Use the workflow:"
echo "   pi explore-change \"your feature idea\""
echo ""
echo "3. Validate frequently:"
echo "   npm run validate"
echo ""
echo "4. Build the documentation site:"
echo "   npm run build"
echo ""
echo "5. Read the docs:"
echo "   • ./README.md — Installation and configuration"
echo "   • ./examples/tracer/modules/ROOT/pages/getting-started.adoc — Tutorial"
echo "   • ./examples/tracer/modules/ROOT/pages/workflow/ — Workflow details"
echo ""
