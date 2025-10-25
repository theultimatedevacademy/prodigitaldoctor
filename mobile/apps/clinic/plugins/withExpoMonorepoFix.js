const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function withExpoMonorepoFix(config) {
  return withDangerousMod(config, [
    "android",
    (config) => {
      const settingsPath = path.join(
        config.modRequest.projectRoot,
        "android",
        "settings.gradle"
      );
      let content = fs.readFileSync(settingsPath, "utf8");
      if (!content.includes("useExpoModules()")) return config;

      // Patch: skip useExpoModules() for :app
      content = content.replace(
        /useExpoModules\(\)/g,
        `if (rootProject.name != "app") {
  useExpoModules()
}`
      );

      fs.writeFileSync(settingsPath, content);
      return config;
    },
  ]);
};
