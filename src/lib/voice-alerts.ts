/**
 * Helper to trigger voice alerts using the native browser SpeechSynthesis API.
 */
export function playVoiceAlert(message: string) {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech so they don't queue up forever
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    
    // Try to find a pleasant English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Google')));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  } else {
    console.warn("SpeechSynthesis API not supported in this browser.");
  }
}
