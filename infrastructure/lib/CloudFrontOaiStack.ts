import {
  App,
  Stack,
  StackProps,
  aws_certificatemanager as acm,
  aws_route53,
  aws_route53_targets,
  aws_s3,
  aws_cloudfront,
  aws_cloudfront_origins,
  aws_ssm,
  aws_lambda,
  Duration,
} from 'aws-cdk-lib';
import * as path from "path";
import {prefix, environment} from './types';


export interface ICloudFrontOaiStack {
  s3: {
    bucketName: string
  }
  cloudfront: {
    /** us-east-1のACMのARN*/
    certificate: `arn:aws:acm:us-east-1:${string}:certificate/${string}`
    route53DomainName: string
    route53RecordName: string
  }
  next: {
    nonce: string
  }
  environment: environment
  lambdaEdgeStackId: string
}

export class CloudFrontOaiTsStack extends Stack {

  constructor(scope: App, id: string, params: ICloudFrontOaiStack, props?: StackProps) {
    super(scope, id, props);

    // Lambda@Edge
    const rewriteTrailingSlashParam = aws_ssm.StringParameter.fromStringParameterAttributes(this, 'rewriteTrailingSlashParam', {
      parameterName: `/${prefix}/${params.environment}/${params.lambdaEdgeStackId}/rewriteTrailingSlash`,
    }).stringValue;
    const rewriteTrailingSlashVersion = aws_lambda.Version.fromVersionArn(this, "rewriteTrailingSlashVersion", rewriteTrailingSlashParam)

    // ACM
    const certificate = acm.Certificate.fromCertificateArn(this, "virginiaCertificate", params.cloudfront.certificate)
    // Header Policy
    const responseHeadersPolicy = new aws_cloudfront.ResponseHeadersPolicy(this, "custom-rhp", {
      responseHeadersPolicyName: "custom-rhp",
      securityHeadersBehavior: {
        contentSecurityPolicy: {
          contentSecurityPolicy: `object-src 'self'; img-src 'self'; script-src 'self' 'nonce-${params.next.nonce}'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'`,
          override: true
        },
        contentTypeOptions: {override: true},
        frameOptions: {
          frameOption: aws_cloudfront.HeadersFrameOption.SAMEORIGIN,
          override: true
        },
        referrerPolicy: {
          referrerPolicy: aws_cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
          override: true
        },
        strictTransportSecurity: {
          accessControlMaxAge: Duration.seconds(15768000),
          override: true
        },
        xssProtection: {
          protection: true,
          modeBlock: true,
          override: true
        }
      }
    })
    // origin
    const s3Bucket = aws_s3.Bucket.fromBucketName(this, "sourceS3", params.s3.bucketName)
    const s3Origin = new aws_cloudfront_origins.S3Origin(s3Bucket)
    const distribution = new aws_cloudfront.Distribution(this, "frontend-distribution", {
      defaultBehavior: {
        origin: s3Origin,
        edgeLambdas: [
          {
            functionVersion: rewriteTrailingSlashVersion,
            eventType: aws_cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST
          }
        ],
        viewerProtocolPolicy: aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        responseHeadersPolicy: responseHeadersPolicy,
      },
      defaultRootObject: "index.html",
      certificate: certificate,
      domainNames: [params.cloudfront.route53RecordName],
      sslSupportMethod: aws_cloudfront.SSLMethod.SNI,
      minimumProtocolVersion: aws_cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021
    })

    // Route 53 for cloudfront
    const cloudfrontHostedZone = aws_route53.HostedZone.fromLookup(this, "cloudfront-hosted-zone", {
      domainName: params.cloudfront.route53DomainName
    })
    new aws_route53.ARecord(this, "cloudfront-a-record", {
      zone: cloudfrontHostedZone,
      recordName: params.cloudfront.route53RecordName,
      target: aws_route53.RecordTarget.fromAlias(new aws_route53_targets.CloudFrontTarget(distribution))
    })
  }
}


export class CloudFrontOaiJsStack extends Stack {

  constructor(scope: App, id: string, params: ICloudFrontOaiStack, props?: StackProps) {
    super(scope, id, props);

    // Lambda@Edge
    const dir = path.resolve(__dirname, 'lambda', 'js_edge', 'rewrite-trailing-slash')
    const rewriteTrailingSlashVersion = new aws_cloudfront.experimental.EdgeFunction(this, "edge-origin-request", {
      code: aws_lambda.Code.fromAsset(dir),
      functionName: "origin-request",
      handler: `index.handler`,
      runtime: aws_lambda.Runtime.NODEJS_16_X,
      memorySize: 512,
      timeout: Duration.seconds(5),
      architecture: aws_lambda.Architecture.X86_64,
    })

    // ACM
    const certificate = acm.Certificate.fromCertificateArn(this, "virginiaCertificate", params.cloudfront.certificate)
    // Header Policy
    const responseHeadersPolicy = new aws_cloudfront.ResponseHeadersPolicy(this, "custom-rhp", {
      responseHeadersPolicyName: "custom-rhp",
      securityHeadersBehavior: {
        contentSecurityPolicy: {
          contentSecurityPolicy: `object-src 'self'; img-src 'self'; script-src 'self' 'nonce-${params.next.nonce}'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'`,
          override: true
        },
        contentTypeOptions: {override: true},
        frameOptions: {
          frameOption: aws_cloudfront.HeadersFrameOption.SAMEORIGIN,
          override: true
        },
        referrerPolicy: {
          referrerPolicy: aws_cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
          override: true
        },
        strictTransportSecurity: {
          accessControlMaxAge: Duration.seconds(15768000),
          override: true
        },
        xssProtection: {
          protection: true,
          modeBlock: true,
          override: true
        }
      }
    })
    // origin
    const s3Bucket = aws_s3.Bucket.fromBucketName(this, "sourceS3", params.s3.bucketName)
    const s3Origin = new aws_cloudfront_origins.S3Origin(s3Bucket)
    const distribution = new aws_cloudfront.Distribution(this, "frontend-distribution", {
      defaultBehavior: {
        origin: s3Origin,
        edgeLambdas: [
          {
            functionVersion: rewriteTrailingSlashVersion,
            eventType: aws_cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST
          }
        ],
        viewerProtocolPolicy: aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        responseHeadersPolicy: responseHeadersPolicy,
      },
      defaultRootObject: "index.html",
      certificate: certificate,
      domainNames: [params.cloudfront.route53RecordName],
      sslSupportMethod: aws_cloudfront.SSLMethod.SNI,
      minimumProtocolVersion: aws_cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021
    })

    // Route 53 for cloudfront
    const cloudfrontHostedZone = aws_route53.HostedZone.fromLookup(this, "cloudfront-hosted-zone", {
      domainName: params.cloudfront.route53DomainName
    })
    new aws_route53.ARecord(this, "cloudfront-a-record", {
      zone: cloudfrontHostedZone,
      recordName: params.cloudfront.route53RecordName,
      target: aws_route53.RecordTarget.fromAlias(new aws_route53_targets.CloudFrontTarget(distribution))
    })
  }
}
