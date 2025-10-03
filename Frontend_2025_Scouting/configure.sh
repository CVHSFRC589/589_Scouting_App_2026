#!/bin/bash
#Run in ^

# Check if Node.js and npm are installed
if ! command -v node &> /dev/null
then
    echo "Node.js could not be found. Please install Node.js and npm first."
    exit
fi

#this might be unnecessary. Find a way to check 
# Create tsconfig.json
echo "Creating tsconfig.json..."
cat <<EOT >> tsconfig.json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "strict": true,
    "jsx": "react",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
}
EOT

# Install TypeScript and type definitions
echo "Installing TypeScript and type definitions..."
npm install --save-dev typescript @types/react @types/react-native @types/react-dom @types/node

# Install Expo modules
echo "Installing Expo modules..."
npm install expo

# Create .vscode/settings.json
mkdir -p .vscode
echo "Creating .vscode/settings.json..."
cat <<EOT >> .vscode/settings.json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.associations": {
    "*.tsx": "typescriptreact",
    "*.ts": "typescript"
  }
}
EOT

echo "Project setup complete. Please open the project in VS Code and install the recommended extension: TypeScript."
