import * as CopyWebpackPlugin from "copy-webpack-plugin";
import * as MiniCssExtractPlugin from "mini-css-extract-plugin";
import * as path from "path";
import { Configuration } from "webpack";

const config: Configuration = {
  mode: "development",
  entry: "./src/main.tsx",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js",
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".scss", ".css"],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "awesome-typescript-loader", options: { silent: true } },
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(png|jpg|gif|svg|ttf)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 100000000,
            },
          },
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
  devtool: "source-map",
  stats: "minimal",
};

export default config;
