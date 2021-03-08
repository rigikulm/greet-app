#!/usr/bin/env bash
# Creates the greetings-db DynamoDB table
#
# This is required for staging a local instance of DynamoDB which currently
# cannot be done via SAM.
echo "Listing records from greetings-db-dev..."

aws dynamodb scan --endpoint-url http://localhost:8080 --table-name greetings-db-dev
exit 0