import { sendAudioChunk } from "./audioSocket";

export async function startMicStreaming() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioCtx = new AudioContext({ sampleRate: 16000 });

  const source = audioCtx.createMediaStreamSource(stream);
  const processor = audioCtx.createScriptProcessor(4096, 1, 1);

  source.connect(processor);
  processor.connect(audioCtx.destination);

  processor.onaudioprocess = (e) => {
    const input = e.inputBuffer.getChannelData(0);
    const pcm = new Int16Array(input.length);

    for (let i = 0; i < input.length; i++) {
      pcm[i] = Math.max(-1, Math.min(1, input[i])) * 32767;
    }

    const base64 = btoa(
      String.fromCharCode(...new Uint8Array(pcm.buffer))
    );

    sendAudioChunk(base64);
  };
}