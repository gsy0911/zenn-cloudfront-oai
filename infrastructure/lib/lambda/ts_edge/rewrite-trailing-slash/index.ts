import {CloudFrontRequestHandler} from "aws-lambda";

export const handler: CloudFrontRequestHandler = async (event) => {
  const request = event.Records[0].cf.request;
  const uri = request.uri;
  // ファイル名 ("/" で区切られたパスの最後) を取得
  const filename = uri.split("/").pop();

  if (uri.endsWith("/")) {
    request.uri = request.uri.concat("index.html");
  } else if (filename) {
    if (!filename.includes(".")) {
      // ファイル名に拡張子がついていない場合、 "/index.html" をつける
      request.uri = request.uri.concat("/index.html");
    }
  }
  return request
}
