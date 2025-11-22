import * as Babel from "@babel/standalone";

Babel.registerPreset("tsx", {
  presets: [
    [Babel.availablePresets["typescript"], { isTSX: true, allExtensions: true }],
    Babel.availablePresets["react"]
  ]
});

export function transformModule(path: string, code: string): string {
  try {
    const result = Babel.transform(code, {
      presets: ["tsx"],
      filename: path,
      sourceMaps: false
    });

    return result.code || "";
  } catch (err: any) {
    throw new Error(`Transform error in ${path}: ${err.message}`);
  }
}
