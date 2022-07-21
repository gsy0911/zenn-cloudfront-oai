#!/usr/bin/env node
import 'source-map-support/register';
import {App, Tags} from 'aws-cdk-lib';
import * as lib from '../lib';

const app = new App();

// Lambda@Edge
const LambdaEdge = new lib.LambdaEdgeStack(
  app,
  "example-lambda-edge",
  lib.paramsCloudFrontOaiStack,
  {env: lib.envUsEast1}
)
Tags.of(LambdaEdge).add("project", "cloudfront-oai")

// CloudFront
const cloudfrontOaiTs = new lib.CloudFrontOaiTsStack(
  app,
  "example-cloudfront-oai-ts",
  lib.paramsCloudFrontOaiStack,
  {env: lib.envApNortheast1}
)
const cloudfrontOaiJs = new lib.CloudFrontOaiJsStack(
  app,
  "example-cloudfront-oai-js",
  lib.paramsCloudFrontOaiStack,
  {env: lib.envApNortheast1}
)
Tags.of(cloudfrontOaiTs).add("project", "cloudfront-oai")
Tags.of(cloudfrontOaiJs).add("project", "cloudfront-oai")
