#!/bin/bash

# This will be run as part of .github/workflows/release.yml

# From https://github.com/unegma/bash-functions/blob/main/update.sh, with some added fixes and removal of npm commands

VERSION=""

#get parameters
while getopts v: flag
do
  case "${flag}" in
    v) VERSION=${OPTARG};;
  esac
done

#get highest tag number
CURRENT_VERSION=`git describe --abbrev=0 --tags 2>/dev/null`
echo "Current Version: $CURRENT_VERSION"

#replace . with space so can split into an array
CURRENT_VERSION_PARTS=(${CURRENT_VERSION//./ })

#get number parts and remove 'v' prefix
VMAJOR=${CURRENT_VERSION_PARTS[0]:1}
VMINOR=${CURRENT_VERSION_PARTS[1]}
VPATCH=${CURRENT_VERSION_PARTS[2]}

if [[ $VERSION == 'major' ]]
then
  VMAJOR=$((VMAJOR+1))
  VMINOR=0
  VPATCH=0
elif [[ $VERSION == 'minor' ]]
then
  VMINOR=$((VMINOR+1))
  VPATCH=0
elif [[ $VERSION == 'patch' ]]
then
  VPATCH=$((VPATCH+1))
else
  echo "No version type (https://semver.org/) or incorrect type specified, try: -v [major, minor, patch]"
  exit 1
fi


#create new tag
NEW_TAG="v$VMAJOR.$VMINOR.$VPATCH"
echo "($VERSION) updating $CURRENT_VERSION to $NEW_TAG"

#get current hash and see if it already has a tag
GIT_COMMIT=`git rev-parse HEAD`
NEEDS_TAG=`git describe --contains $GIT_COMMIT 2>/dev/null`

#only tag if no tag already
if [ -z "$NEEDS_TAG" ]; then
  git tag -a $NEW_TAG -m $NEW_TAG
  echo "Tagged with $NEW_TAG"
  git push --tags
  exit 0
else
  echo "Already a tag on this commit"
  exit 1
fi
