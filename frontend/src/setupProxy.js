const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/socket", {
      target: "http://localhost:5000",
      changeOrigin: true,
    })
  );
};
