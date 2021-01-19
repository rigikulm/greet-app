# Typescript and SAM Sample Lambda Project
Basic project that shows how to leverage typescript and AWS SAM for
developing Lambda functions.

## Project Structure
This is an opinionated project structure, however, the good news is that the
`aws-sam-webpack-plugin` is fairly agnostic on project structure since it
parses the template.yaml file in order to locate the lambda function code.

```
<Project Root>
├── LICENSE
├── README.md
├── jest.config.js
├── package-lock.json
├── package.json
├── src
│   ├── functions
│   ├── goodbye
│   │   ├── handler.test.ts
│   │   └── handler.ts
│   ├── hello
│   │   ├── handler.test.ts
│   │   └── handler.ts
│   ├── layers
│   └── lib
│       ├── response.test.ts
│       └── response.ts
├── template.yaml
├── tsconfig.json
└── webpack.config.ts
```

### Naming Conventions
When deployed, the following naming convention will be used for the lambda functions:

    <service-name>-<env>-<function-name>

For example, a Notes service might have the following lambda functions:

    notes-dev-create-note
    notes-dev-update-note
    notes-dev-get-note
    notes-dev-delete-note
    notes-dev-get-notes

### AWS Tag Conventions
Project
Service
Owner
STAGE

### CLI Commands
- `npm run build` - builds the package via webpack. Use this instead of 'sam build'.
- `npm run test` - runs jest and provides a coverage report
- `sam deploy --guided` - deploys the project and queries for project settings
- `sam deploy --config-env 'dev' --config-file ./samconfig.toml` - deploys using the config file
- `npm run startdb` - starts the local dynamodb instance using docker on port 8000
- `npm run createdb` - creates the table in the locally running dynamodb instance
- `npm run stagedb` - adds sample records to the local dynamodb instance
- `npm run dumpdb` - lists all of the records in the local dynamodb instance
- `aws dynamodb create-table --endpoint-url http://localhost:8000 --cli-input-json file://greetings-table.json`
- `aws dynamodb batch-write-item --endpoint-url http://localhost:8000 --request-items file://greetings-items.json`
- `aws dynamodb scan --endpoint-url http://localhost:8000 --table-name "greetings-db"`
- `sam local invoke HelloFunction --docker-network sam-local` - invokes a single function once

> Notes:
> - startdb requires docker and the amazon/dynamodb-local image
> - createdb, stagedb, and dumpdb require the AWS CLI

## Todo
- AWS SAM [Policy Templates](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-policy-templates.html) to control access to resources
- Mock tutorial for Dynamo
- Write DB code in the lambdas
- 
