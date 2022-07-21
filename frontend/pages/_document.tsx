import React from 'react'
import Document, {Html, Head, Main, NextScript, DocumentContext} from 'next/document'

interface WithNonceProp {
  nonce: string
}

const nonce = "aGVsbG93b3JsZAo="

class MyDocument extends Document<WithNonceProp> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    return {
      ...initialProps,
      nonce
    }
  }

  render() {
    return (
      <Html lang={"ja"}>
        <Head nonce={this.props.nonce}>
          <link rel="icon" href="/favicon.ico"/>
        </Head>
        <body>
        <Main/>
        <NextScript nonce={this.props.nonce}/>
        </body>
      </Html>
    )
  }
}

export default MyDocument
