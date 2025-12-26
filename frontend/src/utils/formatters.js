// Format timestamp for display
export function formatTimestamp(date) {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Format duration in seconds to MM:SS format
export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Format file size in bytes to human readable format
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format transcription text with proper capitalization
export function formatTranscriptionText(text) {
  if (!text) return '';

  // Capitalize first letter of each sentence
  return text.replace(/(^\w|\.\s+\w)/g, (match) => match.toUpperCase());
}

// Simple mock translation function
export function translateText(text, targetLanguage = 'hi') {
  // This is a mock implementation
  // In a real app, this would call a translation API
  const translations = {
    'Hello': { hi: 'नमस्ते', kn: 'ಹಲೋ', ta: 'வணக்கம்', te: 'హలో', bn: 'হ্যালো', mr: 'हॅलो' },
    'How are you': { hi: 'आप कैसे हैं', kn: 'ನೀವು ಹೇಗಿದ್ದೀರಿ', ta: 'நீங்கள் எப்படி இருக்கிறீர்கள்', te: 'మీరు ఎలా ఉన్నారు', bn: 'আপনি কেমন আছেন', mr: 'तुम्ही कसे आहात' },
    'Thank you': { hi: 'धन्यवाद', kn: 'ಧನ್ಯವಾದಗಳು', ta: 'நன்றி', te: 'ధన్యవాదాలు', bn: 'ধন্যবাদ', mr: 'धन्यवाद' },
    'Good morning': { hi: 'सुप्रभात', kn: 'ಶುಭೋದಯ', ta: 'காலை வணக்கம்', te: 'శుభోదయం', bn: 'সুপ্রভাত', mr: 'सुप्रभात' },
    'What is your name': { hi: 'आपका नाम क्या है', kn: 'ನಿಮ್ಮ ಹೆಸರು ಏನು', ta: 'உங்கள் பெயர் என்ன', te: 'మీ పేరు ఏమిటి', bn: 'আপনার নাম কি', mr: 'तुमचे नाव काय आहे' },
    'I understand': { hi: 'मैं समझता हूं', kn: 'ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ', ta: 'நான் புரிந்துகொண்டேன்', te: 'నేను అర్థం చేసుకున్నాను', bn: 'আমি বুঝেছি', mr: 'मला समजले' },
    'Please continue': { hi: 'कृपया जारी रखें', kn: 'ದಯವಿಟ್ಟು ಮುಂದುವರಿಸಿ', ta: 'தொடருங்கள்', te: 'దయచేసి కొనసాగించండి', bn: 'অনুগ্রহ করে চালিয়ে যান', mr: 'कृपया सुरु ठेवा' },
    'That sounds good': { hi: 'यह अच्छा लगता है', kn: 'ಅದು ಒಳ್ಳೆಯದು ಕೇಳುತ್ತದೆ', ta: 'அது நன்றாகத் தெரிகிறது', te: 'అది బాగుంది అనిపిస్తుంది', bn: 'এটা ভালো লাগছে', mr: 'ते छान वाटते' }
  };

  return translations[text]?.[targetLanguage] || `${text} (translated to ${targetLanguage})`;
}

// Export transcription data as JSON
export function exportAsJSON(transcriptionData, translationData) {
  const data = {
    exportTime: new Date().toISOString(),
    transcription: transcriptionData || [],
    translation: translationData || [],
    metadata: {
      totalLines: Math.max(transcriptionData?.length || 0, translationData?.length || 0),
      exportedBy: 'VaaniYantra',
      version: '1.0.0'
    }
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vaaniyantra-transcript-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Export transcription data as SRT subtitle format
export function exportAsSRT(transcriptionData) {
  let srtContent = '';
  let counter = 1;

  (transcriptionData || []).forEach((line, index) => {
    const startTime = new Date(Date.now() - (transcriptionData.length - index) * 2000);
    const endTime = new Date(startTime.getTime() + 2000);

    const formatTime = (date) => {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
      return `${hours}:${minutes}:${seconds},${milliseconds}`;
    };

    srtContent += `${counter}\n`;
    srtContent += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
    srtContent += `${line.speaker || 'Speaker'}: ${line.text || ''}\n\n`;
    counter++;
  });

  const blob = new Blob([srtContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vaaniyantra-transcript-${new Date().toISOString().split('T')[0]}.srt`;
  a.click();
  URL.revokeObjectURL(url);
}

