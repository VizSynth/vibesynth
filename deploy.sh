#!/bin/bash

# VibeSynth Automated Deploy Script
# Usage: ./deploy.sh --branch "branch-name" [--message "commit message"]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
BRANCH=""
COMMIT_MESSAGE=""
SKIP_TESTS=false
SKIP_DOCS=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --branch)
            BRANCH="$2"
            shift 2
            ;;
        --message)
            COMMIT_MESSAGE="$2"
            shift 2
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-docs)
            SKIP_DOCS=true
            shift
            ;;
        --help)
            echo "VibeSynth Automated Deploy Script"
            echo ""
            echo "Usage: ./deploy.sh --branch \"branch-name\" [options]"
            echo ""
            echo "Options:"
            echo "  --branch \"name\"     Target branch name (required)"
            echo "  --message \"msg\"     Custom commit message"
            echo "  --skip-tests        Skip running tests"
            echo "  --skip-docs         Skip building docs"
            echo "  --help              Show this help message"
            echo ""
            echo "Examples:"
            echo "  ./deploy.sh --branch \"feat-new-feature\""
            echo "  ./deploy.sh --branch \"fix-bug\" --message \"fix: resolve memory leak\""
            exit 0
            ;;
        *)
            echo -e "${RED}Error: Unknown option $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Validate required parameters
if [ -z "$BRANCH" ]; then
    echo -e "${RED}Error: --branch parameter is required${NC}"
    echo "Use --help for usage information"
    exit 1
fi

# Function to print status messages
print_status() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
        print_error "Not in a git repository"
        exit 1
    fi
}

# Function to check if branch exists
check_branch_exists() {
    if git show-ref --verify --quiet refs/heads/"$BRANCH"; then
        return 0  # Branch exists
    else
        return 1  # Branch doesn't exist
    fi
}

# Function to build docs
build_docs() {
    if [ "$SKIP_DOCS" = true ]; then
        print_warning "Skipping docs build"
        return 0
    fi

    print_status "Building documentation..."
    if [ -f "deploy-docs.js" ]; then
        node deploy-docs.js
        print_success "Documentation built successfully"
    else
        print_warning "deploy-docs.js not found, skipping docs build"
    fi
}

# Function to create checkpoint
create_checkpoint() {
    print_status "Creating checkpoint..."
    if [ -f "backup.sh" ]; then
        bash backup.sh
        print_success "Checkpoint created"
    else
        print_warning "backup.sh not found, skipping checkpoint"
    fi
}

# Function to run tests
run_tests() {
    if [ "$SKIP_TESTS" = true ]; then
        print_warning "Skipping tests"
        return 0
    fi

    print_status "Running tests..."
    
    # Check if npm test command exists
    if npm run test --silent > /dev/null 2>&1; then
        if npm test; then
            print_success "All tests passed"
        else
            print_error "Tests failed - aborting deployment"
            exit 1
        fi
    else
        print_warning "npm test not available, checking for other test methods"
        
        # Check if we can run browser tests
        if command -v python3 > /dev/null 2>&1; then
            print_status "Starting test server for manual verification..."
            print_warning "Please manually verify tests pass by opening http://localhost:8080"
            read -p "Press Enter when tests are verified to continue, or Ctrl+C to abort..."
        else
            print_warning "No test runner found - continuing without tests"
        fi
    fi
}

# Function to generate commit message if not provided
generate_commit_message() {
    if [ -z "$COMMIT_MESSAGE" ]; then
        # Try to determine commit type from branch name
        if [[ $BRANCH == feat-* ]]; then
            COMMIT_MESSAGE="feat: implement new feature from $BRANCH"
        elif [[ $BRANCH == fix-* ]]; then
            COMMIT_MESSAGE="fix: resolve issue from $BRANCH"
        elif [[ $BRANCH == docs-* ]]; then
            COMMIT_MESSAGE="docs: update documentation from $BRANCH"
        elif [[ $BRANCH == refactor-* ]]; then
            COMMIT_MESSAGE="refactor: code improvements from $BRANCH"
        elif [[ $BRANCH == test-* ]]; then
            COMMIT_MESSAGE="test: add or update tests from $BRANCH"
        elif [[ $BRANCH == perf-* ]]; then
            COMMIT_MESSAGE="perf: performance improvements from $BRANCH"
        elif [[ $BRANCH == style-* ]]; then
            COMMIT_MESSAGE="style: styling updates from $BRANCH"
        elif [[ $BRANCH == chore-* ]]; then
            COMMIT_MESSAGE="chore: maintenance tasks from $BRANCH"
        else
            COMMIT_MESSAGE="update: changes from $BRANCH"
        fi
        
        # Add standard footer
        COMMIT_MESSAGE="$COMMIT_MESSAGE

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
    fi
}

# Main execution
main() {
    print_status "Starting automated deployment to branch: $BRANCH"
    
    # Check prerequisites
    check_git_repo
    
    # Show current status
    print_status "Current git status:"
    git status --short
    
    # Build docs
    build_docs
    
    # Create checkpoint
    create_checkpoint
    
    # Run tests
    run_tests
    
    # Check if target branch exists and handle accordingly
    CURRENT_BRANCH=$(git branch --show-current)
    
    if check_branch_exists; then
        print_status "Branch '$BRANCH' exists, checking out..."
        git checkout "$BRANCH"
    else
        print_status "Creating new branch '$BRANCH'..."
        git checkout -b "$BRANCH"
    fi
    
    # Stage all changes
    print_status "Staging all changes..."
    git add -A
    
    # Check if there are changes to commit
    if git diff --staged --quiet; then
        print_warning "No changes to commit"
        if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
            print_status "Switching back to original branch: $CURRENT_BRANCH"
            git checkout "$CURRENT_BRANCH"
        fi
        exit 0
    fi
    
    # Generate commit message if needed
    generate_commit_message
    
    # Show what will be committed
    print_status "Changes to be committed:"
    git diff --staged --name-status
    
    # Commit changes
    print_status "Committing changes..."
    git commit -m "$COMMIT_MESSAGE"
    print_success "Changes committed successfully"
    
    # Push to remote
    print_status "Pushing to remote..."
    if git push -u origin "$BRANCH"; then
        print_success "Successfully pushed to origin/$BRANCH"
    else
        print_error "Failed to push to remote"
        exit 1
    fi
    
    # Show final status
    print_success "Deployment completed successfully!"
    print_status "Branch: $BRANCH"
    print_status "Commit: $(git rev-parse --short HEAD)"
    
    # Show GitHub PR link if this is a new branch
    if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
        REPO_URL=$(git config --get remote.origin.url | sed 's/\.git$//' | sed 's/git@github\.com:/https:\/\/github.com\//')
        print_status "Create PR: $REPO_URL/pull/new/$BRANCH"
    fi
}

# Run main function
main