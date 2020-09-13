module.exports = {
  stories: ["../src/**/*.stories.tsx"],
  // TODO: consider https://github.com/hipstersmoothie/storybook-addon-react-docgen/
  addons: [
    "@storybook/preset-create-react-app",
    "@storybook/addon-knobs/register",
    "@storybook/addon-actions",
    "@storybook/addon-links",
  ],
};
