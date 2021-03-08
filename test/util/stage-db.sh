#!/usr/bin/env bash
# Creates the greetings-db DynamoDB table
#
# This is required for staging a local instance of DynamoDB which currently
# cannot be done via SAM.
echo "Staging records into the greetings-db..."

# Move to the directory where this script is located which contains the JSON files
cd `dirname $0`
aws dynamodb batch-write-item --endpoint-url http://localhost:8080 --request-items file://greetings-items.json
exit 0