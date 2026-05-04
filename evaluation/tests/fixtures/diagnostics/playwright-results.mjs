export const failedPlaywrightResult = {
  suites: [
    {
      title: "reservation form",
      suites: [],
      specs: [
        {
          title: "shows validation message when name is missing",
          file: "evaluation/tests/integration/reservation-form.spec.mjs",
          line: 42,
          tests: [
            {
              projectName: "chromium",
              results: [
                {
                  status: "failed",
                  error: {
                    message: "Error: expect(locator).toHaveText(expected)",
                    stack:
                      "Error: expect(locator).toHaveText(expected)\n    at reservation-form.spec.mjs:42:10",
                    expected: "Please fill out this field.",
                    actual: "",
                  },
                  attachments: [
                    {
                      name: "screenshot",
                      contentType: "image/png",
                      path: "evaluation/runs/run-1/artifacts/name-missing.png",
                    },
                    {
                      name: "trace",
                      contentType: "application/zip",
                      path: "evaluation/runs/run-1/artifacts/trace.zip",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const passedPlaywrightResult = {
  suites: [
    {
      title: "reservation form",
      suites: [],
      specs: [
        {
          title: "opens reservation popup",
          file: "evaluation/tests/integration/reservation-form.spec.mjs",
          line: 10,
          tests: [
            {
              projectName: "chromium",
              results: [{ status: "passed", attachments: [] }],
            },
          ],
        },
      ],
    },
  ],
};
