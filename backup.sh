#!/bin/bash
# Simple backup script for Web Visual Synthesizer

# Create checkpoint directory with timestamp
checkpoint_dir="checkpoint-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$checkpoint_dir"

# Copy all important files
echo "Creating checkpoint: $checkpoint_dir"
cp *.html *.js *.css *.md *.png *.ico "$checkpoint_dir/" 2>/dev/null

# Show what was backed up
echo "Backed up files:"
ls -la "$checkpoint_dir/"

# Optional: Also create a git commit
read -p "Create git commit? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    git add -A
    echo "Enter commit message:"
    read commit_msg
    git commit -m "$commit_msg"
    echo "Git commit created!"
fi

echo "Checkpoint complete!"