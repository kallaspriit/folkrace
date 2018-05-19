import * as CopyWebpackPlugin from "copy-webpack-plugin";
import * as MiniCssExtractPlugin from "mini-css-extract-plugin";
import * as path from "path";
import { Configuration } from "webpack";

const config: Configuration = {
  mode: "development",
  entry: "./src/main.ts",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js",
  },
  resolve: {
    extensions: [".ts", ".scss", ".css"],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          // "style-loader", // creates style nodes from JS strings
          "css-loader", // translates CSS into CommonJS
          "sass-loader", // compiles Sass to CSS
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
    new CopyWebpackPlugin([
      {
        from: "./src/*.html",
        flatten: true,
      },
    ]),
  ],
  // devtool: "source-map",
};

export default config;
