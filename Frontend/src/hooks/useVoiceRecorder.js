import { useRef, useState } from "react";

/**
 * useVoiceRecorder
 *
 * Encapsulates the full MediaRecorder lifecycle so Chat.jsx doesn't have to.
 *
 * Returns:
 *   isRecording      – boolean, true while mic is active
 *   recordingSeconds – elapsed seconds since recording started
 *   startRecording   – async fn, begins recording; calls onFile(File) when stopped
 *   stopRecording    – fn, finalises the recording
 *   cancelRecording  – fn, discards the recording without producing a file
 */
const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
];

export function useVoiceRecorder({ onFile, onError }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const cancelRecording = () => {
    stopTimer();
    stopStream();
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else {
      cancelRecording();
    }
  };

  const startRecording = async () => {
    if (typeof window.MediaRecorder === "undefined") {
      onError?.("Recording is not supported in this browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported?.(m));
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      streamRef.current = stream;
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stopTimer();
        stopStream();
        setIsRecording(false);
        setRecordingSeconds(0);

        if (!chunksRef.current.length) {
          onError?.("Recording failed — no audio captured");
          return;
        }

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        if (blob.size < 100) {
          onError?.("Recording too short, try again");
          return;
        }

        const ext = blob.type.includes("ogg") ? "ogg"
          : blob.type.includes("mp4") ? "m4a"
          : "webm";

        const voiceNote = new File(
          [blob],
          `voice-note-${Date.now()}.${ext}`,
          { type: blob.type || "audio/webm" }
        );

        onFile?.(voiceNote);
      };

      recorder.onerror = () => {
        cancelRecording();
        onError?.("Recording failed");
      };

      recorder.start(1000);
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(
        () => setRecordingSeconds((s) => s + 1),
        1000
      );
    } catch (err) {
      cancelRecording();
      let msg = "Recording failed";
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        msg = "Microphone permission denied";
      } else if (err?.name === "NotFoundError") {
        msg = "No microphone found";
      } else if (err?.name === "NotReadableError" || err?.name === "TrackStartError") {
        msg = "Microphone is in use by another app";
      }
      onError?.(msg);
    }
  };

  return {
    isRecording,
    recordingSeconds,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
