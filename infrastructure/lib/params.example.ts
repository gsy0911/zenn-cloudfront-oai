import {ICloudFrontOaiStack} from './CloudFrontOaiStack';
import {ILambdaEdgeStack} from './LambdaEdgeStack';
import {
  Environment
} from 'aws-cdk-lib';

const newlyGenerateS3BucketBaseName: string = "newly-generate-s3-bucket-base-name"
const accountId: string = "00001111222"
const domain: string = "your.domain.com"
const subDomain: string = `app.${domain}`

export const paramsCloudFrontOaiStack: ICloudFrontOaiStack = {
  s3: {
    bucketName: newlyGenerateS3BucketBaseName,
  },
  cloudfront: {
    certificate: `arn:aws:acm:us-east-1:${accountId}:certificate/{unique-id}`,
    route53DomainName: domain,
    route53RecordName: subDomain
  },
  next: {
    // fronteond/pages/_document.tsxのnonceと一致させる
    nonce: "aGVsbG93b3JsZAo="
  },
  environment: "prod",
  lambdaEdgeStackId: "example-lambda-edge"
}

export const paramsLambdaEdgeStack: ILambdaEdgeStack = {
  environment: "prod"
}

export const envApNortheast1: Environment = {
  account: accountId,
  region: "ap-northeast-1"
}

export const envUsEast1: Environment = {
  account: accountId,
  region: "us-east-1"
}
