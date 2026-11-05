export interface ParsedVoiceAction {
  intentType: string;
  spokenReply: string;
  actionDetails?: {
    type: 'youtube' | 'call' | 'sms' | 'alarm' | 'timer' | 'flashlight' | 'wifi' | 'app' | 'map' | 'weather' | 'time' | 'gemini';
    data?: any;
  };
  success: boolean;
}

export async function processBengaliVoiceCommand(
  rawInput: string,
  customApiKey?: string
): Promise<ParsedVoiceAction> {
  const text = rawInput.trim().toLowerCase();

  // 1. YouTube & Music
  if (
    text.includes('গান চালাও') ||
    text.includes('গান বাজাও') ||
    text.includes('ইউটিউবে') ||
    text.includes('youtube') ||
    text.includes('প্লে করো')
  ) {
    const query = text
      .replace(/ইউটিউবে গান চালাও|ইউটিউবে চালাও|গান চালাও|গান বাজাও|ইউটিউবে সার্চ করো|youtube এ|play/g, '')
      .trim();
    const songName = query || 'জনপ্রিয় বাংলা গান';
    return {
      intentType: 'PlayYouTube',
      spokenReply: `ইউটিউবে ${songName} বাজাচ্ছি।`,
      actionDetails: {
        type: 'youtube',
        data: { query: songName, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(songName)}` }
      },
      success: true
    };
  }

  // 2. Flashlight / Torch
  if (text.includes('ফ্ল্যাশলাইট') || text.includes('টর্চ') || text.includes('torch') || text.includes('flashlight')) {
    const turnOff = text.includes('বন্ধ') || text.includes('অফ') || text.includes('off');
    return {
      intentType: 'ToggleFlashlight',
      spokenReply: turnOff ? 'ফ্ল্যাশলাইট বন্ধ করেছি।' : 'ফ্ল্যাশলাইট জ্বালিয়ে দিয়েছি।',
      actionDetails: {
        type: 'flashlight',
        data: { enabled: !turnOff }
      },
      success: true
    };
  }

  // 3. Wi-Fi
  if (text.includes('ওয়াইফাই') || text.includes('ওয়াই-ফাই') || text.includes('wifi')) {
    const turnOff = text.includes('বন্ধ') || text.includes('অফ');
    return {
      intentType: 'ToggleWifi',
      spokenReply: turnOff ? 'ওয়াইফাই বন্ধ করেছি।' : 'ওয়াইফাই চালু করা হয়েছে।',
      actionDetails: {
        type: 'wifi',
        data: { enabled: !turnOff }
      },
      success: true
    };
  }

  // 4. Call Phone
  if (text.includes('কল দাও') || text.includes('কল করো') || text.includes('ফোন দাও') || text.includes('ফোন করো')) {
    const contact = text
      .replace(/কল দাও|কল করো|ফোন দাও|ফোন করো|call/g, '')
      .replace(/কে/g, '')
      .trim() || 'পরিচিতি';
    return {
      intentType: 'MakeCall',
      spokenReply: `${contact}-কে কল করছি...`,
      actionDetails: {
        type: 'call',
        data: { contact }
      },
      success: true
    };
  }

  // 5. Send SMS
  if (text.includes('মেসেজ পাঠাও') || text.includes('এসএমএস করো') || text.includes('sms')) {
    const parts = text.split(/বলবে|বলে|message/);
    const recipient = parts[0].replace(/মেসেজ পাঠাও|এসএমএস করো|কে/g, '').trim() || 'বন্ধুকে';
    const message = parts[1]?.trim() || 'হ্যালো, আমি কাজল অ্যাসিস্ট্যান্ট থেকে মেসেজ পাঠাচ্ছি।';
    return {
      intentType: 'SendSms',
      spokenReply: `${recipient}-কে বার্তা পাঠানোর জন্য প্রস্তুত করেছি।`,
      actionDetails: {
        type: 'sms',
        data: { recipient, message }
      },
      success: true
    };
  }

  // 6. Alarm
  if (text.includes('অ্যালার্ম') || text.includes('এলার্ম') || text.includes('alarm')) {
    const match = text.match(/\d+/);
    const hour = match ? match[0] : '৭';
    return {
      intentType: 'SetAlarm',
      spokenReply: `${hour} টায় অ্যালার্ম সেট করেছি।`,
      actionDetails: {
        type: 'alarm',
        data: { time: `${hour}:00 AM` }
      },
      success: true
    };
  }

  // 7. Timer
  if (text.includes('টাইমার') || text.includes('timer')) {
    const match = text.match(/\d+/);
    const mins = match ? match[0] : '৫';
    return {
      intentType: 'SetTimer',
      spokenReply: `${mins} মিনিটের টাইমার চালু করেছি।`,
      actionDetails: {
        type: 'timer',
        data: { durationSeconds: Number(mins) * 60 }
      },
      success: true
    };
  }

  // 8. Time & Date
  if (text.includes('কয়টা বাজে') || text.includes('সময় কত') || text.includes('তারিখ')) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return {
      intentType: 'GetTimeDate',
      spokenReply: `এখন সময় ${timeStr}, এবং আজকে ${dateStr}।`,
      actionDetails: {
        type: 'time',
        data: { time: timeStr, date: dateStr }
      },
      success: true
    };
  }

  // 9. Weather
  if (text.includes('আবহাওয়া') || text.includes('বৃষ্টি') || text.includes('weather')) {
    return {
      intentType: 'GetWeather',
      spokenReply: 'আজকের আবহাওয়া অত্যন্ত মনোরম ও রৌদ্রোজ্জ্বল। তাপমাত্রা প্রায় ২৮ ডিগ্রি সেলসিয়াস।',
      actionDetails: {
        type: 'weather',
        data: { temp: '28°C', condition: 'Sunny / Mild breeze' }
      },
      success: true
    };
  }

  // 10. Open App
  if (text.includes('খোলো') || text.includes('ওপেন করো') || text.includes('চালু করো')) {
    const appName = text.replace(/খোলো|ওপেন করো|চালু করো|অ্যাপ/g, '').trim();
    return {
      intentType: 'OpenApp',
      spokenReply: `${appName || 'অ্যাপ'} চালু করছি।`,
      actionDetails: {
        type: 'app',
        data: { appName }
      },
      success: true
    };
  }

  // 11. Maps Navigation
  if (text.includes('ম্যাপ') || text.includes('রাস্তা দেখাও') || text.includes('নেভিগেশন')) {
    const destination = text.replace(/ম্যাপে|রাস্তা দেখাও|যাওয়ার|নেভিগেশন খোলো/g, '').trim() || 'গন্তব্য';
    return {
      intentType: 'OpenMaps',
      spokenReply: `${destination} যাওয়ার ম্যাপ ও নেভিগেশন খুলেছি।`,
      actionDetails: {
        type: 'map',
        data: { destination, url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}` }
      },
      success: true
    };
  }

  // 12. Fallback to Gemini Server API
  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: rawInput, customApiKey })
    });
    const data = await res.json();
    return {
      intentType: 'GeminiFallback',
      spokenReply: data.reply || 'আমি কাজল, আপনার কমান্ডটি শুনলাম।',
      actionDetails: {
        type: 'gemini',
        data: { query: rawInput }
      },
      success: true
    };
  } catch (err) {
    return {
      intentType: 'GeminiFallback',
      spokenReply: 'আমি কাজল, আপনার প্রশ্নের উত্তর খুঁজছি। ইন্টারনেট সংযোগ নিশ্চিত করুন।',
      success: true
    };
  }
}
