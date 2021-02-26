module.exports = {
  api: {
    bodyParser: false,
  },
  async rewrites() {
    return [
      // Rewrite everything else to use `pages/index`
      {
        source: '/:path*',
        destination: '/',
      },
    ]
  },
}
