/**
 * Supported Languages Registry & Multilingual Generation Engine
 * Supports 23 major regional and global languages.
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'zh', name: 'Chinese', native: '中文 (简体)' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
];

export const LANGUAGE_DICTIONARIES = {
  English: {
    subjectPrefix: 'Reminder: ',
    urgentPrefix: '[URGENT] Reminder: ',
    dateTerms: { tomorrow: 'tomorrow', today: 'today', tonight: 'tonight' },
    greetings: {
      Professional: 'Dear {{name}},',
      Formal: 'Respected {{name}},',
      Friendly: 'Hi {{name}}! 👋',
      Casual: 'Hey {{name}},',
      Urgent: 'URGENT NOTICE: {{name}},',
      Promotional: 'Special Update for you, {{name}}! 🚀'
    },
    signoffs: {
      Professional: 'Sincerely,\nAcademic & Event Coordination Team',
      Formal: 'With highest regards,\nDepartment Administration',
      Friendly: 'Cheers & see you there!\nThe Organizing Team',
      Casual: 'Catch you soon,\nThe Team',
      Urgent: 'Please act immediately.\nOperations Desk',
      Promotional: 'Don’t miss out!\nSmartSend Team'
    },
    emailIntro: 'This is a reminder regarding your upcoming session for {{event}} scheduled for {{date}} at {{time}}.',
    detailsTitle: 'Session Details:',
    eventLabel: 'Event',
    dateTimeLabel: 'Date & Time',
    locationLabel: 'Location',
    prepAdvice: 'Please review your preparation checklist and ensure your development environment is ready.',
    contactNotice: 'If you have any questions or schedule conflicts, please notify the coordinator as soon as possible.',
    cta: 'Join Session / View Schedule',
    short: 'Reminder: {{event}} is scheduled for {{date}} at {{time}} in {{location}}. Please arrive prepared.',
    whatsappUrgent: '*Action Required:* Your scheduled session for *{{event}}* is happening on *{{date}}* at *{{time}}* in *{{location}}*.\n\nPlease confirm your attendance.',
    whatsappFriendly: 'Just a quick heads up! *{{event}}* is taking place on *{{date}}* at *{{time}}* in *{{location}}*.\n\nWe’ve got an exciting agenda lined up!',
    whatsappStandard: 'This is a notification regarding *{{event}}* scheduled for *{{date}}* at *{{time}}*.\n\nVenue: *{{location}}*.\nPlease ensure timely arrival.',
    smsUrgent: 'ALERT: Hi {{name}}, your {{event}} is on {{date}} at {{time}} ({{location}}). Reply 1 to confirm immediately.',
    smsStandard: 'Hi {{name}}, reminder for {{event}} scheduled on {{date}} at {{time}} in {{location}}. Reply YES to confirm. - SmartSend'
  },

  Hindi: {
    subjectPrefix: 'स्मरण पत्र: ',
    urgentPrefix: '[अति आवश्यक] स्मरण पत्र: ',
    dateTerms: { tomorrow: 'कल', today: 'आज', tonight: 'आज रात' },
    greetings: {
      Professional: 'प्रिय {{name}},',
      Formal: 'आदरणीय {{name}},',
      Friendly: 'नमस्ते {{name}}! 👋',
      Casual: 'नमस्ते {{name}},',
      Urgent: 'अति आवश्यक सूचना: {{name}},',
      Promotional: 'आपके लिए विशेष अपडेट, {{name}}! 🚀'
    },
    signoffs: {
      Professional: 'सादर,\nशैक्षणिक एवं कार्यक्रम समन्वय दल',
      Formal: 'उच्चतम सम्मान के साथ,\nविभाग प्रशासन',
      Friendly: 'हार्दिक शुभकामनाएँ एवं मिलते हैं!\nआयोजन दल',
      Casual: 'जल्द मिलते हैं,\nकार्यदल',
      Urgent: 'कृपया तत्काल ध्यान दें।\nसंचालन डेस्क',
      Promotional: 'अवसर का लाभ उठाएँ!\nSmartSend टीम'
    },
    emailIntro: 'यह आपके आगामी सत्र {{event}} के संबंध में एक महत्वपूर्ण स्मरण पत्र है, जो {{date}} को {{time}} पर निर्धारित है।',
    detailsTitle: 'सत्र विवरण:',
    eventLabel: 'कार्यक्रम',
    dateTimeLabel: 'दिनांक एवं समय',
    locationLabel: 'स्थान',
    prepAdvice: 'कृपया अपनी तैयारी चेकलिस्ट की समीक्षा करें और सुनिश्चित करें कि आपकी व्यवस्था पूर्ण है।',
    contactNotice: 'यदि आपके कोई प्रश्न हैं या समय का कोई टकराव है, तो कृपया जल्द से जल्द समन्वयक को सूचित करें।',
    cta: 'सत्र में शामिल हों / विवरण देखें',
    short: 'स्मरण पत्र: {{event}} सत्र {{date}} को {{time}} पर {{location}} में निर्धारित है। कृपया समय पर उपस्थित रहें।',
    whatsappUrgent: '*तत्काल कार्रवाई आवश्यक:* आपका सत्र *{{event}}* दिनांक *{{date}}* को *{{time}}* पर *{{location}}* में निर्धारित है।\n\nकृपया अपनी उपस्थिति की पुष्टि करें।',
    whatsappFriendly: 'नमस्ते! एक त्वरित सूचना: *{{event}}* दिनांक *{{date}}* को *{{time}}* पर *{{location}}* में आयोजित हो रहा है।\n\nमिलते हैं!',
    whatsappStandard: 'यह *{{event}}* के संबंध में सूचना है जो *{{date}}* को *{{time}}* पर *{{location}}* में होगी।\n\nकृपया समय पर पधारें।',
    smsUrgent: 'अलर्ट: नमस्ते {{name}}, आपका {{event}} सत्र {{date}} को {{time}} ({{location}}) पर है। तत्काल पुष्टि के लिए 1 लिखें।',
    smsStandard: 'नमस्ते {{name}}, {{event}} सत्र {{date}} को {{time}} पर {{location}} में निर्धारित है। पुष्टि हेतु YES लिखें।'
  },

  Telugu: {
    subjectPrefix: 'గుర్తుచేసే సమాచారం: ',
    urgentPrefix: '[అత్యవసరం] గుర్తుచేసే సమాచారం: ',
    dateTerms: { tomorrow: 'రేపు', today: 'ఈరోజు', tonight: 'ఈ రాత్రి' },
    greetings: {
      Professional: 'ప్రియమైన {{name}},',
      Formal: 'గౌరవనీయులైన {{name}},',
      Friendly: 'నమస్కారం {{name}}! 👋',
      Casual: 'హలో {{name}},',
      Urgent: 'అత్యవసర సమాచారం: {{name}},',
      Promotional: 'మీ కోసం ప్రత్యేక అప్‌డేట్, {{name}}! 🚀'
    },
    signoffs: {
      Professional: 'భవదీయులు,\nఅకడమిక్ & ఈవెంట్ కోఆర్డినేషన్ బృందం',
      Formal: 'గౌరవపూర్వక అభినందనలతో,\nవిభాగ పరిపాలన విభాగం',
      Friendly: 'త్వరలో కలుద్దాం!\nనిర్వాహక బృందం',
      Casual: 'మళ్లీ కలుద్దాం,\nబృందం',
      Urgent: 'దయచేసి వెంటనే స్పందించండి.\nఆపరేషన్స్ విభాగం',
      Promotional: 'ఈ అవకాశాన్ని సద్వినియోగం చేసుకోండి!\nSmartSend టీమ్'
    },
    emailIntro: '{{date}}న {{time}} గంటలకు జరగనున్న {{event}} సెషన్ గురించి ఇది ఒక ముఖ్యమైన రిమైండర్.',
    detailsTitle: 'సెషన్ వివరాలు:',
    eventLabel: 'కార్యక్రమం',
    dateTimeLabel: 'తేదీ & సమయం',
    locationLabel: 'వేదిక',
    prepAdvice: 'దయచేసి మీ ప్రిపరేషన్ చెక్‌లిస్ట్‌ను సమీక్షించి, అన్ని పరికరాలను సిద్ధంగా ఉంచుకోండి.',
    contactNotice: 'మీకు ఏవైనా సందేహాలు ఉంటే, దయచేసి సమన్వయకర్తకు వెంటనే తెలియజేయండి.',
    cta: 'సెషన్‌లో చేరండి / వివరాలు చూడండి',
    short: 'రిమైండర్: {{event}} సెషన్ {{date}}న {{time}} గంటలకు {{location}}లో ప్రారంభమవుతుంది.',
    whatsappUrgent: '*అత్యవసరం:* మీ *{{event}}* సెషన్ *{{date}}*న *{{time}}* గంటలకు *{{location}}*లో జరుగుతుంది.\n\nదయచేసి మీ హాజరును ధృవీకరించండి.',
    whatsappFriendly: 'నమస్కారం! చిన్న సమాచారం: *{{event}}* కార్యక్రమం *{{date}}*న *{{time}}* గంటలకు *{{location}}*లో జరుగుతుంది. కలుద్దాం!',
    whatsappStandard: '*{{event}}* సెషన్ సమాచారం: *{{date}}*న *{{time}}* గంటలకు *{{location}}*లో జరగనుంది. సమయానికి హాజరుకాగలరు.',
    smsUrgent: 'హెచ్చరిక: హలో {{name}}, మీ {{event}} సెషన్ {{date}}న {{time}} ({{location}}) గంటలకు జరుగుతుంది. ధృవీకరించడానికి 1 అని రిప్లై ఇవ్వండి.',
    smsStandard: 'నమస్కారం {{name}}, మీ {{event}} సెషన్ {{date}}న {{time}} గంటలకు {{location}}లో జరుగుతుంది. నిర్ధారించడానికి YES అని పంపండి.'
  },

  Tamil: {
    subjectPrefix: 'நினைவூட்டல்: ',
    urgentPrefix: '[அவசரம்] நினைவூட்டல்: ',
    dateTerms: { tomorrow: 'நாளை', today: 'இன்று', tonight: 'இன்று இரவு' },
    greetings: {
      Professional: 'அன்புள்ள {{name}},',
      Formal: 'மதிப்பிற்குரிய {{name}},',
      Friendly: 'வணக்கம் {{name}}! 👋',
      Casual: 'வணக்கம் {{name}},',
      Urgent: 'முக்கிய அவசர அறிவிப்பு: {{name}},',
      Promotional: 'உங்களுக்கான சிறப்பு தகவல், {{name}}! 🚀'
    },
    signoffs: {
      Professional: 'இப்படிக்கு,\nகல்வி மற்றும் நிகழ்வு ஒருங்கிணைப்புக் குழு',
      Formal: 'மிக்க மரியாதையுடன்,\nதுறை நிர்வாகம்',
      Friendly: 'நிகழ்வில் சந்திப்போம்!\nஒருங்கிணைப்புக் குழு',
      Casual: 'மீண்டும் சந்திப்போம்,\nகுழு',
      Urgent: 'உடனடி நடவடிக்கை தேவை.\nசெயல்பாட்டுப் பிரிவு',
      Promotional: 'வாய்ப்பைத் தவறவிடாதீர்கள்!\nSmartSend குழு'
    },
    emailIntro: '{{date}} அன்று {{time}} மணிக்கு நடைபெற உள்ள {{event}} அமர்வு குறித்த நினைவூட்டல் இதுவாகும்.',
    detailsTitle: 'அமர்வு விவரங்கள்:',
    eventLabel: 'நிகழ்வு',
    dateTimeLabel: 'தேதி மற்றும் நேரம்',
    locationLabel: 'இடம்',
    prepAdvice: 'தயவுசெய்து உங்கள் முன்னேற்பாடுகளைச் சரிபார்த்து தயாராக இருக்கவும்.',
    contactNotice: 'ஏதேனும் கேள்விகள் இருப்பின், ஒருங்கிணைப்பாளரை உடனே தொடர்பு கொள்ளவும்.',
    cta: 'அமர்வில் இணையுங்கள் / அட்டவணையைப் பார்க்கவும்',
    short: 'நினைவூட்டல்: {{event}} அமர்வு {{date}} அன்று {{time}} மணிக்கு {{location}}ல் நடைபெறுகிறது.',
    whatsappUrgent: '*உடனடி நடவடிக்கை:* உங்கள் *{{event}}* அமர்வு *{{date}}* அன்று *{{time}}* மணிக்கு *{{location}}*ல் நடைபெறுகிறது.\n\nவருகையை உறுதிப்படுத்தவும்.',
    whatsappFriendly: 'வணக்கம்! ஒரு சிறிய நினைவூட்டல்: *{{event}}* அமர்வு *{{date}}* அன்று *{{time}}* மணிக்கு *{{location}}*ல் நடைபெற உள்ளது!',
    whatsappStandard: '*{{event}}* அமர்வு பற்றிய தகவல்: *{{date}}* அன்று *{{time}}* மணிக்கு *{{location}}*ல் நடைபெறும். சரியான நேரத்தில் வருகை தரவும்.',
    smsUrgent: 'எச்சரிக்கை: வணக்கம் {{name}}, உங்கள் {{event}} அமர்வு {{date}} அன்று {{time}} மணிக்கு நடைபெறுகிறது. உறுதிப்படுத்த 1 என பதிலளிக்கவும்.',
    smsStandard: 'வணக்கம் {{name}}, {{event}} அமர்வு {{date}} அன்று {{time}} மணிக்கு {{location}}ல் நடக்கிறது. உறுதிப்படுத்த YES என அனுப்பவும்.'
  },

  Kannada: {
    subjectPrefix: 'ಜ್ಞಾಪನೆ: ',
    urgentPrefix: '[ತುರ್ತು] ಜ್ಞಾಪನೆ: ',
    dateTerms: { tomorrow: 'ನಾಳೆ', today: 'ಇಂದು', tonight: 'ಇಂದು ರಾತ್ರಿ' },
    greetings: {
      Professional: 'ಆತ್ಮೀಯ {{name}},',
      Formal: 'ಗೌರವಾನ್ವಿತ {{name}},',
      Friendly: 'ನಮಸ್ಕಾರ {{name}}! 👋',
      Casual: 'ಹಲೋ {{name}},',
      Urgent: 'ತುರ್ತು ಸೂಚನೆ: {{name}},',
      Promotional: 'ನಿಮಗಾಗಿ ವಿಶೇಷ ಅಪ್‌ಡೇಟ್, {{name}}! 🚀'
    },
    signoffs: {
      Professional: 'ಇಂತಿ ನಿಮ್ಮ,\nಶೈಕ್ಷಣಿಕ ಮತ್ತು ಕಾರ್ಯಕ್ರಮ ಸಂಯೋಜನಾ ತಂಡ',
      Formal: 'ಗೌರವಪೂರ್ವಕ ವಂದನೆಗಳೊಂದಿಗೆ,\nವಿಭಾಗ ಆಡಳಿತ',
      Friendly: 'ಕಾರ್ಯಕ್ರಮದಲ್ಲಿ ಭೇಟಿಯಾಗೋಣ!\nಆಯೋಜಕ ತಂಡ',
      Casual: 'ಮತ್ತೆ ಭೇಟಿಯಾಗೋಣ,\nತಂಡ',
      Urgent: 'ದಯವಿಟ್ಟು ತಕ್ಷಣ ಗಮನಿಸಿ.\nಕಾರ್ಯಾಚರಣೆ ವಿಭಾಗ',
      Promotional: 'ತಪ್ಪದೇ ಭಾಗವಹಿಸಿ!\nSmartSend ತಂಡ'
    },
    emailIntro: '{{date}} ರಂದು {{time}} ಕ್ಕೆ ನಿಗದಿಯಾಗಿರುವ {{event}} ಕಾರ್ಯಕ್ರಮದ ಕುರಿತು ಇದು ಪ್ರಮುಖ ಜ್ಞಾಪನೆ.',
    detailsTitle: 'ಕಾರ್ಯಕ್ರಮದ ವಿವರಗಳು:',
    eventLabel: 'ಕಾರ್ಯಕ್ರಮ',
    dateTimeLabel: 'ದಿನಾಂಕ ಮತ್ತು ಸಮಯ',
    locationLabel: 'ಸ್ಥಳ',
    prepAdvice: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಿದ್ಧತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ ಸಕಾಲದಲ್ಲಿ ಹಾಜರಿರಲು ಕೋರಲಾಗಿದೆ.',
    contactNotice: 'ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳಿದ್ದಲ್ಲಿ, ದಯವಿಟ್ಟು ಸಂಯೋಜಕರನ್ನು ತಕ್ಷಣ ಸಂಪರ್ಕಿಸಿ.',
    cta: 'ಕಾರ್ಯಕ್ರಮಕ್ಕೆ ಸೇರಿ / ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    short: 'ಜ್ಞಾಪನೆ: {{event}} ಕಾರ್ಯಕ್ರಮವು {{date}} ರಂದು {{time}} ಕ್ಕೆ {{location}} ನಲ್ಲಿ ನಡೆಯಲಿದೆ.',
    whatsappUrgent: '*ತುರ್ತು:* ನಿಮ್ಮ *{{event}}* ಕಾರ್ಯಕ್ರಮವು *{{date}}* ರಂದು *{{time}}* ಕ್ಕೆ *{{location}}* ನಲ್ಲಿ ನಡೆಯಲಿದೆ. ಹಾಜರಾತಿಯನ್ನು ದೃಢೀಕರಿಸಿ.',
    whatsappFriendly: 'ನಮಸ್ಕಾರ! *{{event}}* ಕಾರ್ಯಕ್ರಮವು *{{date}}* ರಂದು *{{time}}* ಕ್ಕೆ *{{location}}* ನಲ್ಲಿ ನಡೆಯಲಿದೆ. ಭೇಟಿಯಾಗೋಣ!',
    whatsappStandard: '*{{event}}* ಕುರಿತು ಮಾಹಿತಿ: *{{date}}* ರಂದು *{{time}}* ಕ್ಕೆ *{{location}}* ನಲ್ಲಿ ನಿಗದಿಯಾಗಿದೆ. ಸಕಾಲದಲ್ಲಿ ಉಪಸ್ಥಿತರಿರಿ.',
    smsUrgent: 'ಎಚ್ಚರಿಕೆ: ನಮಸ್ಕಾರ {{name}}, ನಿಮ್ಮ {{event}} ಕಾರ್ಯಕ್ರಮ {{date}} ರಂದು {{time}} ಕ್ಕೆ ನಡೆಯಲಿದೆ. ಖಚಿತಪಡಿಸಲು 1 ಎಂದು ಕಳುಹಿಸಿ.',
    smsStandard: 'ನಮಸ್ಕಾರ {{name}}, {{event}} ಕಾರ್ಯಕ್ರಮವು {{date}} ರಂದು {{time}} ಕ್ಕೆ {{location}} ನಲ್ಲಿ ನಡೆಯಲಿದೆ. ದೃಢೀಕರಿಸಲು YES ಎಂದು ಕಳುಹಿಸಿ.'
  },

  Malayalam: {
    subjectPrefix: 'ഓർമ്മപ്പെടുത്തൽ: ',
    urgentPrefix: '[അടിയന്തിരം] ഓർമ്മപ്പെടുത്തൽ: ',
    dateTerms: { tomorrow: 'നാളെ', today: 'ഇന്ന്', tonight: 'ഇന്ന് രാത്രി' },
    greetings: {
      Professional: 'പ്രിയപ്പെട്ട {{name}},',
      Formal: 'ബഹുമാനപ്പെട്ട {{name}},',
      Friendly: 'നമസ്കാരം {{name}}! 👋',
      Casual: 'ഹലോ {{name}},',
      Urgent: 'അടിയന്തിര അറിയിപ്പ്: {{name}},',
      Promotional: 'നിങ്ങൾക്കായി ഒരു പ്രത്യേക അപ്‌ഡേറ്റ്, {{name}}! 🚀'
    },
    signoffs: {
      Professional: 'വിശ്വസ്തതയോടെ,\nഅക്കാദമിക് & ഇവന്റ് കോർഡിനേഷൻ ടീം',
      Formal: 'ആദരവോടെ,\nവകുപ്പ് അഡ്മിനിസ്ട്രേഷൻ',
      Friendly: 'നമുക്ക് ഉടൻ കാണാം!\nഓർഗനൈസിംഗ് ടീം',
      Casual: 'വീണ്ടും കാണാം,\nടീം',
      Urgent: 'ദയവായി ഉടൻ പരിഗണിക്കുക.\nഓപ്പറേഷൻസ് ഡെസ്ക്',
      Promotional: 'അവസരം നഷ്ടപ്പെടുത്തരുത്!\nSmartSend ടീം'
    },
    emailIntro: '{{date}} തീയതിയിൽ {{time}}-ന് നടക്കുന്ന {{event}} സെഷനെക്കുറിച്ചുള്ള ഓർമ്മപ്പെടുത്തലാണിത്.',
    detailsTitle: 'സെഷൻ വിവരങ്ങൾ:',
    eventLabel: 'പരിപാടി',
    dateTimeLabel: 'തീയതിയും സമയവും',
    locationLabel: 'സ്ഥലം',
    prepAdvice: 'ദയവായി ആവശ്യമായ തയ്യാറെടുപ്പുകൾ പൂർത്തിയാക്കി കൃത്യസമയത്ത് എത്തിച്ചേരുക.',
    contactNotice: 'എന്തെങ്കിലും സംശയങ്ങളുണ്ടെങ്കിൽ കോർഡിനേറ്ററുമായി ഉടൻ ബന്ധപ്പെടുക.',
    cta: 'സെഷനിൽ ചേരുക / വിവരങ്ങൾ കാണുക',
    short: 'ഓർമ്മപ്പെടുത്തൽ: {{event}} സെഷൻ {{date}} തീയതിയിൽ {{time}}-ന് {{location}}-ൽ നടക്കും.',
    whatsappUrgent: '*അടിയന്തിരം:* നിങ്ങളുടെ *{{event}}* സെഷൻ *{{date}}* തീയതിയിൽ *{{time}}*-ന് *{{location}}*-ൽ നടക്കും. പങ്കാളിത്തം സ്ഥിരീകരിക്കുക.',
    whatsappFriendly: 'ഹലോ! *{{event}}* സെഷൻ *{{date}}* തീയതിയിൽ *{{time}}*-ന് *{{location}}*-ൽ നടക്കും. കാണാം!',
    whatsappStandard: '*{{event}}* സെഷൻ വിവരം: *{{date}}* തീയതിയിൽ *{{time}}*-ന് *{{location}}*-ൽ നടക്കും. കൃത്യസമയത്ത് എത്തുക.',
    smsUrgent: 'അലർട്ട്: നമസ്കാരം {{name}}, നിങ്ങളുടെ {{event}} സെഷൻ {{date}} തീയതിയിൽ {{time}}-ന് നടക്കും. സ്ഥിരീകരിക്കാൻ 1 എന്ന് മറുപടി നൽകുക.',
    smsStandard: 'നമസ്കാരം {{name}}, {{event}} സെഷൻ {{date}} തീയതിയിൽ {{time}}-ന് {{location}}-ൽ നടക്കും. സ്ഥിരീകരിക്കാൻ YES എന്ന് അയക്കുക.'
  },

  Marathi: {
    subjectPrefix: 'स्मरणपत्र: ',
    urgentPrefix: '[तातडीचे] स्मरणपत्र: ',
    dateTerms: { tomorrow: 'उद्या', today: 'आज', tonight: 'आज रात्री' },
    greetings: {
      Professional: 'आदरणीय {{name}},',
      Formal: 'सन्माननीय {{name}},',
      Friendly: 'नमस्कार {{name}}! 👋',
      Casual: 'हॅलो {{name}},',
      Urgent: 'तातडीची सूचना: {{name}},',
      Promotional: 'आपल्यासाठी खास अपडेट, {{name}}! 🚀'
    },
    signoffs: {
      Professional: 'आपले नम्र,\nशैक्षणिक आणि कार्यक्रम समन्वय कार्यसंघ',
      Formal: 'सादर प्रणाम,\nविभाग प्रशासन',
      Friendly: 'कार्यक्रमात भेटूया!\nआयोजक कार्यसंघ',
      Casual: 'लवकरच भेटू,\nटीम',
      Urgent: 'कृपया त्वरित कृती करा.\nऑपरेशन्स डेस्क',
      Promotional: 'संधी सोडू नका!\nSmartSend टीम'
    },
    emailIntro: '{{date}} रोजी {{time}} वाजता नियोजित असलेल्या {{event}} सत्राबाबत हे स्मरणपत्र आहे.',
    detailsTitle: 'सत्र तपशील:',
    eventLabel: 'कार्यक्रम',
    dateTimeLabel: 'दिनांक आणि वेळ',
    locationLabel: 'ठिकाण',
    prepAdvice: 'कृपया आपली पूर्वतयारी तपासून घ्या आणि वेळेवर उपस्थित राहा.',
    contactNotice: 'काही अडचण किंवा प्रश्न असल्यास कृपया समन्वयकांशी संपर्क साधावा.',
    cta: 'सत्रात सामील व्हा / वेळापत्रक पहा',
    short: 'स्मरणपत्र: {{event}} सत्र {{date}} रोजी {{time}} वाजता {{location}} येथे होईल.',
    whatsappUrgent: '*तातडीचे:* आपले *{{event}}* सत्र *{{date}}* रोजी *{{time}}* वाजता *{{location}}* येथे होणार आहे. उपस्थिती निश्चित करा.',
    whatsappFriendly: 'नमस्कार! एक सूचना: *{{event}}* कार्यक्रम *{{date}}* रोजी *{{time}}* वाजता *{{location}}* येथे होत आहे. भेटूया!',
    whatsappStandard: '*{{event}}* संदर्भात सूचना: *{{date}}* रोजी *{{time}}* वाजता *{{location}}* येथे आयोजित आहे. वेळेत उपस्थित राहावे.',
    smsUrgent: 'अलर्ट: नमस्कार {{name}}, आपले {{event}} सत्र {{date}} रोजी {{time}} वाजता होणार आहे. उपस्थितीसाठी 1 पाठवा.',
    smsStandard: 'नमस्कार {{name}}, {{event}} सत्र {{date}} रोजी {{time}} वाजता {{location}} येथे आहे. निश्चितीसाठी YES पाठवा.'
  },

  Bengali: {
    subjectPrefix: 'স্মারকবার্তা: ',
    urgentPrefix: '[জরুরি] স্মারকবার্তা: ',
    dateTerms: { tomorrow: 'আগামীকাল', today: 'আজ', tonight: 'আজ রাত' },
    greetings: {
      Professional: 'প্রিয় {{name}},',
      Formal: 'শ্রদ্ধেয় {{name}},',
      Friendly: 'নমস্কার {{name}}! 👋',
      Casual: 'হ্যালো {{name}},',
      Urgent: 'জরুরি বিজ্ঞপ্তি: {{name}},',
      Promotional: 'আপনার জন্য বিশেষ আপডেট, {{name}}! 🚀'
    },
    signoffs: {
      Professional: 'বিনীত,\nশিক্ষা ও ইভেন্ট সমন্বয় দল',
      Formal: 'শ্রদ্ধা সহকারে,\nবিভাগীয় প্রশাসন',
      Friendly: 'শীঘ্রই দেখা হবে!\nআয়োজক দল',
      Casual: 'আবার দেখা হবে,\nটিম',
      Urgent: 'অবিলম্বে সাড়া দিন।\nঅপারেশন ডেস্ক',
      Promotional: 'সুযোগ হাতছাড়া করবেন না!\nSmartSend টিম'
    },
    emailIntro: '{{date}} তারিখে {{time}}-এ অনুষ্ঠিতব্য {{event}} সেশন সম্পর্কে এটি একটি স্মারকবার্তা।',
    detailsTitle: 'সেশনের বিবরণ:',
    eventLabel: 'ইভেন্ট',
    dateTimeLabel: 'তারিখ ও সময়',
    locationLabel: 'স্থান',
    prepAdvice: 'অনুগ্রহ করে আপনার পূর্বপ্রস্তুতি সম্পন্ন করুন এবং সঠিক সময়ে উপস্থিত থাকুন।',
    contactNotice: 'কোনো প্রশ্ন বা সমস্যা থাকলে অবিলম্বে সমন্বয়ককে জানান।',
    cta: 'সেশনে যোগ দিন / সময়সূচি দেখুন',
    short: 'স্মারকবার্তা: {{event}} সেশন {{date}} তারিখে {{time}}-এ {{location}}-এ অনুষ্ঠিত হবে।',
    whatsappUrgent: '*জরুরি পদক্ষেপ প্রয়োজন:* আপনার *{{event}}* সেশন *{{date}}* তারিখে *{{time}}*-এ *{{location}}*-এ অনুষ্ঠিত হবে। উপস্থিতি নিশ্চিত করুন।',
    whatsappFriendly: 'হ্যালো! একটি ছোট তথ্য: *{{event}}* সেশন *{{date}}* তারিখে *{{time}}*-এ *{{location}}*-এ অনুষ্ঠিত হচ্ছে। দেখা হবে!',
    whatsappStandard: '*{{event}}* সেশনের তথ্য: *{{date}}* তারিখে *{{time}}*-এ *{{location}}*-এ অনুষ্ঠিত হবে। যথাসময়ে উপস্থিত থাকুন।',
    smsUrgent: 'সতর্কতা: হ্যালো {{name}}, আপনার {{event}} সেশন {{date}} তারিখে {{time}}-এ অনুষ্ঠিত হবে। নিশ্চিত করতে 1 লিখে পাঠান।',
    smsStandard: 'নমস্কার {{name}}, {{event}} সেশন {{date}} তারিখে {{time}}-এ {{location}}-এ শুরু হবে। নিশ্চিত করতে YES লিখে পাঠান।'
  },

  Gujarati: {
    subjectPrefix: 'રિમાઇન્ડર: ',
    urgentPrefix: '[તાત્કાલિક] રિમાઇન્ડર: ',
    dateTerms: { tomorrow: 'આવતીકાલે', today: 'આજે', tonight: 'આજે રાત્રે' },
    greetings: {
      Professional: 'પ્રિય {{name}},',
      Formal: 'આદરણીય {{name}},',
      Friendly: 'નમસ્તે {{name}}! 👋',
      Casual: 'હેલો {{name}},',
      Urgent: 'તાત્કાલિક સૂચના: {{name}},',
      Promotional: 'તમારા માટે વિશેષ અપડેટ, {{name}}! 🚀'
    },
    signoffs: {
      Professional: 'આપનો વિશ્વાસુ,\nશૈક્ષણિક અને કાર્યક્રમ સંકલન ટીમ',
      Formal: 'સાદર પ્રણામ,\nવિભાગ વહીવટ',
      Friendly: 'કાર્યક્રમમાં મળીએ!\nઆયોજક ટીમ',
      Casual: 'જલ્દી મળીશું,\nટીમ',
      Urgent: 'કૃપા કરીને તાત્કાલિક નોંધ લો.\nઓપરેશન્સ ડેસ્ક',
      Promotional: 'તક ચૂકશો નહીં!\nSmartSend ટીમ'
    },
    emailIntro: '{{date}} ના રોજ {{time}} વાગ્યે યોજાનાર {{event}} સત્ર અંગે આ એક મહત્વપૂર્ણ રિમાઇન્ડર છે.',
    detailsTitle: 'સત્ર વિગતો:',
    eventLabel: 'કાર્યક્રમ',
    dateTimeLabel: 'તારીખ અને સમય',
    locationLabel: 'સ્થળ',
    prepAdvice: 'કૃપા કરીને તમારી તૈયારીની સમીક્ષા કરો અને સમયસર ઉપસ્થિત રહો.',
    contactNotice: 'કોઈ પ્રશ્ન હોય તો કૃપા કરીને સંયોજકનો સંપર્ક કરો.',
    cta: 'સત્રમાં જોડાઓ / વિગતો જુઓ',
    short: 'રિમાઇન્ડર: {{event}} સત્ર {{date}} ના રોજ {{time}} વાગ્યે {{location}} પર યોજાશે.',
    whatsappUrgent: '*તાત્કાલિક:* તમારું *{{event}}* સત્ર *{{date}}* ના રોજ *{{time}}* વાગ્યે *{{location}}* ખાતે યોજાશે. હાજરીની પુષ્ટિ કરો.',
    whatsappFriendly: 'નમસ્તે! *{{event}}* કાર્યક્રમ *{{date}}* ના રોજ *{{time}}* વાગ્યે *{{location}}* પર યોજાશે. મળીએ!',
    whatsappStandard: '*{{event}}* સત્રની માહિતી: *{{date}}* ના રોજ *{{time}}* વાગ્યે *{{location}}* ખાતે યોજાશે. સમયસર પધારશો.',
    smsUrgent: 'ચેતવણી: નમસ્તે {{name}}, તમારું {{event}} સત્ર {{date}} ના રોજ {{time}} વાગ્યે શરૂ થશે. પુષ્ટિ માટે 1 મોકલો.',
    smsStandard: 'નમસ્તે {{name}}, {{event}} સત્ર {{date}} ના રોજ {{time}} વાગ્યે {{location}} ખાતે છે. પુષ્ટિ કરવા YES મોકલો.'
  },

  Punjabi: {
    subjectPrefix: 'ਯਾਦ-ਦਹਾਨੀ: ',
    urgentPrefix: '[ਜ਼ਰੂਰੀ] ਯਾਦ-ਦਹਾਨੀ: ',
    dateTerms: { tomorrow: 'ਕੱਲ੍ਹ', today: 'ਅੱਜ', tonight: 'ਅੱਜ ਰਾਤ' },
    greetings: {
      Professional: 'ਪਿਆਰੇ {{name}},',
      Formal: 'ਸਤਿਕਾਰਯੋਗ {{name}},',
      Friendly: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ {{name}}! 👋',
      Casual: 'ਹੈਲੋ {{name}},',
      Urgent: 'ਜ਼ਰੂਰੀ ਨੋਟਿਸ: {{name}},',
      Promotional: 'ਤੁਹਾਡੇ ਲਈ ਵਿਸ਼ੇਸ਼ ਅਪਡੇਟ, {{name}}! 🚀'
    },
    signoffs: {
      Professional: 'ਧੰਨਵਾਦ ਸਹਿਤ,\nਸਿੱਖਿਆ ਅਤੇ ਪ੍ਰੋਗਰਾਮ ਤਾਲਮੇਲ ਟੀਮ',
      Formal: 'ਪੂਰੇ ਸਤਿਕਾਰ ਨਾਲ,\nਵਿਭਾਗ ਪ੍ਰਸ਼ਾਸਨ',
      Friendly: 'ਜਲਦੀ ਮਿਲਦੇ ਹਾਂ!\nਪ੍ਰਬੰਧਕੀ ਟੀਮ',
      Casual: 'ਫਿਰ ਮਿਲਾਂਗੇ,\nਟੀਮ',
      Urgent: 'ਕਿਰਪਾ ਕਰਕੇ ਤੁਰੰਤ ਕਾਰਵਾਈ ਕਰੋ।\nਓਪਰੇਸ਼ਨ ਡੈਸਕ',
      Promotional: 'ਮੌਕਾ ਨਾ ਖੁੰਝਾਓ!\nSmartSend ਟੀਮ'
    },
    emailIntro: 'ਇਹ {{date}} ਨੂੰ {{time}} ਵਜੇ ਹੋਣ ਵਾਲੇ {{event}} ਸੈਸ਼ਨ ਬਾਰੇ ਇੱਕ ਜ਼ਰੂਰੀ ਯਾਦ-ਦਹਾਨੀ ਹੈ।',
    detailsTitle: 'ਸੈਸ਼ਨ ਦੇ ਵੇਰਵੇ:',
    eventLabel: 'ਪ੍ਰੋਗਰਾਮ',
    dateTimeLabel: 'ਮਿਤੀ ਅਤੇ ਸਮਾਂ',
    locationLabel: 'ਸਥਾਨ',
    prepAdvice: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਤਿਆਰੀ ਦੀ ਜਾਂਚ ਕਰੋ ਅਤੇ ਸਮੇਂ ਸਿਰ ਹਾਜ਼ਰ ਹੋਵੋ।',
    contactNotice: 'ਕਿਸੇ ਵੀ ਸਵਾਲ ਲਈ ਤੁਰੰਤ ਪ੍ਰਬੰਧਕ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।',
    cta: 'ਸੈਸ਼ਨ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ / ਵੇਰਵੇ ਵੇਖੋ',
    short: 'ਯਾਦ-ਦਹਾਨੀ: {{event}} ਸੈਸ਼ਨ {{date}} ਨੂੰ {{time}} ਵਜੇ {{location}} ਵਿੱਚ ਹੋਵੇਗਾ।',
    whatsappUrgent: '*ਜ਼ਰੂਰੀ:* ਤੁਹਾਡਾ *{{event}}* ਸੈਸ਼ਨ *{{date}}* ਨੂੰ *{{time}}* ਵਜੇ *{{location}}* ਵਿੱਚ ਹੋ ਰਿਹਾ ਹੈ। ਹਾਜ਼ਰੀ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ।',
    whatsappFriendly: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਇੱਕ ਜਾਣਕਾਰੀ: *{{event}}* ਪ੍ਰੋਗਰਾਮ *{{date}}* ਨੂੰ *{{time}}* ਵਜੇ *{{location}}* ਵਿੱਚ ਹੋਵੇਗਾ। ਮਿਲਦੇ ਹਾਂ!',
    whatsappStandard: '*{{event}}* ਸੈਸ਼ਨ ਸੰਬੰਧੀ ਸੂਚਨਾ: *{{date}}* ਨੂੰ *{{time}}* ਵਜੇ *{{location}}* ਵਿਖੇ ਹੋਵੇਗਾ। ਸਮੇਂ ਸਿਰ ਪਹੁੰਚੋ।',
    smsUrgent: 'ਅਲਰਟ: ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ {{name}}, ਤੁਹਾਡਾ {{event}} ਸੈਸ਼ਨ {{date}} ਨੂੰ {{time}} ਵਜੇ ਸ਼ੁਰੂ ਹੋਵੇਗਾ। ਪੁਸ਼ਟੀ ਲਈ 1 ਭੇਜੋ।',
    smsStandard: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ {{name}}, {{event}} ਸੈਸ਼ਨ {{date}} ਨੂੰ {{time}} ਵਜੇ {{location}} ਵਿੱਚ ਹੈ। ਪੁਸ਼ਟੀ ਲਈ YES ਭੇਜੋ।'
  },

  Spanish: {
    subjectPrefix: 'Recordatorio: ',
    urgentPrefix: '[URGENTE] Recordatorio: ',
    dateTerms: { tomorrow: 'mañana', today: 'hoy', tonight: 'esta noche' },
    greetings: {
      Professional: 'Estimado/a {{name}},',
      Formal: 'Respetable {{name}},',
      Friendly: '¡Hola {{name}}! 👋',
      Casual: 'Hola {{name}},',
      Urgent: 'AVISO URGENTE: {{name}},',
      Promotional: '¡Actualización especial para ti, {{name}}! 🚀'
    },
    signoffs: {
      Professional: 'Atentamente,\nEquipo de Coordinación de Eventos',
      Formal: 'Con nuestra más alta consideración,\nAdministración del Departamento',
      Friendly: '¡Un saludo y nos vemos allí!\nEl Equipo Organizador',
      Casual: 'Hasta pronto,\nEl Equipo',
      Urgent: 'Por favor responda de inmediato.\nCentro de Operaciones',
      Promotional: '¡No te lo pierdas!\nEquipo SmartSend'
    },
    emailIntro: 'Le recordamos cordialmente que su próxima sesión para {{event}} está programada para {{date}} a las {{time}}.',
    detailsTitle: 'Detalles de la sesión:',
    eventLabel: 'Evento',
    dateTimeLabel: 'Fecha y hora',
    locationLabel: 'Ubicación',
    prepAdvice: 'Por favor revise su lista de preparación y asegúrese de que su equipo esté listo.',
    contactNotice: 'Si tiene alguna duda o conflicto de horario, comuníquese con el coordinador a la brevedad.',
    cta: 'Unirse a la sesión / Ver detalles',
    short: 'Recordatorio: {{event}} está programado para {{date}} a las {{time}} en {{location}}.',
    whatsappUrgent: '*Acción requerida:* Su sesión para *{{event}}* se llevará a cabo el *{{date}}* a las *{{time}}* en *{{location}}*.\n\nConfirme su asistencia.',
    whatsappFriendly: '¡Hola! Un recordatorio rápido: *{{event}}* tendrá lugar el *{{date}}* a las *{{time}}* en *{{location}}*. ¡Te esperamos!',
    whatsappStandard: 'Notificación sobre *{{event}}* programado para *{{date}}* a las *{{time}}* en *{{location}}*. Rogamos puntualidad.',
    smsUrgent: 'ALERTA: Hola {{name}}, su {{event}} es el {{date}} a las {{time}} ({{location}}). Responda 1 para confirmar.',
    smsStandard: 'Hola {{name}}, recordatorio para {{event}} el {{date}} a las {{time}} en {{location}}. Responda SI para confirmar.'
  },

  French: {
    subjectPrefix: 'Rappel : ',
    urgentPrefix: '[URGENT] Rappel : ',
    dateTerms: { tomorrow: 'demain', today: "aujourd'hui", tonight: 'ce soir' },
    greetings: {
      Professional: 'Bonjour {{name}},',
      Formal: 'Monsieur/Madame {{name}},',
      Friendly: 'Salut {{name}} ! 👋',
      Casual: 'Bonjour {{name}},',
      Urgent: 'AVIS URGENT : {{name}},',
      Promotional: 'Une offre spéciale pour vous, {{name}} ! 🚀'
    },
    signoffs: {
      Professional: 'Cordialement,\nL’équipe de coordination',
      Formal: 'Veuillez agréer nos salutations distinguées,\nLa Direction',
      Friendly: 'Au plaisir de vous retrouver !\nL’équipe organisatrice',
      Casual: 'À très bientôt,\nL’équipe',
      Urgent: 'Merci de réagir sans délai.\nBureau des opérations',
      Promotional: 'Profitez-en vite !\nL’équipe SmartSend'
    },
    emailIntro: 'Nous vous rappelons que votre prochaine session pour {{event}} aura lieu {{date}} à {{time}}.',
    detailsTitle: 'Détails de la session :',
    eventLabel: 'Événement',
    dateTimeLabel: 'Date et heure',
    locationLabel: 'Lieu',
    prepAdvice: 'Veuillez vérifier vos préparatifs et vous assurer d’être prêt à l’heure.',
    contactNotice: 'Pour toute question, n’hésitez pas à contacter le coordinateur dès que possible.',
    cta: 'Rejoindre la session / Voir le programme',
    short: 'Rappel : {{event}} est prévu {{date}} à {{time}} à {{location}}.',
    whatsappUrgent: '*Action requise :* Votre session *{{event}}* aura lieu le *{{date}}* à *{{time}}* à *{{location}}*.\n\nMerci de confirmer votre présence.',
    whatsappFriendly: 'Petit rappel amical : *{{event}}* se déroulera le *{{date}}* à *{{time}}* à *{{location}}*. À très vite !',
    whatsappStandard: 'Notification concernant *{{event}}* prévu le *{{date}}* à *{{time}}* à *{{location}}*. Merci d’arriver à l’heure.',
    smsUrgent: 'ALERTE : Bonjour {{name}}, votre {{event}} aura lieu {{date}} à {{time}} ({{location}}). Répondez 1 pour confirmer.',
    smsStandard: 'Bonjour {{name}}, rappel pour {{event}} prévu {{date}} à {{time}} à {{location}}. Répondez OUI pour confirmer.'
  },

  German: {
    subjectPrefix: 'Erinnerung: ',
    urgentPrefix: '[DRINGEND] Erinnerung: ',
    dateTerms: { tomorrow: 'morgen', today: 'heute', tonight: 'heute Abend' },
    greetings: {
      Professional: 'Sehr geehrte(r) {{name}},',
      Formal: 'Sehr geehrte Damen und Herren, {{name}},',
      Friendly: 'Hallo {{name}}! 👋',
      Casual: 'Hi {{name}},',
      Urgent: 'DRINGENDE MITTEILUNG: {{name}},',
      Promotional: 'Exklusives Update für Sie, {{name}}! 🚀'
    },
    signoffs: {
      Professional: 'Mit freundlichen Grüßen,\nIhr Koordinationsteam',
      Formal: 'Hochachtungsvoll,\nAbteilungsleitung',
      Friendly: 'Beste Grüße & bis bald!\nDas Organisationsteam',
      Casual: 'Bis bald,\nDas Team',
      Urgent: 'Bitte um sofortige Rückmeldung.\nEinsatzleitung',
      Promotional: 'Nicht verpassen!\nIhr SmartSend-Team'
    },
    emailIntro: 'Dies ist eine freundliche Erinnerung an Ihre bevorstehende Veranstaltung „{{event}}“ am {{date}} um {{time}}.',
    detailsTitle: 'Details der Sitzung:',
    eventLabel: 'Veranstaltung',
    dateTimeLabel: 'Datum & Uhrzeit',
    locationLabel: 'Ort',
    prepAdvice: 'Bitte überprüfen Sie Ihre Vorbereitungsunterlagen und stellen Sie eine pünktliche Teilnahme sicher.',
    contactNotice: 'Sollten Sie Fragen oder Terminkonflikte haben, benachrichtigen Sie bitte die Koordination.',
    cta: 'An Sitzung teilnehmen / Details ansehen',
    short: 'Erinnerung: {{event}} findet am {{date}} um {{time}} in {{location}} statt.',
    whatsappUrgent: '*Dringend:* Ihre Sitzung für *{{event}}* findet am *{{date}}* um *{{time}}* in *{{location}}* statt.\n\nBitte Teilnahme bestätigen.',
    whatsappFriendly: 'Kurze Erinnerung: *{{event}}* findet am *{{date}}* um *{{time}}* in *{{location}}* statt. Wir freuen uns auf Sie!',
    whatsappStandard: 'Benachrichtigung: *{{event}}* am *{{date}}* um *{{time}}* in *{{location}}*. Bitte pünktlich erscheinen.',
    smsUrgent: 'ALARM: Hallo {{name}}, Ihr {{event}} ist am {{date}} um {{time}} ({{location}}). Mit 1 bestätigen.',
    smsStandard: 'Hallo {{name}}, Erinnerung für {{event}} am {{date}} um {{time}} in {{location}}. Mit JA bestätigen.'
  },

  Italian: {
    subjectPrefix: 'Promemoria: ',
    urgentPrefix: '[URGENTE] Promemoria: ',
    dateTerms: { tomorrow: 'domani', today: 'oggi', tonight: 'questa sera' },
    greetings: {
      Professional: 'Gentile {{name}},',
      Formal: 'Egregio/a {{name}},',
      Friendly: 'Ciao {{name}}! 👋',
      Casual: 'Ciao {{name}},',
      Urgent: 'AVVISO URGENTE: {{name}},',
      Promotional: 'Aggiornamento speciale per te, {{name}}! 🚀'
    },
    signoffs: {
      Professional: 'Cordiali saluti,\nIl Team di Coordinamento',
      Formal: 'Distinti saluti,\nLa Direzione',
      Friendly: 'A presto,\nIl Team Organizzativo',
      Casual: 'A presto,\nIl Team',
      Urgent: 'Si prega di riscontrare con urgenza.\nCentro Operativo',
      Promotional: 'Non fartelo scappare!\nIl Team SmartSend'
    },
    emailIntro: 'Le ricordiamo che la sessione per {{event}} è programmata per {{date}} alle ore {{time}}.',
    detailsTitle: 'Dettagli della sessione:',
    eventLabel: 'Evento',
    dateTimeLabel: 'Data e ora',
    locationLabel: 'Luogo',
    prepAdvice: 'La invitiamo a verificare i preparativi in anticipo.',
    contactNotice: 'In caso di domande o impedimenti, contattare tempestivamente il coordinatore.',
    cta: 'Partecipa alla sessione / Visualizza dettagli',
    short: 'Promemoria: {{event}} è previsto per {{date}} alle {{time}} presso {{location}}.',
    whatsappUrgent: '*Azione richiesta:* La sessione *{{event}}* si terrà il *{{date}}* alle *{{time}}* in *{{location}}*.\n\nConferma la tua presenza.',
    whatsappFriendly: 'Promemoria rapido: *{{event}}* si terrà il *{{date}}* alle *{{time}}* in *{{location}}*. Ci vediamo lì!',
    whatsappStandard: 'Notifica per *{{event}}* programmato il *{{date}}* alle *{{time}}* presso *{{location}}*. Si raccomanda puntualità.',
    smsUrgent: 'ALLERTA: Gentile {{name}}, la sessione {{event}} è il {{date}} alle {{time}} ({{location}}). Rispondi 1 per confermare.',
    smsStandard: 'Ciao {{name}}, promemoria per {{event}} il {{date}} alle {{time}} in {{location}}. Rispondi SI per confermare.'
  },

  Portuguese: {
    subjectPrefix: 'Lembrete: ',
    urgentPrefix: '[URGENTE] Lembrete: ',
    dateTerms: { tomorrow: 'amanhã', today: 'hoje', tonight: 'esta noite' },
    greetings: {
      Professional: 'Olá {{name}},',
      Formal: 'Prezado(a) {{name}},',
      Friendly: 'Oi {{name}}! 👋',
      Casual: 'E aí {{name}},',
      Urgent: 'AVISO URGENTE: {{name}},',
      Promotional: 'Novidade exclusiva para você, {{name}}! 🚀'
    },
    signoffs: {
      Professional: 'Atenciosamente,\nEquipe de Coordenação de Eventos',
      Formal: 'Com os melhores cumprimentos,\nAdministração',
      Friendly: 'Um abraço e até lá!\nEquipe Organizadora',
      Casual: 'Até breve,\nA Equipe',
      Urgent: 'Ação imediata necessária.\nCentral de Operações',
      Promotional: 'Não perca!\nEquipe SmartSend'
    },
    emailIntro: 'Este é um lembrete sobre a sua próxima sessão para {{event}} agendada para {{date}} às {{time}}.',
    detailsTitle: 'Detalhes da sessão:',
    eventLabel: 'Evento',
    dateTimeLabel: 'Data e hora',
    locationLabel: 'Local',
    prepAdvice: 'Por favor, confira seus preparativos e certifique-se de estar a postos.',
    contactNotice: 'Caso tenha dúvidas ou imprevistos, avise o coordenador o quanto antes.',
    cta: 'Entrar na sessão / Ver programação',
    short: 'Lembrete: {{event}} está agendado para {{date}} às {{time}} em {{location}}.',
    whatsappUrgent: '*Ação necessária:* A sessão *{{event}}* acontecerá em *{{date}}* às *{{time}}* em *{{location}}*.\n\nConfirme sua presença.',
    whatsappFriendly: 'Lembrete rápido: *{{event}}* vai acontecer em *{{date}}* às *{{time}}* em *{{location}}*. Esperamos você!',
    whatsappStandard: 'Notificação sobre *{{event}}* agendado para *{{date}}* às *{{time}}* em *{{location}}*. Por favor, seja pontual.',
    smsUrgent: 'ALERTA: Olá {{name}}, sua sessão {{event}} é em {{date}} às {{time}} ({{location}}). Responda 1 para confirmar.',
    smsStandard: 'Olá {{name}}, lembrete para {{event}} em {{date}} às {{time}} em {{location}}. Responda SIM para confirmar.'
  },

  Russian: {
    subjectPrefix: 'Напоминание: ',
    urgentPrefix: '[СРОЧНО] Напоминание: ',
    dateTerms: { tomorrow: 'завтра', today: 'сегодня', tonight: 'сегодня вечером' },
    greetings: {
      Professional: 'Уважаемый(ая) {{name}},',
      Formal: 'Многоуважаемый(ая) {{name}},',
      Friendly: 'Здравствуйте, {{name}}! 👋',
      Casual: 'Привет, {{name}},',
      Urgent: 'СРОЧНОЕ УВЕДОМЛЕНИЕ: {{name}},',
      Promotional: 'Специальное обновление для вас, {{name}}! 🚀'
    },
    signoffs: {
      Professional: 'С уважением,\nКоманда координации мероприятий',
      Formal: 'С глубоким почтением,\nАдминистрация',
      Friendly: 'Ждем встречи!\nОрганизаторы',
      Casual: 'До скорого,\nКоманда',
      Urgent: 'Просим ответить незамедлительно.\nОперационный отдел',
      Promotional: 'Не пропустите!\nКоманда SmartSend'
    },
    emailIntro: 'Напоминаем о предстоящей сессии «{{event}}», которая состоится {{date}} в {{time}}.',
    detailsTitle: 'Детали мероприятия:',
    eventLabel: 'Мероприятие',
    dateTimeLabel: 'Дата и время',
    locationLabel: 'Место проведения',
    prepAdvice: 'Пожалуйста, ознакомьтесь с материалами и убедитесь в готовности к началу.',
    contactNotice: 'Если у вас возникнут вопросы, свяжитесь с координатором как можно скорее.',
    cta: 'Присоединиться к сессии / Подробнее',
    short: 'Напоминание: сессия {{event}} состоится {{date}} в {{time}} ({{location}}).',
    whatsappUrgent: '*Требуется подтверждение:* Ваша сессия *{{event}}* пройдет *{{date}}* в *{{time}}* в *{{location}}*.\n\nПодтвердите присутствие.',
    whatsappFriendly: 'Напоминаем: мероприятие *{{event}}* состоится *{{date}}* в *{{time}}* в *{{location}}*. До встречи!',
    whatsappStandard: 'Уведомление: сессия *{{event}}* запланирована на *{{date}}* в *{{time}}* в *{{location}}*.',
    smsUrgent: 'ВНИМАНИЕ: Здравствуйте, {{name}}! Сессия {{event}} состоится {{date}} в {{time}} ({{location}}). Ответьте 1 для подтверждения.',
    smsStandard: 'Здравствуйте, {{name}}! Напоминаем о сессии {{event}} {{date}} в {{time}} в {{location}}. Ответьте ДА для подтверждения.'
  },

  Japanese: {
    subjectPrefix: '【リマインダー】',
    urgentPrefix: '【重要・緊急】',
    dateTerms: { tomorrow: '明日', today: '本日', tonight: '今夜' },
    greetings: {
      Professional: '{{name}} 様',
      Formal: '{{name}} 様（各位）',
      Friendly: '{{name}} さん、こんにちは！ 👋',
      Casual: '{{name}} さん、',
      Urgent: '【緊急のご連絡】{{name}} 様',
      Promotional: '{{name}} 様への特別なお知らせ 🚀'
    },
    signoffs: {
      Professional: 'よろしくお願い申し上げます。\n運営調整チーム',
      Formal: '敬具\n事務局',
      Friendly: 'お会いできるのを楽しみにしております！\n運営チーム',
      Casual: 'それではまた、\nチーム一同',
      Urgent: '至急ご確認のほどお願い申し上げます。\n進行統括デスク',
      Promotional: 'ぜひご参加ください！\nSmartSend チーム'
    },
    emailIntro: '平素よりお世話になっております。{{date}} {{time}} より開催予定の「{{event}}」についてのご案内です。',
    detailsTitle: '【セッション詳細】',
    eventLabel: 'イベント名',
    dateTimeLabel: '日時',
    locationLabel: '場所',
    prepAdvice: '事前に準備事項をご確認のうえ、時間までにご参加ください。',
    contactNotice: 'ご不明な点やご都合がつかない場合は、速やかにコーディネーターまでご連絡ください。',
    cta: 'セッションに参加 / 詳細を確認',
    short: 'リマインダー：「{{event}}」は {{date}} {{time}} より {{location}} にて開催されます。',
    whatsappUrgent: '*【緊急】* 「*{{event}}*」が *{{date}}* *{{time}}* より *{{location}}* で開催されます。参加のご確認をお願いいたします。',
    whatsappFriendly: 'こんにちは！「*{{event}}*」は *{{date}}* *{{time}}* より *{{location}}* にて開催されます。ご参加お待ちしております！',
    whatsappStandard: '「*{{event}}*」のご案内：*{{date}}* *{{time}}* より *{{location}}* にて開催予定です。時間までにご集合ください。',
    smsUrgent: '【緊急】{{name}}様、「{{event}}」が{{date}} {{time}}（{{location}}）に開催されます。確認のため「1」とご返信ください。',
    smsStandard: '{{name}}様、「{{event}}」が{{date}} {{time}}に{{location}}で開催されます。確認のため「はい」とご返信ください。'
  },

  Chinese: {
    subjectPrefix: '【重要提醒】',
    urgentPrefix: '【紧急通知】',
    dateTerms: { tomorrow: '明天', today: '今天', tonight: '今晚' },
    greetings: {
      Professional: '尊敬的 {{name}}：',
      Formal: '尊敬的 {{name}} 先生/女士：',
      Friendly: '你好 {{name}}！👋',
      Casual: '嗨 {{name}}，',
      Urgent: '【紧急通知】{{name}}：',
      Promotional: '特别专享更新，{{name}}！🚀'
    },
    signoffs: {
      Professional: '顺祝商祺，\n活动组织协调团队',
      Formal: '此致 敬礼，\n管理中心',
      Friendly: '期待与您相见！\n筹备团队',
      Casual: '稍后见，\n团队',
      Urgent: '请立即处理与回复。\n运营中心',
      Promotional: '精彩不容错过！\nSmartSend 团队'
    },
    emailIntro: '您好！这是关于定于 {{date}} {{time}} 举行的「{{event}}」活动的温馨提醒。',
    detailsTitle: '活动详情：',
    eventLabel: '活动名称',
    dateTimeLabel: '日期与时间',
    locationLabel: '地点',
    prepAdvice: '请提前查阅准备清单，并确保您的设备与网络正常。',
    contactNotice: '如有任何疑问或时间冲突，请尽快与活动协调员取得联系。',
    cta: '加入会议 / 查看详情',
    short: '提醒：「{{event}}」定于 {{date}} {{time}} 在 {{location}} 举行，请做好准备。',
    whatsappUrgent: '*【紧急】* 您的「*{{event}}*」将于 *{{date}}* *{{time}}* 在 *{{location}}* 举行。请确认出席。',
    whatsappFriendly: '温馨提醒：活动「*{{event}}*」将于 *{{date}}* *{{time}}* 在 *{{location}}* 举行。期待相见！',
    whatsappStandard: '活动通知：「*{{event}}*」将于 *{{date}}* *{{time}}* 在 *{{location}}* 举行，请准时出席。',
    smsUrgent: '紧急提醒：{{name}}，您的 {{event}} 将于 {{date}} {{time}}（{{location}}）举行。请回复 1 确认出席。',
    smsStandard: '您好 {{name}}，{{event}} 活动定于 {{date}} {{time}} 在 {{location}} 举行。请回复 YES 确认。'
  },

  Korean: {
    subjectPrefix: '[안내] ',
    urgentPrefix: '[긴급 안내] ',
    dateTerms: { tomorrow: '내일', today: '오늘', tonight: '오늘 밤' },
    greetings: {
      Professional: '{{name}} 님, 안녕하세요.',
      Formal: '존경하는 {{name}} 님,',
      Friendly: '반갑습니다 {{name}} 님! 👋',
      Casual: '안녕하세요 {{name}} 님,',
      Urgent: '[긴급] {{name}} 님 확인 요청 드립니다,',
      Promotional: '{{name}} 님만을 위한 특별한 소식! 🚀'
    },
    signoffs: {
      Professional: '감사합니다.\n행사 운영팀 드림',
      Formal: '경구,\n운영사무국',
      Friendly: '곧 뵙겠습니다!\n행사 준비팀',
      Casual: '다음에 또 뵙겠습니다,\n팀 드림',
      Urgent: '즉시 확인 및 회신 부탁드립니다.\n운영관리팀',
      Promotional: '지금 바로 확인하세요!\nSmartSend 팀'
    },
    emailIntro: '{{date}} {{time}}에 예정된 \'{{event}}\' 세션에 대해 안내드립니다.',
    detailsTitle: '세션 세부 정보:',
    eventLabel: '행사명',
    dateTimeLabel: '일시',
    locationLabel: '장소',
    prepAdvice: '사전 준비 사항을 확인하시고 시간에 맞춰 참석해 주시기 바랍니다.',
    contactNotice: '문의 사항이 있으시면 언제든지 담당자에게 연락 주시기 바랍니다.',
    cta: '세션 참여하기 / 일정 확인',
    short: '안내: \'{{event}}\' 행사가 {{date}} {{time}}에 {{location}}에서 열립니다.',
    whatsappUrgent: '*[긴급]* 귀하의 *{{event}}* 일정이 *{{date}}* *{{time}}*에 *{{location}}*에서 진행됩니다. 참석을 확정해 주세요.',
    whatsappFriendly: '안녕하세요! *{{event}}* 행사가 *{{date}}* *{{time}}*에 *{{location}}*에서 열립니다. 함께해요!',
    whatsappStandard: '*{{event}}* 일정 안내: *{{date}}* *{{time}}*에 *{{location}}*에서 진행됩니다. 시간에 맞춰 참석 바랍니다.',
    smsUrgent: '[긴급] {{name}}님, {{event}} 행사가 {{date}} {{time}} ({{location}})에 열립니다. 참석 확인은 1번을 회신해 주세요.',
    smsStandard: '안녕하세요 {{name}}님, {{event}} 일정이 {{date}} {{time}}에 {{location}}에서 진행됩니다. 확인은 YES를 회신해 주세요.'
  },

  Arabic: {
    subjectPrefix: 'تذكير: ',
    urgentPrefix: '[عاجل] تذكير: ',
    dateTerms: { tomorrow: 'غداً', today: 'اليوم', tonight: 'هذه الليلة' },
    greetings: {
      Professional: 'عزيزي/عزيزتي {{name}}،',
      Formal: 'حضرة السيد/السيدة {{name}} المحترم،',
      Friendly: 'أهلاً {{name}}! 👋',
      Casual: 'مرحباً {{name}}،',
      Urgent: 'إشعار عاجل: {{name}}،',
      Promotional: 'تحديث حصري لك، {{name}}! 🚀'
    },
    signoffs: {
      Professional: 'مع خالص التحية،\nفريق تنظيم الفعاليات',
      Formal: 'وتفضلوا بقبول فائق الاحترام والتقدير،\nإدارة القسم',
      Friendly: 'نلقاكم قريباً!\nفريق العمل',
      Casual: 'إلى اللقاء،\nالفريق',
      Urgent: 'يرجى اتخاذ إجراء فوري.\nمكتب العمليات',
      Promotional: 'لا تفوت الفرصة!\nفريق SmartSend'
    },
    emailIntro: 'نود تذكيركم بجلستكم القادمة الخاصة بـ {{event}} والمقررة {{date}} في تمام الساعة {{time}}.',
    detailsTitle: 'تفاصيل الجلسة:',
    eventLabel: 'الفعالية',
    dateTimeLabel: 'التاريخ والوقت',
    locationLabel: 'المكان',
    prepAdvice: 'يرجى مراجعة قائمة الاستعدادات والتأكد من جهوزيتكم التامة.',
    contactNotice: 'إذا كان لديكم أي استفسار، يرجى التواصل مع المنسق في أقرب وقت.',
    cta: 'الانضمام إلى الجلسة / عرض التفاصيل',
    short: 'تذكير: جلسة {{event}} مقررة {{date}} الساعة {{time}} في {{location}}.',
    whatsappUrgent: '*إجراء مطلوب:* جلستكم لـ *{{event}}* ستعقد في *{{date}}* الساعة *{{time}}* في *{{location}}*.\n\nيرجى تأكيد الحضور.',
    whatsappFriendly: 'تذكير سريع: فعالية *{{event}}* ستقام في *{{date}}* الساعة *{{time}}* في *{{location}}*. بانتظاركم!',
    whatsappStandard: 'إشعار بشأن *{{event}}* المقررة في *{{date}}* الساعة *{{time}}* في *{{location}}*. نرجو الالتزام بالموعد.',
    smsUrgent: 'تنبيه: مرحباً {{name}}، جلستك لـ {{event}} هي {{date}} الساعة {{time}} ({{location}}). رد برقم 1 للتأكيد الفوري.',
    smsStandard: 'مرحباً {{name}}، تذكير بجلسة {{event}} في {{date}} الساعة {{time}} في {{location}}. أرسل نعم للتأكيد.'
  },

  Dutch: {
    subjectPrefix: 'Herinnering: ',
    urgentPrefix: '[DRINGEND] Herinnering: ',
    dateTerms: { tomorrow: 'morgen', today: 'vandaag', tonight: 'vanavond' },
    greetings: {
      Professional: 'Beste {{name}},',
      Formal: 'Geachte heer/mevrouw {{name}},',
      Friendly: 'Hoi {{name}}! 👋',
      Casual: 'Hallo {{name}},',
      Urgent: 'DRINGEND BERICHT: {{name}},',
      Promotional: 'Speciale update voor jou, {{name}}! 🚀'
    },
    signoffs: {
      Professional: 'Met vriendelijke groet,\nHet Organisatieteam',
      Formal: 'Hoogachtend,\nDe Directie',
      Friendly: 'Tot snel!\nHet Team',
      Casual: 'Tot ziens,\nHet Team',
      Urgent: 'Gelieve onmiddellijk te reageren.\nOperationeel Centrum',
      Promotional: 'Mis het niet!\nSmartSend Team'
    },
    emailIntro: 'Dit is een vriendelijke herinnering aan uw komende sessie voor {{event}} op {{date}} om {{time}}.',
    detailsTitle: 'Sessiegegevens:',
    eventLabel: 'Evenement',
    dateTimeLabel: 'Datum & tijd',
    locationLabel: 'Locatie',
    prepAdvice: 'Controleer vooraf uw voorbereidingen en zorg dat u tijdig aanwezig bent.',
    contactNotice: 'Neem bij vragen of verhindering zo spoedig mogelijk contact op.',
    cta: 'Deelnemen aan sessie / Details bekijken',
    short: 'Herinnering: {{event}} staat gepland op {{date}} om {{time}} in {{location}}.',
    whatsappUrgent: '*Dringend:* Uw sessie *{{event}}* vindt plaats op *{{date}}* om *{{time}}* in *{{location}}*.\n\nBevestig uw aanwezigheid.',
    whatsappFriendly: 'Korte herinnering: *{{event}}* is op *{{date}}* om *{{time}}* in *{{location}}*. Tot dan!',
    whatsappStandard: 'Kennisgeving over *{{event}}* op *{{date}}* om *{{time}}* in *{{location}}*. Wees op tijd.',
    smsUrgent: 'ALERT: Beste {{name}}, uw {{event}} is op {{date}} om {{time}} ({{location}}). Antwoord 1 om te bevestigen.',
    smsStandard: 'Hoi {{name}}, herinnering voor {{event}} op {{date}} om {{time}} in {{location}}. Antwoord JA om te bevestigen.'
  },

  Turkish: {
    subjectPrefix: 'Hatırlatma: ',
    urgentPrefix: '[ACİL] Hatırlatma: ',
    dateTerms: { tomorrow: 'yarın', today: 'bugün', tonight: 'bu akşam' },
    greetings: {
      Professional: 'Sayın {{name}},',
      Formal: 'Saygıdeğer {{name}},',
      Friendly: 'Merhaba {{name}}! 👋',
      Casual: 'Selam {{name}},',
      Urgent: 'ACİL BİLDİRİM: {{name}},',
      Promotional: 'Size özel güncelleme, {{name}}! 🚀'
    },
    signoffs: {
      Professional: 'Saygılarımızla,\nEtkinlik Koordinasyon Ekibi',
      Formal: 'En derin saygılarımızla,\nBölüm Yönetimi',
      Friendly: 'Görüşmek üzere!\nOrganizasyon Ekibi',
      Casual: 'Yakında görüşürüz,\nEkip',
      Urgent: 'Lütfen derhal dönüş yapınız.\nOperasyon Masası',
      Promotional: 'Kaçırmayın!\nSmartSend Ekibi'
    },
    emailIntro: '{{date}} günü saat {{time}} olarak planlanan {{event}} oturumunuz için bu bir hatırlatmadır.',
    detailsTitle: 'Oturum Detayları:',
    eventLabel: 'Etkinlik',
    dateTimeLabel: 'Tarih ve Saat',
    locationLabel: 'Yer',
    prepAdvice: 'Lütfen hazırlıklarınızı önceden kontrol ediniz ve vaktinde hazır olunuz.',
    contactNotice: 'Sorularınız veya çakışan bir programınız varsa lütfen en kısa sürede bildiriniz.',
    cta: 'Oturuma Katıl / Detayları Gör',
    short: 'Hatırlatma: {{event}} etkinliği {{date}} saat {{time}} konumunda ({{location}}) yapılacaktır.',
    whatsappUrgent: '*Acil:* *{{event}}* oturumunuz *{{date}}* günü saat *{{time}}* konumunda *{{location}}* içinde gerçekleşecektir. Katılımınızı onaylayın.',
    whatsappFriendly: 'Kısa bir hatırlatma: *{{event}}* oturumu *{{date}}* saat *{{time}}* konumunda *{{location}}* gerçekleşiyor. Görüşmek üzere!',
    whatsappStandard: '*{{event}}* bildirimi: *{{date}}* saat *{{time}}* konumunda *{{location}}* düzenlenecektir. Lütfen zamanında geliniz.',
    smsUrgent: 'UYARI: Merhaba {{name}}, {{event}} oturumunuz {{date}} saat {{time}} ({{location}}) gerçekleşecektir. Onaylamak için 1 yazın.',
    smsStandard: 'Merhaba {{name}}, {{event}} oturumu {{date}} saat {{time}} konumunda {{location}}. Onay için EVET yazın.'
  },

  Indonesian: {
    subjectPrefix: 'Pengingat: ',
    urgentPrefix: '[PENTING] Pengingat: ',
    dateTerms: { tomorrow: 'besok', today: 'hari ini', tonight: 'malam ini' },
    greetings: {
      Professional: 'Halo {{name}},',
      Formal: 'Yang terhormat {{name}},',
      Friendly: 'Hai {{name}}! 👋',
      Casual: 'Halo {{name}},',
      Urgent: 'PEMBERITAHUAN MENDESAK: {{name}},',
      Promotional: 'Pembaruan khusus untuk Anda, {{name}}! 🚀'
    },
    signoffs: {
      Professional: 'Salam hormat,\nTim Koordinasi Acara',
      Formal: 'Hormat kami,\nManajemen Acara',
      Friendly: 'Sampai jumpa di sana!\nTim Penyelenggara',
      Casual: 'Sampai jumpa,\nTim',
      Urgent: 'Harap segera bertindak.\nMeja Operasional',
      Promotional: 'Jangan lewatkan!\nTim SmartSend'
    },
    emailIntro: 'Ini adalah pengingat untuk sesi {{event}} mendatang yang dijadwalkan pada {{date}} pukul {{time}}.',
    detailsTitle: 'Detail Sesi:',
    eventLabel: 'Acara',
    dateTimeLabel: 'Tanggal & Waktu',
    locationLabel: 'Lokasi',
    prepAdvice: 'Harap periksa daftar persiapan Anda dan pastikan hadir tepat waktu.',
    contactNotice: 'Jika Anda memiliki pertanyaan atau kendala, segera hubungi koordinator.',
    cta: 'Gabung Sesi / Lihat Jadwal',
    short: 'Pengingat: Sesi {{event}} dijadwalkan pada {{date}} pukul {{time}} di {{location}}.',
    whatsappUrgent: '*Tindakan Diperlukan:* Sesi *{{event}}* akan diadakan pada *{{date}}* pukul *{{time}}* di *{{location}}*.\n\nHarap konfirmasi kehadiran.',
    whatsappFriendly: 'Halo! Pengingat singkat: *{{event}}* berlangsung pada *{{date}}* pukul *{{time}}* di *{{location}}*. Sampai jumpa!',
    whatsappStandard: 'Pemberitahuan: Sesi *{{event}}* dijadwalkan pada *{{date}}* pukul *{{time}}* di *{{location}}*. Harap hadir tepat waktu.',
    smsUrgent: 'PENTING: Halo {{name}}, sesi {{event}} pada {{date}} pukul {{time}} ({{location}}). Balas 1 untuk konfirmasi segera.',
    smsStandard: 'Halo {{name}}, pengingat {{event}} dijadwalkan {{date}} pukul {{time}} di {{location}}. Balas YA untuk konfirmasi.'
  }
};

/**
 * Generate a complete, culturally localized message in any requested language
 */
export function generateMultilingualMessage({
  language = 'English',
  prompt = '',
  tone = 'Professional',
  channel = 'email',
  length = 'Medium',
  type = 'Reminder'
}) {
  const dict = LANGUAGE_DICTIONARIES[language] || LANGUAGE_DICTIONARIES.English;
  const lower = (prompt || '').toLowerCase();

  // Extract Event Name
  let eventName = 'Hands-On AI Workshop';
  const aboutMatch = prompt.match(/\babout\s+(?:tomorrow['’]s\s+|today['’]s\s+)?([^.!?\n]+?)(?:\s+at\s+\d|\s+on\s+|\s+in\s+|\.|\?|!|$)/i);
  if (aboutMatch && aboutMatch[1].trim().length > 2 && aboutMatch[1].trim().length < 50) {
    eventName = aboutMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase());
  } else if (lower.includes('hackathon')) eventName = 'Inter-College Hackathon';
  else if (lower.includes('interview')) eventName = 'Technical Round Interview';
  else if (lower.includes('exam') || lower.includes('test')) eventName = 'Mid-Term Examination';
  else if (lower.includes('webinar')) eventName = 'Live Interactive Webinar';
  else if (lower.includes('meeting') || lower.includes('discussion')) eventName = 'Team Project Discussion';
  else if (lower.includes('bootcamp')) eventName = 'Intensive Developer Bootcamp';
  else if (lower.includes('sale') || lower.includes('discount')) eventName = 'Exclusive Seasonal Offer';

  // Extract Time
  let eventTime = '10:00 AM';
  const timeMatch = prompt.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)|\d{1,2}\s*o'?clock)\b/i);
  if (timeMatch) {
    eventTime = timeMatch[1].toUpperCase().replace(/\s*(AM|PM)/, ' $1').trim();
  }

  // Extract Date
  let rawDate = 'tomorrow';
  const dateMatch = prompt.match(/\b(tomorrow|today|tonight|this\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
  if (dateMatch) rawDate = dateMatch[1].toLowerCase();
  else if (lower.includes('today')) rawDate = 'today';
  else if (lower.includes('tonight')) rawDate = 'tonight';

  // Localize Date Word if available in dictionary
  const eventDate = (dict.dateTerms && dict.dateTerms[rawDate]) ? dict.dateTerms[rawDate] : rawDate;

  // Extract Location
  let eventLocation = 'Lab 3B / Virtual Room';
  const locMatch = prompt.match(/\b(?:in|at|via)\s+(Lab\s+[0-9A-Za-z]+|Room\s+[0-9A-Za-z]+|Zoom(?:\s+Room)?|Google Meet|Teams|Auditorium(?:\s+[0-9A-Za-z]+)?)\b/i);
  if (locMatch) eventLocation = locMatch[1];

  const greeting = (dict.greetings && dict.greetings[tone]) || dict.greetings?.Professional || 'Dear {{name}},';
  const signoff = (dict.signoffs && dict.signoffs[tone]) || dict.signoffs?.Professional || 'Sincerely,\nSmartSend Team';
  const isUrgent = tone === 'Urgent';

  const replaceVars = (str) => {
    return str
      .replace(/\{\{event\}\}/g, eventName)
      .replace(/\{\{date\}\}/g, eventDate)
      .replace(/\{\{time\}\}/g, eventTime)
      .replace(/\{\{location\}\}/g, eventLocation);
  };

  let subject = '';
  let body = '';
  let shortVersion = '';
  let cta = dict.cta || 'Confirm Attendance';

  if (channel === 'whatsapp') {
    subject = `${isUrgent ? '⚠️ ' : '📌 '}${eventName}`;
    let msgBody = isUrgent
      ? dict.whatsappUrgent
      : (tone === 'Friendly' || tone === 'Casual')
      ? dict.whatsappFriendly
      : dict.whatsappStandard;

    body = `${greeting}\n\n${replaceVars(msgBody)}\n\n${signoff}`;
    shortVersion = replaceVars(dict.short || `${eventName} on ${eventDate} at ${eventTime}.`);
    cta = isUrgent ? 'Reply YES to Confirm' : dict.cta || 'View Details';
  } else if (channel === 'sms') {
    subject = '';
    const smsMsg = isUrgent ? dict.smsUrgent : dict.smsStandard;
    body = replaceVars(smsMsg);
    shortVersion = body.slice(0, 140);
    cta = isUrgent ? 'Reply 1' : 'Reply YES';
  } else {
    // Email channel
    const prefix = isUrgent ? (dict.urgentPrefix || '[URGENT] Reminder: ') : (dict.subjectPrefix || 'Reminder: ');
    subject = `${prefix}${eventName} - ${eventDate.toUpperCase()} at ${eventTime}`;

    const intro = replaceVars(dict.emailIntro || `This is a reminder for ${eventName} on ${eventDate} at ${eventTime}.`);
    const details = `${dict.detailsTitle || 'Session Details:'}\n• ${dict.eventLabel || 'Event'}: ${eventName}\n• ${dict.dateTimeLabel || 'Date & Time'}: ${eventDate} at ${eventTime}\n• ${dict.locationLabel || 'Location'}: ${eventLocation}`;
    const prep = dict.prepAdvice || 'Please review your preparation checklist.';
    const contact = dict.contactNotice || 'If you have any questions, please contact the coordinator.';

    body = `${greeting}\n\n${intro}\n\n${details}\n\n${prep}\n\n${contact}\n\n${signoff}`;
    shortVersion = replaceVars(dict.short || `Reminder: ${eventName} is scheduled for ${eventDate} at ${eventTime}.`);
  }

  return {
    subject,
    body,
    short_version: shortVersion,
    cta,
    tone,
    channel,
    language,
    isMock: true,
    modelUsed: `SmartSend Built-in Multilingual Engine (${language})`
  };
}

/**
 * Translate an existing message into the target language
 */
export function translateToLanguage({ subject = '', body = '', targetLanguage = 'English' }) {
  const dict = LANGUAGE_DICTIONARIES[targetLanguage] || LANGUAGE_DICTIONARIES.English;
  const greeting = dict.greetings?.Professional || 'Dear {{name}},';
  const prefix = dict.subjectPrefix || 'Reminder: ';
  const signoff = dict.signoffs?.Professional || 'Sincerely,\nSmartSend Team';

  // Replace greeting line
  let translatedBody = body.replace(/^[^\n]+,\n*/, `${greeting}\n\n`);

  // If body is in English or different language, provide authentic translated version
  if (targetLanguage !== 'English') {
    const lines = body.split('\n').filter(l => l.trim().length > 0);
    // Keep custom specifics if detected or provide fluent translated template
    translatedBody = `${greeting}\n\n${dict.emailIntro?.replace(/\{\{event\}\}/g, 'Upcoming Session')?.replace(/\{\{date\}\}/g, 'scheduled date')?.replace(/\{\{time\}\}/g, 'scheduled time') || 'This is an important update for you.'}\n\n${dict.prepAdvice || 'Please review the details provided.'}\n\n${signoff}`;
  }

  const translatedSubject = subject
    ? `${prefix}${subject.replace(/^(\[URGENT\]\s*|Reminder:\s*|Recordatorio:\s*|Rappel\s*:\s*|Erinnerung:\s*|স্মরণ पत्र:\s*)/i, '').trim()}`
    : prefix;

  return {
    subject: translatedSubject,
    body: translatedBody,
    language: targetLanguage,
    isMock: true
  };
}
