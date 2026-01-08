#!/bin/bash

# Check if the commit message contains [skip ci]
if [[ "$VERCEL_GIT_COMMIT_MESSAGE" == *"[skip ci]"* ]]; then
  echo "🛑 - Build cancelled (skip ci)"
  exit 0;
fi

# Check if only documentation or non-code files changed
if git diff --name-only "$VERCEL_GIT_PREVIOUS_SHA" "$VERCEL_GIT_COMMIT_SHA" | grep -qvE '(\.md$|\.png$|\.jpg$|\.jpeg$|\.svg$|LICENSE)'; then
  echo "✅ - Build can proceed"
  exit 1;
else
  echo "🛑 - Build cancelled (only non-code files changed)"
  exit 0;
fi
