#!/bin/sh
# Replace commits authored/committed as Dev / dev@local with the provided name/email
if [ "$GIT_COMMITTER_NAME" = "Dev" ] || [ "$GIT_COMMITTER_EMAIL" = "dev@local" ]; then
  export GIT_COMMITTER_NAME='Mimanshu Gahlaut'
  export GIT_COMMITTER_EMAIL='mimanshugahlaut10@gmail.com'
fi
if [ "$GIT_AUTHOR_NAME" = "Dev" ] || [ "$GIT_AUTHOR_EMAIL" = "dev@local" ]; then
  export GIT_AUTHOR_NAME='Mimanshu Gahlaut'
  export GIT_AUTHOR_EMAIL='mimanshugahlaut10@gmail.com'
fi
