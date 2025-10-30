"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";

interface Gesture {
  letter: string;
  image_path: string;
  type: 'sign' | 'fingerspell' | 'space';
  isSpace: boolean;
}

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [gestures, setGestures] = useState<Gesture[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentGestureIndex, setCurrentGestureIndex] = useState(0);
  const [completedSequence, setCompletedSequence] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start recording
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/mp3",
        });
        await fetchAudioToSign(audioBlob);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => {
            track.stop();
          });
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("ERROR in startRecording:", error);
      alert("Unable to access microphone. Please check permissions.");
    }
  }

  // Stop recording
  function stopRecording() {
    if (!mediaRecorderRef.current) return;

    const state = mediaRecorderRef.current.state;

    if (state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  // Handle click wrapper
  const handleRecordingClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Handle video file upload
  async function handleVideoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Please select a valid video file");
      return;
    }

    await fetchAudioToSign(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // Fetch audio and convert to sign
  async function fetchAudioToSign(audioBlob: Blob) {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("audioFile", audioBlob, "recording.mp3");

      const response = await fetch("http://127.0.0.1:8000/api/asl_with_audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aslGloss = data.asl_gloss || data.alsgloss;

      // Check if aslGloss is empty or only whitespace
      if (!aslGloss || aslGloss.trim() === "") {
        alert("No speech detected. Please try again.");
        setTranscript("No speech detected");
        setGestures([]);
        setCurrentGestureIndex(0);
        setCompletedSequence("");
        setIsLoading(false);
        return;
      }

      setTranscript(aslGloss);

      const gestureResponse = await fetch("/api/getSignVisual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          asl_gloss: aslGloss,
        }),
      });

      if (!gestureResponse.ok) {
        throw new Error(`Gesture API error! status: ${gestureResponse.status}`);
      }

      const gestureData = await gestureResponse.json();

      // Keep all gestures including 'space' type (which will show Nothing image)
      const allGestures = gestureData.gesture_sequence;

      setGestures(allGestures);
      setCurrentGestureIndex(0);
      setCompletedSequence("");
    } catch (error) {
      console.error("Error uploading audio:", error);
      alert("Failed to process audio. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const delayBetweenGestures = 800;
  const isDisabled = isLoading || isRecording;

  // Auto-advance and auto-reset when finished
  useEffect(() => {
    if (gestures.length === 0 || currentGestureIndex >= gestures.length) {
      return;
    }

    const timer = setTimeout(() => {
      // Update completed sequence with current letter (if not a space)
      if (!gestures[currentGestureIndex].isSpace) {
        setCompletedSequence(prev => prev + gestures[currentGestureIndex].letter);
      } else {
        setCompletedSequence(prev => prev + " ");
      }

      if (currentGestureIndex < gestures.length - 1) {
        setCurrentGestureIndex(prev => prev + 1);
      } else {
        // Auto-reset when finished
        setTimeout(() => {
          setGestures([]);
          setTranscript("");
          setCurrentGestureIndex(0);
          setCompletedSequence("");
        }, 5000); // 1 second delay before reset
      }
    }, delayBetweenGestures);

    return () => clearTimeout(timer);
  }, [currentGestureIndex, gestures.length, delayBetweenGestures, gestures]);

  return (
    <div className="flex flex-col h-screen w-screen bg-linear-to-br from-slate-950 via-purple-950 to-slate-950 overflow-hidden select-none relative">
      {/* Animated gradient blobs in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 30, -30, 0],
            y: [0, 40, -40, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-linear-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -40, 40, 0],
            y: [0, -50, 50, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-linear-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Display Area */}
      <div className="flex-1 w-full flex justify-center items-center px-4 relative z-10">
        {gestures.length > 0 ? (
          // Gesture Display Mode
          <motion.div
            className="bg-linear-to-br from-slate-800/50 to-purple-900/30 border border-purple-500/30 backdrop-blur-xl p-12 rounded-2xl shadow-2xl max-w-4xl w-full"
          >
            <div className="text-center">
              {/* Current Gesture Display */}
              <motion.div
                key={currentGestureIndex}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
                className="mb-8 min-h-80 flex items-center justify-center"
              >
                <img
                  src={gestures[currentGestureIndex]?.image_path}
                  alt={gestures[currentGestureIndex]?.letter}
                  className="max-h-96 max-w-full object-contain"
                />
              </motion.div>

              {/* Current Letter label (empty for spaces) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-purple-400 to-pink-400 mb-4 min-h-10">
                  {!gestures[currentGestureIndex]?.isSpace && gestures[currentGestureIndex]?.letter}
                </p>
                <p className="text-slate-400 text-sm">
                  {currentGestureIndex + 1} / {gestures.length}
                </p>
              </motion.div>

              {/* Completed sequence */}
              <motion.div
                className="mt-8 p-4 bg-slate-700/20 rounded-lg border border-purple-400/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-slate-400 text-sm mb-2">Sequence:</p>
                <p className="text-xl font-semibold text-cyan-400 wrap-break-words">
                  {completedSequence || "—"}
                </p>
              </motion.div>

              {/* Progress bar */}
              <motion.div className="mt-6 w-full bg-slate-700/30 rounded-full h-1 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentGestureIndex + 1) / gestures.length) * 100}%`,
                  }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-linear-to-r from-cyan-400 to-purple-400"
                />
              </motion.div>
            </div>

            {/* Auto-advance timer effect */}
            {currentGestureIndex < gestures.length - 1 && (
              <motion.div
                className="absolute bottom-4 right-4"
                animate={{ rotate: 360 }}
                transition={{
                  duration: delayBetweenGestures / 1000,
                  repeat: Infinity,
                }}
              >
                <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full" />
              </motion.div>
            )}
          </motion.div>
        ) : (
          // Default Display Mode
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            key={transcript}
            transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
            className="bg-linear-to-br from-slate-800/50 to-purple-900/30 border border-purple-500/30 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-2xl w-full"
          >
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-purple-400 to-pink-400 min-h-16 flex items-center justify-center leading-relaxed">
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="inline-block text-3xl"
                  >
                    ✨
                  </motion.div>
                ) : transcript ? (
                  transcript
                ) : (
                  <span className="text-slate-400">Awaiting input...</span>
                )}
              </h1>
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="h-32 w-screen flex items-center justify-center gap-6 pb-8 px-4 relative z-10 flex-wrap">
        {/* Recording button */}
        <div onClick={handleRecordingClick}>
          <motion.button
            disabled={isDisabled}
            whileHover={{ scale: isDisabled ? 1 : 1.06 }}
            whileTap={{ scale: isDisabled ? 1 : 0.94 }}
            animate={
              isRecording
                ? {
                    boxShadow: [
                      "0 0 15px rgba(239, 68, 68, 0.5)",
                      "0 0 30px rgba(239, 68, 68, 0.7)",
                      "0 0 15px rgba(239, 68, 68, 0.5)",
                    ],
                  }
                : {
                    boxShadow: [
                      "0 0 10px rgba(59, 130, 246, 0.3)",
                      "0 0 20px rgba(59, 130, 246, 0.5)",
                      "0 0 10px rgba(59, 130, 246, 0.3)",
                    ],
                  }
            }
            transition={{
              duration: 0.2,
              boxShadow: { repeat: Infinity, duration: 2 },
            }}
            className={`px-8 py-4 rounded-lg font-semibold text-base text-white transition-all duration-200 border backdrop-blur-sm select-none pointer-events-none ${
              isRecording
                ? "bg-linear-to-r from-red-600 to-red-500 border-red-400/50"
                : "bg-linear-to-r from-blue-600 to-cyan-500 border-blue-400/50"
            } ${isDisabled && !isRecording ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <motion.span
              animate={isRecording ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block"
            >
              {isLoading
                ? "Processing..."
                : isRecording
                ? "■ Stop Recording"
                : "⊙ Start Recording"}
            </motion.span>
          </motion.button>
        </div>

        {/* Video upload */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="relative"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4"
            onChange={handleVideoUpload}
            disabled={isDisabled}
            className="hidden"
            id="video-upload"
          />
          <motion.label
            htmlFor="video-upload"
            whileHover={{ scale: isDisabled ? 1 : 1.06 }}
            whileTap={{ scale: isDisabled ? 1 : 0.94 }}
            animate={
              !isDisabled
                ? {
                    boxShadow: [
                      "0 0 10px rgba(168, 85, 247, 0.3)",
                      "0 0 20px rgba(168, 85, 247, 0.5)",
                      "0 0 10px rgba(168, 85, 247, 0.3)",
                    ],
                  }
                : {}
            }
            transition={{ repeat: !isDisabled ? Infinity : 0, duration: 2 }}
            className={`px-8 py-4 rounded-lg font-semibold text-base text-white transition-all duration-200 border backdrop-blur-sm inline-flex items-center gap-2 select-none ${
              isDisabled
                ? "bg-slate-700/40 border-slate-600/30 opacity-40 cursor-not-allowed"
                : "bg-linear-to-r from-purple-600 to-pink-600 border-purple-400/50 cursor-pointer"
            }`}
          >
            <motion.span
              animate={{ rotate: isLoading ? 360 : 0 }}
              transition={{ repeat: isLoading ? Infinity : 0, duration: 2 }}
              className="text-lg"
            >
              📹
            </motion.span>
            Upload Video
          </motion.label>
        </motion.div>

        {/* Reset button - shown when gestures are displayed */}
        {gestures.length > 0 && (
          <motion.button
            onClick={() => {
              setGestures([]);
              setTranscript("");
              setCurrentGestureIndex(0);
              setCompletedSequence("");
            }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="px-8 py-4 rounded-lg font-semibold text-base text-white bg-linear-to-r from-slate-600 to-slate-500 border border-slate-400/50 backdrop-blur-sm"
          >
            Reset
          </motion.button>
        )}
      </div>
    </div>
  );
}
