#!/usr/bin/env bash
# Compline: Classical Gothic Wind-Down Companion
# Hacktoberfest 2026 Week 3: Slow and Steady

echo "============================================================"
echo "   🦇 SLOTH LULLABY — CLASSICAL GOTHIC WIND-DOWN COMPANION   "
echo "============================================================"
echo "  • Medieval Architecture • Pointed Arches • Stained Glass  "
echo "  • Open-Weight AI (Gemma 2) & Procedural Web Audio         "
echo "============================================================"

# Navigate to app directory
cd "$(dirname "$0")/app"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 could not be found. Please install Python 3."
    exit 1
fi

echo "Opening the Abbey Portal at http://localhost:7777 ..."
python3 server.py "$@"
