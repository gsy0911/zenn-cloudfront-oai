# zenn-cloudfront-oai

# prepare to deploy

## export and upload contents

export `Next.js` contents

```shell
# `frontend/`ディレクトリ
$ npm run export
```

upload to S3

```shell
# `frontend/`ディレクトリ
$ aws s3 sync build s3://{YOUR_BUCKET_NAME}
```

## edit `params.ts`

```shell
# `infrastructure/`ディレクトリ
$ cp lib/params.example.ts lib/params.ts
```

edit `params.ts` with your parameters.

# deploy Lambda@Edge implemented with JavaScript

```shell
# `infrastructure/`ディレクトリ
$ cdk deploy example-cloudfront-oai-js --require-approval never
```

# deploy Lambda@Edge implemented with TypeScript

```shell
# `infrastructure/`ディレクトリ
$ cdk deploy example-lambda-edge --require-approval never
$ cdk deploy example-cloudfront-oai-ts --require-approval never
```



# references

- [Next.jsでStrict CSPを実現する](https://kotamat.com/post/nextjs-strict-csp/)
- [Next.js を S3 + CloudFront にデプロイする](https://zenn.dev/hamo/articles/0a96c4d27097bd)
- [オリジンアクセスアイデンティティ (OAI) を使用して Amazon S3 コンテンツへのアクセスを制限する](https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)
- [index.html を追加してファイル名を含まない URL をリクエストする](https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/example-function-add-index.html)
- [S3とCloudFrontでwebサイトを公開する際のバケット設定はどうすべきか？](https://horizoon.jp/post/2021/09/05/s3_website_hosting/)
- [[AWS CDK]S3 CloudFront OAI Route53 構成 で NextJSのSSG配信環境構築](https://tech-blog.s-yoshiki.com/entry/274)
