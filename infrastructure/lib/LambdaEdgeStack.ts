import {
  Stack,
  StackProps,
  aws_lambda,
  aws_lambda_nodejs,
  aws_iam,
} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {XRegionParam} from './XRegionParam';
import {environment, prefix} from './types';

export interface ILambdaEdgeStack {
  environment: environment
}

interface IDefLambdaFunctionProps {
  constructor: Construct
  environment: environment
  id: string
  lambdaNamePrefix: string
  dirName: string
  role: aws_iam.IRole
  functionResponsibility: "ts"
  handler: "handler" | string
}


const defNodejsFunction = (props: IDefLambdaFunctionProps): aws_lambda_nodejs.NodejsFunction => {

  const functionProps: aws_lambda_nodejs.NodejsFunctionProps = {
    functionName: `${props.lambdaNamePrefix}-edge-${props.environment}`,
    entry: `./lib/lambda/${props.functionResponsibility}_edge/${props.dirName}/index.ts`,
    handler: props.handler,
    role: props.role,
    bundling: {
      preCompilation: true,
      loader: {
        ".html": "text"
      }
    },
    runtime: aws_lambda.Runtime.NODEJS_16_X,
    architecture: aws_lambda.Architecture.X86_64,
    awsSdkConnectionReuse: false,
  }

  const lambdaFunction = new aws_lambda_nodejs.NodejsFunction(props.constructor, props.lambdaNamePrefix, functionProps)
  new aws_lambda.Alias(props.constructor, `${props.lambdaNamePrefix}CfAlias`, {
    aliasName: 'latest',
    version: lambdaFunction.currentVersion,
  })
  new XRegionParam(props.constructor, `x-region-param-${props.lambdaNamePrefix}`, {
    region: "ap-northeast-1"
  }).putSsmParameter({
    parameterName: `/${prefix}/${props.environment}/${props.id}/${props.lambdaNamePrefix}`,
    parameterValue: `${lambdaFunction.functionArn}:${lambdaFunction.currentVersion.version}`,
    parameterDataType: "text",
    idName: `x-region-param-id-${props.id}`
  })
  return lambdaFunction
}

export class LambdaEdgeStack extends Stack {
  constructor(scope: Construct, id: string, params: ILambdaEdgeStack, props?: StackProps) {
    super(scope, id, props);

    /** lambda role */
    const role = new aws_iam.Role(this, 'lambdaRole', {
      roleName: `${prefix}-lambda-role`,
      assumedBy: new aws_iam.CompositePrincipal(
        new aws_iam.ServicePrincipal('lambda.amazonaws.com'),
        new aws_iam.ServicePrincipal('edgelambda.amazonaws.com'),
      ),
      managedPolicies: [
        aws_iam.ManagedPolicy.fromManagedPolicyArn(this, 'CWFullAccess', 'arn:aws:iam::aws:policy/CloudWatchFullAccess')
      ]
    })

    defNodejsFunction({
      constructor: this,
      environment: params.environment,
      id,
      lambdaNamePrefix: `rewriteTrailingSlash`,
      dirName: "rewrite-trailing-slash",
      role,
      functionResponsibility: "ts",
      handler: "handler"
    })
  }
}
