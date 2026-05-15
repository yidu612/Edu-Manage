#!/bin/bash
set -e

BRANCH="projects-page"

git checkout "$BRANCH"

BASE_DATE=$(date -d "1 week ago" +"%Y-%m-%d")

commit_file() {
  FILE=$1
  MESSAGE=$2
  DATETIME=$3

  echo "Committing $FILE at $DATETIME"
  git add "$FILE"
  GIT_AUTHOR_DATE="$DATETIME" \
    GIT_COMMITTER_DATE="$DATETIME" \
    git commit -m "$MESSAGE"
}

DAY1="$BASE_DATE"

commit_file \
  "app/src/pages/projects/[id]/" \
  "add public project detail page" \
  "$DAY1 10:15:00"

echo "✅ Backdated commit created successfully."