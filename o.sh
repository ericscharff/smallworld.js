#!/bin/bash

# Convenient when you're using lots of in-browser terminals.

set -eu

MAXLEN=74994
TARGET=$1

if [ -f $TARGET ]; then
	echo "Copying $TARGET to clipboard" >&2
	DATA=$( cat "$TARGET" )
	LEN=$( cat "$TARGET" | wc -c )
	if [ "$LEN" -gt "$MAXLEN" ]; then
	   printf "Input is %d bytes too long" "$(( LEN - MAXLEN ))" >&2
	fi
	printf "\033]52;c;$(printf %s "$DATA" | head -c $MAXLEN | base64 | tr -d '\n\r')\a"
else
	echo "No such file: $1"
fi
