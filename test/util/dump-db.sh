#!/usr/bin/env bash
# Creates the greetings-db DynamoDB table
#
# This is required for staging a local instance of DynamoDB which currently
# cannot be done via SAM.
echo "Staging records into the greetings-db..."

aws dynamodb scan --endpoint-url http://localhost:8000 --table-name greetings-db
exit 0