#!/bin/bash
cd "$(dirname "$0")/frontend"
echo "Starting Angular frontend on http://localhost:4200 ..."
ng serve --open
