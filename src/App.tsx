"use client";

import { useState, useEffect } from "react";
import { Settings, X } from "lucide-react";
import Papa from "papaparse";
import Timer from "./Timer";

import SplashCursor from "./components/SplashCursor";

const promptFiles = import.meta.glob("/src/assets/prompts/*", {
  eager: true,
  as: "raw",
});

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [selectedFile, setSelectedFile] =
    useState<string>("Normal_Prompts.csv");
  const [settingsOptions, setSettingsOptions] = useState<
    Record<string, string[]>
  >({});
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  const [timerEnabled, setTimerEnabled] = useState(true);
  const [prepMinutes, setPrepMinutes] = useState(2);
  const [speechMinutes, setSpeechMinutes] = useState(5);

  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [promptCount, setPromptCount] = useState(1);

  const [cursorEffect, setCursorEffect] = useState<"none" | "pixel" | "splash">(
    "none"
  );

  useEffect(() => {
    if (!selectedFile) {
      setSettingsOptions({});
      setSelectedOptions({});
      return;
    }

    const content = promptFiles[
      `/src/assets/prompts/${selectedFile}`
    ] as string;
    const parsed = Papa.parse(content, { header: true });

    const columnValues: Record<string, Set<string>> = {};

    parsed.data.forEach((row: any) => {
      Object.entries(row).forEach(([key, value]) => {
        if (!value) return;
        if (!columnValues[key]) columnValues[key] = new Set();
        // if (key == "Prompt") return; // Skips Prompts column
        columnValues[key].add(String(value));
      });
    });

    const options: Record<string, string[]> = {};
    const initialSelected: Record<string, string> = {};
    Object.entries(columnValues).forEach(([col, values]) => {
      options[col] = Array.from(values);
      initialSelected[col] = "";
    });

    setSettingsOptions(options);
    setSelectedOptions(initialSelected);
  }, [selectedFile]);

  const handleOptionChange = (column: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [column]: value }));
  };

  const handlePromptCountChange = (value: number) => {
    setPromptCount(value);
  };

  const promptFileNames = Object.keys(promptFiles).map(
    (path) => path.split("/").pop() || path
  );

  // Check if the row matches all selected options
  const isValidPrompt = (
    row: Record<string, string>,
    selected: Record<string, string>
  ) => {
    return Object.entries(selected).every(([col, val]) => {
      if (!val) return true; // "All" option, skip filtering
      return row[col] === val;
    });
  };

  const generatePrompts = () => {
    const content = promptFiles[
      `/src/assets/prompts/${selectedFile}`
    ] as string;
    const parsed = Papa.parse(content, { header: true });

    const prompts: string[] = [];

    while (prompts.length < promptCount && parsed.data.length > 0) {
      const row = parsed.data[
        Math.floor(Math.random() * parsed.data.length)
      ] as Record<string, string>;

      const promptText = row.Prompt;

      if (!promptText) continue;
      if (prompts.includes(promptText)) continue;

      if (isValidPrompt(row, selectedOptions)) {
        prompts.push(promptText);
      }
    }

    setSelectedPrompts(prompts);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Cursor effects */}

      {cursorEffect === "splash" && <SplashCursor />}

      {/* Foreground */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6 min-h-screen p-6">
        {/* Main Card */}
        <div className="w-full max-w-lg bg-white/20 shadow-xl backdrop-blur-md rounded-2xl p-6 border border-white/30 animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-3xl font-bold drop-shadow-sm hover">
              Impromptu Generator
            </h2>
            <Settings
              size={28}
              className="text-white cursor-pointer hover:rotate-90 transition-transform duration-300 hover"
              onClick={() => setSettingsOpen(true)}
            />
          </div>

          {/* Prompts Section */}
          {selectedPrompts.length > 0 && (
            <div className="mb-6 animate-slideUp">
              <p className="text-white/80 font-semibold mb-2">Your Prompts:</p>
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                {selectedPrompts.map((prompt) => (
                  <span
                    key={prompt}
                    className="px-3 py-2 mx-2 bg-gradient-to-r from-pink-400/70 to-purple-500/70 text-white rounded-lg text-sm shadow-sm hover:scale-[1.02] transition-transform"
                  >
                    {prompt}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold hover:opacity-90 hover:scale-[1.02] shadow-md transition-all duration-300"
            onClick={() => generatePrompts()}
          >
            Generate Prompts
          </button>
        </div>

        {/* Timer Window (only if enabled) */}
        {timerEnabled && (
          <Timer prepMinutes={prepMinutes} speechMinutes={speechMinutes} />
        )}

        {/* Settings Modal */}
        {settingsOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 animate-fadeIn">
            <div className="w-full max-w-2xl bg-white/95 rounded-2xl shadow-2xl p-6 relative animate-slideUp">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 text-2xl font-bold">Settings</h3>
                <X
                  size={28}
                  className="text-gray-600 cursor-pointer hover:text-gray-900 hover:rotate-90 transition-transform duration-300"
                  onClick={() => setSettingsOpen(false)}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="table w-full">
                  <tbody>
                    {/* Prompts Select */}
                    <tr>
                      <td className="font-medium text-gray-800">Prompts</td>
                      <td>
                        <select
                          className="w-full rounded-xl border border-gray-300 bg-white/80 px-3 py-2 text-gray-800 shadow-sm mb-3"
                          value={selectedFile}
                          onChange={(e) => setSelectedFile(e.target.value)}
                        >
                          <option disabled value="">
                            Select Prompt
                          </option>
                          {promptFileNames.map((file) => (
                            <option key={file} value={file}>
                              {file}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>

                    {/* Extra Filters */}
                    {Object.entries(settingsOptions).map(
                      ([column, options]) =>
                        column !== "Prompt" && (
                          <tr key={column}>
                            <td className="font-medium text-gray-800">
                              {column}
                            </td>
                            <td>
                              <select
                                className="w-full rounded-xl border border-gray-300 bg-white/80 px-3 py-2 text-gray-800 shadow-sm mb-3"
                                value={selectedOptions[column]}
                                onChange={(e) =>
                                  handleOptionChange(column, e.target.value)
                                }
                              >
                                <option value="">All</option>
                                {options.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        )
                    )}

                    {/* Prompt Count */}
                    <tr className="border-t">
                      <td className="font-medium text-gray-800">
                        Prompt Count
                      </td>
                      <td>
                        <select
                          className="w-full rounded-xl border border-gray-300 bg-white/80 px-3 py-2 text-gray-800 shadow-sm my-3"
                          onChange={(e) =>
                            handlePromptCountChange(Number(e.target.value))
                          }
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                        </select>
                      </td>
                    </tr>

                    {/* NEW: Timer Settings */}
                    <tr className="border-t">
                      <td className="font-medium text-gray-800">
                        Enable Timer
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={timerEnabled}
                          onChange={(e) => setTimerEnabled(e.target.checked)}
                          className="w-5 h-5 accent-indigo-500 my-3"
                        />
                      </td>
                    </tr>
                    {timerEnabled && (
                      <>
                        <tr>
                          <td className="font-medium text-gray-800">
                            Prep Minutes
                          </td>
                          <td>
                            <input
                              type="number"
                              value={prepMinutes}
                              min={1}
                              onChange={(e) =>
                                setPrepMinutes(Number(e.target.value))
                              }
                              className="w-full rounded-xl border border-gray-300 bg-white/80 px-3 py-2 text-gray-800 shadow-sm mb-3"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="font-medium text-gray-800">
                            Speech Minutes
                          </td>
                          <td>
                            <input
                              type="number"
                              value={speechMinutes}
                              min={1}
                              onChange={(e) =>
                                setSpeechMinutes(Number(e.target.value))
                              }
                              className="w-full rounded-xl border border-gray-300 bg-white/80 px-3 py-2 text-gray-800 shadow-sm mb-3"
                            />
                          </td>
                        </tr>
                      </>
                    )}

                    <tr>
                      <td className="font-medium text-gray-800">
                        Cursor Effect
                      </td>
                      <td>
                        <select
                          className="w-full rounded-xl border border-gray-300 bg-white/80 px-3 py-2 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          value={cursorEffect}
                          onChange={(e) =>
                            setCursorEffect(
                              e.target.value as "none" | "pixel" | "splash"
                            )
                          }
                        >
                          <option value="none">None</option>
                          {/* <option value="pixel">Pixel Trail</option> */}
                          <option value="splash">Splash Cursor</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
