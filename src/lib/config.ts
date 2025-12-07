export const CONFIG = {
  API: {
    GENERATE: '/api/generate',
    HISTORY: '/api/history',
    ELEVENLABS: {
      BASE_URL: 'https://api.elevenlabs.io/v1/text-to-speech',
      MODEL_ID: 'eleven_turbo_v2_5',
    },
  },
  VOICES: [
    { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel" },
    { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi" },
    { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella" },
    { id: "ErXwobaYiN019PkySvjV", name: "Antoni" },
    { id: "JBFqnCBsd6RMkjVDRZzb", name: "Adam" },
  ],
  DEFAULT_VOICE_ID: "JBFqnCBsd6RMkjVDRZzb",
} as const;
