import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'kn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

interface Translations {
  [key: string]: {
    en: string;
    kn: string;
  };
}

const translations: Translations = {
  'hero.title': {
    en: 'Empowering Indian Farmers',
    kn: 'ಭಾರತೀಯ ರೈತರನ್ನು ಶಕ್ತಿಯುತಗೊಳಿಸುವುದು'
  },
  'hero.subtitle': {
    en: 'Complete farming management platform with crop planning, weather forecasts, market prices, and supply chain tracking',
    kn: 'ಬೆಳೆ ಯೋಜನೆ, ಹವಾಮಾನ ಮುನ್ನೋಟಗಳು, ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು ಮತ್ತು ಪೂರೈಕೆ ಸರಪಳಿ ಟ್ರ್ಯಾಕಿಂಗ್‌ನೊಂದಿಗೆ ಸಂಪೂರ್ಣ ಕೃಷಿ ನಿರ್ವಹಣಾ ವೇದಿಕೆ'
  },
  'features.title': {
    en: 'Comprehensive Farming Solutions',
    kn: 'ಸಮಗ್ರ ಕೃಷಿ ಪರಿಹಾರಗಳು'
  },
  'features.cropPlanning': {
    en: 'Smart crop planning based on soil type, location, and weather conditions',
    kn: 'ಮಣ್ಣಿನ ಪ್ರಕಾರ, ಸ್ಥಳ ಮತ್ತು ಹವಾಮಾನ ಪರಿಸ್ಥಿತಿಗಳ ಆಧಾರದ ಮೇಲೆ ಸ್ಮಾರ್ಟ್ ಬೆಳೆ ಯೋಜನೆ'
  },
  'features.weather': {
    en: 'Real-time weather forecasts and agricultural alerts',
    kn: 'ನೈಜ ಸಮಯದ ಹವಾಮಾನ ಮುನ್ನೋಟಗಳು ಮತ್ತು ಕೃಷಿ ಎಚ್ಚರಿಕೆಗಳು'
  },
  'features.market': {
    en: 'Current market prices and demand forecasting',
    kn: 'ಪ್ರಸ್ತುತ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು ಮತ್ತು ಬೇಡಿಕೆ ಮುನ್ನೋಟ'
  },
  'features.supply': {
    en: 'Complete supply chain tracking from farm to market',
    kn: 'ಫಾರ್ಮ್‌ನಿಂದ ಮಾರುಕಟ್ಟೆಗೆ ಸಂಪೂರ್ಣ ಪೂರೈಕೆ ಸರಪಳಿ ಟ್ರ್ಯಾಕಿಂಗ್'
  },
  'cta.getStarted': {
    en: 'Get Started',
    kn: 'ಪ್ರಾರಂಭಿಸಿ'
  },
  'cta.learnMore': {
    en: 'Learn More',
    kn: 'ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ'
  },
  // Crop Planning translations
  'cropPlanning.title': {
    en: 'Crop Planning Assistant',
    kn: 'ಬೆಳೆ ಯೋಜನೆ ಸಹಾಯಕ'
  },
  'cropPlanning.welcome': {
    en: 'Welcome',
    kn: 'ಸ್ವಾಗತ'
  },
  'cropPlanning.description': {
    en: 'Plan your crops scientifically with intelligent recommendations based on soil, climate, and market conditions.',
    kn: 'ಮಣ್ಣು, ಹವಾಮಾನ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಪರಿಸ್ಥಿತಿಗಳ ಆಧಾರದ ಮೇಲೆ ಬುದ್ಧಿವಂತ ಶಿಫಾರಸುಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಬೆಳೆಗಳನ್ನು ವೈಜ್ಞಾನಿಕವಾಗಿ ಯೋಜಿಸಿ.'
  },
  'cropPlanning.totalPlans': {
    en: 'Total Plans',
    kn: 'ಒಟ್ಟು ಯೋಜನೆಗಳು'
  },
  'cropPlanning.currentlyGrowing': {
    en: 'Currently Growing',
    kn: 'ಪ್ರಸ್ತುತ ಬೆಳೆಯುತ್ತಿರುವ'
  },
  'cropPlanning.planned': {
    en: 'Planned',
    kn: 'ಯೋಜಿತ'
  },
  'cropPlanning.harvested': {
    en: 'Harvested',
    kn: 'ಕೊಯ್ಲು ಮಾಡಲಾಗಿದೆ'
  },
  'cropPlanning.addNew': {
    en: 'Add New Crop Plan',
    kn: 'ಹೊಸ ಬೆಳೆ ಯೋಜನೆ ಸೇರಿಸಿ'
  },
  'cropPlanning.createNew': {
    en: 'Create New Crop Plan',
    kn: 'ಹೊಸ ಬೆಳೆ ಯೋಜನೆ ರಚಿಸಿ'
  },
  'cropPlanning.edit': {
    en: 'Edit Crop Plan',
    kn: 'ಬೆಳೆ ಯೋಜನೆ ಸಂಪಾದಿಸಿ'
  },
  'cropPlanning.cropType': {
    en: 'Crop Type',
    kn: 'ಬೆಳೆ ಪ್ರಕಾರ'
  },
  'cropPlanning.soilType': {
    en: 'Soil Type',
    kn: 'ಮಣ್ಣಿನ ಪ್ರಕಾರ'
  },
  'cropPlanning.location': {
    en: 'Location',
    kn: 'ಸ್ಥಳ'
  },
  'cropPlanning.area': {
    en: 'Area (acres)',
    kn: 'ಪ್ರದೇಶ (ಎಕರೆ)'
  },
  'cropPlanning.expectedYield': {
    en: 'Expected Yield (tons)',
    kn: 'ನಿರೀಕ್ಷಿತ ಇಳುವರಿ (ಟನ್)'
  },
  'cropPlanning.plantingDate': {
    en: 'Planting Date',
    kn: 'ನೆಟ್ಟ ದಿನಾಂಕ'
  },
  'cropPlanning.harvestDate': {
    en: 'Expected Harvest Date',
    kn: 'ನಿರೀಕ್ಷಿತ ಕೊಯ್ಲು ದಿನಾಂಕ'
  },
  'cropPlanning.notes': {
    en: 'Notes',
    kn: 'ಟಿಪ್ಪಣಿಗಳು'
  },
  'cropPlanning.create': {
    en: 'Create Plan',
    kn: 'ಯೋಜನೆ ರಚಿಸಿ'
  },
  'cropPlanning.update': {
    en: 'Update Plan',
    kn: 'ಯೋಜನೆ ನವೀಕರಿಸಿ'
  },
  'cropPlanning.cancel': {
    en: 'Cancel',
    kn: 'ರದ್ದುಮಾಡಿ'
  },
  'cropPlanning.edit.button': {
    en: 'Edit',
    kn: 'ಸಂಪಾದಿಸಿ'
  },
  'cropPlanning.delete': {
    en: 'Delete',
    kn: 'ಅಳಿಸಿ'
  },
  'cropPlanning.noPlans': {
    en: 'No crop plans yet',
    kn: 'ಇನ್ನೂ ಯಾವುದೇ ಬೆಳೆ ಯೋಜನೆಗಳಿಲ್ಲ'
  },
  'cropPlanning.createFirst': {
    en: 'Start planning your crops by creating your first crop plan.',
    kn: 'ನಿಮ್ಮ ಮೊದಲ ಬೆಳೆ ಯೋಜನೆಯನ್ನು ರಚಿಸುವ ಮೂಲಕ ನಿಮ್ಮ ಬೆಳೆಗಳನ್ನು ಯೋಜಿಸಲು ಪ್ರಾರಂಭಿಸಿ.'
  },
  'cropPlanning.createFirstButton': {
    en: 'Create Your First Plan',
    kn: 'ನಿಮ್ಮ ಮೊದಲ ಯೋಜನೆ ರಚಿಸಿ'
  },
  // Common translations
  'common.loading': {
    en: 'Loading...',
    kn: 'ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...'
  },
  'common.role': {
    en: 'Role',
    kn: 'ಪಾತ್ರ'
  },
  'common.notSet': {
    en: 'Not set',
    kn: 'ಹೊಂದಿಸಲಾಗಿಲ್ಲ'
  },
  'common.notSpecified': {
    en: 'Not specified',
    kn: 'ನಿರ್ದಿಷ್ಟಪಡಿಸಲಾಗಿಲ್ಲ'
  },
  // Disease Detection translations
  'diseaseDetection.title': {
    en: 'AI Crop Disease Detection',
    kn: 'AI ಬೆಳೆ ರೋಗ ಪತ್ತೆ'
  },
  'diseaseDetection.subtitle': {
    en: 'Upload crop images to detect diseases and get treatment recommendations',
    kn: 'ರೋಗಗಳನ್ನು ಪತ್ತೆ ಮಾಡಲು ಮತ್ತು ಚಿಕಿತ್ಸೆಯ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಲು ಬೆಳೆ ಚಿತ್ರಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ'
  },
  'diseaseDetection.uploadTitle': {
    en: 'Upload Crop Image',
    kn: 'ಬೆಳೆ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ'
  },
  'diseaseDetection.uploadDescription': {
    en: 'Take a clear photo of the affected crop leaves, stems, or fruits',
    kn: 'ಪೀಡಿತ ಬೆಳೆ ಎಲೆಗಳು, ಕಾಂಡಗಳು ಅಥವಾ ಹಣ್ಣುಗಳ ಸ್ಪಷ್ಟ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ'
  },
  'diseaseDetection.dragDrop': {
    en: 'Drag and drop an image, or click to select',
    kn: 'ಚಿತ್ರವನ್ನು ಡ್ರ್ಯಾಗ್ ಮತ್ತು ಡ್ರಾಪ್ ಮಾಡಿ, ಅಥವಾ ಆಯ್ಕೆ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ'
  },
  'diseaseDetection.selectImage': {
    en: 'Select Image',
    kn: 'ಚಿತ್ರವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ'
  },
  'diseaseDetection.removeImage': {
    en: 'Remove Image',
    kn: 'ಚಿತ್ರವನ್ನು ತೆಗೆದುಹಾಕಿ'
  },
  'diseaseDetection.analyzeImage': {
    en: 'Analyze Image',
    kn: 'ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಿ'
  },
  'diseaseDetection.analyzing': {
    en: 'Analyzing...',
    kn: 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...'
  },
  'diseaseDetection.tips': {
    en: 'Tips for best results:',
    kn: 'ಉತ್ತಮ ಫಲಿತಾಂಶಗಳಿಗಾಗಿ ಸಲಹೆಗಳು:'
  },
  'diseaseDetection.analysisResults': {
    en: 'Analysis Results',
    kn: 'ವಿಶ್ಲೇಷಣೆ ಫಲಿತಾಂಶಗಳು'
  },
  'diseaseDetection.aiPowered': {
    en: 'AI-powered disease detection and recommendations',
    kn: 'AI-ಚಾಲಿತ ರೋಗ ಪತ್ತೆ ಮತ್ತು ಶಿಫಾರಸುಗಳು'
  },
  'diseaseDetection.cropType': {
    en: 'Crop Type',
    kn: 'ಬೆಳೆ ಪ್ರಕಾರ'
  },
  'diseaseDetection.disease': {
    en: 'Disease',
    kn: 'ರೋಗ'
  },
  'diseaseDetection.severity': {
    en: 'Severity',
    kn: 'ತೀವ್ರತೆ'
  },
  'diseaseDetection.confidence': {
    en: 'Confidence',
    kn: 'ವಿಶ್ವಾಸ'
  },
  'diseaseDetection.treatment': {
    en: 'Treatment Recommendations',
    kn: 'ಚಿಕಿತ್ಸೆ ಶಿಫಾರಸುಗಳು'
  },
  'diseaseDetection.shareExpert': {
    en: 'Share with Expert',
    kn: 'ತಜ್ಞರೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ'
  },
  'diseaseDetection.uploadToSee': {
    en: 'Upload an image to see analysis results',
    kn: 'ವಿಶ್ಲೇಷಣೆ ಫಲಿತಾಂಶಗಳನ್ನು ನೋಡಲು ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ'
  },
  'diseaseDetection.history': {
    en: 'Detection History',
    kn: 'ಪತ್ತೆ ಇತಿಹಾಸ'
  },
  'diseaseDetection.previousDetections': {
    en: 'Your previous crop disease detections',
    kn: 'ನಿಮ್ಮ ಹಿಂದಿನ ಬೆಳೆ ರೋಗ ಪತ್ತೆಗಳು'
  },
  'diseaseDetection.loadingHistory': {
    en: 'Loading history...',
    kn: 'ಇತಿಹಾಸವನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...'
  },
  'diseaseDetection.noHistory': {
    en: 'No detection history found. Upload your first crop image to get started.',
    kn: 'ಯಾವುದೇ ಪತ್ತೆ ಇತಿಹಾಸ ಕಂಡುಬಂದಿಲ್ಲ. ಪ್ರಾರಂಭಿಸಲು ನಿಮ್ಮ ಮೊದಲ ಬೆಳೆ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.'
  }
  ,
  // Community translations
  'community.title': {
    en: "Farmers' Community",
    kn: 'ರೈತ ಸಮುದಾಯ'
  },
  'community.subtitle': {
    en: 'Connect with fellow farmers — chat, share videos, ask questions and get answers from the community.',
    kn: 'ಹಿರಿಯ ರೈತೊಡನೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ — ಚಾಟ್ ಮಾಡಿ, ವಿಡಿಯೋಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ, ಪ್ರಶ್ನೆ ಕೇಳಿ ಮತ್ತು ಸಮುದಾಯದಿಂದ ಉತ್ತರ ಪಡೆಯಿರಿ.'
  },
  'community.chat.title': {
    en: 'Community Chat',
    kn: 'ಸಮುದಾಯ ಚಾಟ್'
  },
  'community.chat.description': {
    en: 'Real-time chat (demo): messages are stored locally in your browser.',
    kn: 'ನೈಜ ಸಮಯದ ಚಾಟ್ (ಡೆಮೋ): ಸಂದೇಶಗಳು ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಸ್ಥಳೀಯವಾಗಿ ಸಂಚಿತಗೊಳ್ಳುತ್ತವೆ.'
  },
  'community.guidelines.title': {
    en: 'Community Guidelines',
    kn: 'ಸಮುದಾಯ ಮಾರ್ಗಸೂಚಿಗಳು'
  },
  'community.quickActions.title': {
    en: 'Quick Actions',
    kn: 'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು'
  },
  'community.sharedVideos.title': {
    en: 'Shared Videos',
    kn: 'ಹಂಚಿಕೊಂಡ ವಿಡಿಯೊಗಳು'
  },
  'community.qna.title': {
    en: 'Q&A',
    kn: 'ಪ್ರಶ್ನೋತ್ತರ'
  },
  'community.resources.title': {
    en: 'Resources & Events',
    kn: 'ಸResources ಮತ್ತು ಪ್ರದರ್ಶನಗಳು'
  },
  'community.uploadLabel': {
    en: 'Upload a short clip or image to share with the community (stored in your browser for demo).',
    kn: 'ಸಮುದಾಯದೊಡನೆ ಹಂಚಿಕೊಳ್ಳಲು ಚಿಕ್ಕ ಕ್ಲಿಪ್ ಅಥವಾ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (ಡೆಮೋಕ್ಕಾಗಿ ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಸಂಗ್ರಹಿಸಲಾಗುತ್ತದೆ).'
  },
  'community.noMessages': {
    en: 'No messages yet — start the conversation.',
    kn: 'ಇನ್ನೂ ಯಾವುದೇ ಸಂದೇಶಗಳಿಲ್ಲ — ಸಂಭಾಷಣೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ.'
  }
  ,
  'community.writeMessage': {
    en: 'Write a message...',
    kn: 'ಸಂದೇಶ ಬರೆಯಿರಿ...'
  },
  'community.send': {
    en: 'Send',
    kn: 'ಕಳುಹಿಸಿ'
  },
  'community.guidelines.list1': {
    en: 'Be respectful and helpful',
    kn: 'ಗೌರವದಿಂದ ಮತ್ತು ಸಹಾಯಕವಾಗಿ ಇರಲಿ'
  },
  'community.guidelines.list2': {
    en: 'Share practical tips and local knowledge',
    kn: 'ಪ್ರಾಯೋಗಿಕ ಸಲಹೆಗಳು ಮತ್ತು ಸ್ಥಳೀಯ ಜ್ಞಾನ ಹಂಚಿಕೊಳ್ಳಿ'
  },
  'community.guidelines.list3': {
    en: 'Do not share personal payment info',
    kn: 'ವೈಯಕ್ತಿಕ ಪಾವತಿ ಮಾಹಿತಿ ಹಂಚಬೇಡಿ'
  },
  'community.videos.description': {
    en: 'Upload short videos to demonstrate a technique or share a field update.',
    kn: 'ತಂತ್ರವನ್ನು ತೋರಿಸಲು ಅಥವಾ ಕ್ಷೇತ್ರದ ನವೀಕರಣವನ್ನು ಹಂಚಿಕೊಳ್ಳಲು ಚಿಕ್ಕ ವಿಡಿಯೋಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.'
  },
  'community.noVideos': {
    en: 'No videos uploaded yet.',
    kn: 'ಇನ್ನೂ ಯಾವುದೇ ವಿಡಿಯೊಗಳಿಲ್ಲ.'
  },
  'community.qna.description': {
    en: 'Ask a question and community members can answer. Demo stores posts locally.',
    kn: 'ಪ್ರಶ್ನೆಯಾಗಿರಿ ಮತ್ತು ಸಮುದಾಯದ ಸದಸ್ಯರು ಉತ್ತರಿಸಬಹುದು. ಡೆಮೋ ಪೋಸ್ಟ್‌ಗಳನ್ನು ಸ್ಥಳೀಯವಾಗಿ ಸಂಗ್ರಹಿಸುತ್ತದೆ.'
  },
  'community.askPlaceholder': {
    en: 'Ask your question to the community',
    kn: 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಸಮುದಾಯಕ್ಕೆ ಕೇಳಿ'
  },
  'community.postQuestion': {
    en: 'Post Question',
    kn: 'ಪ್ರಶ್ನೆ ಪೋಸ್ಟ್ ಮಾಡಿ'
  },
  'community.clear': {
    en: 'Clear',
    kn: 'ಸ್ಪಷ್ಟಪಡಿಸಿ'
  },
  'community.noQuestions': {
    en: 'No questions yet — be the first to ask.',
    kn: 'ಇನ್ನೂ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳಿಲ್ಲ — ಮೊದಲನೆಯದಾಗಿ ಕೇಳಿ.'
  },
  'community.howToAsk.title': {
    en: 'How to ask a good question',
    kn: 'ಒಳ್ಳೆಯ ಪ್ರಶ್ನೆಯನ್ನು ಹೇಗೆ ಕೇಳುವುದು'
  },
  'community.howToAsk.li1': {
    en: 'Be specific about crop & stage',
    kn: 'ಬೆಳೆ ಮತ್ತು ಹಂತದ ಬಗ್ಗೆ ನಿರ್ಗಳವಾಗಿರಿ'
  },
  'community.howToAsk.li2': {
    en: 'Include clear photos or a short video',
    kn: 'ಸ್ಪಷ್ಟ ಫೋಟೋಗಳು ಅಥವಾ ಚಿಕ್ಕ ವಿಡಿಯೋ ಸೇರಿಸಿ'
  },
  'community.howToAsk.li3': {
    en: 'Mention your location / weather',
    kn: 'ನಿಮ್ಮ ಸ್ಥಳ / ಹವಾಮಾನವನ್ನು ನಮೂದಿಸಿ'
  }
  ,
  // Marketplace
  'marketplace.title': {
    en: 'Farmer Marketplace',
    kn: 'ರೈತ ಮಾರುಕಟ್ಟೆ'
  },
  'marketplace.browse': {
    en: 'Browse Listings',
    kn: 'ಪಟ್ಟಿಗಳನ್ನು ವೀಕ್ಷಿಸಿ'
  },
  'marketplace.sell': {
    en: 'Sell an Item',
    kn: 'ಒಂದು ವಸ್ತುವನ್ನು ಮಾರಾಟ ಮಾಡಿ'
  },
  'marketplace.addedToCart': {
    en: 'Added to cart',
    kn: 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ'
  },
  'marketplace.addedToCartDesc': {
    en: '{title} added to your cart',
    kn: '{title} ನಿಮ್ಮ ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ'
  },
  'marketplace.loginRequired': {
    en: 'Please login',
    kn: 'ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ'
  },
  'marketplace.loginRequiredDesc': {
    en: 'You need to login to add items to cart',
    kn: 'ಆಇಟಂಗಳನ್ನು ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಲು ನೀವು ಲಾಗಿನ್ ಮಾಡಬೇಕಾಗುತ್ತದೆ'
  },
  'marketplace.error': {
    en: 'Error',
    kn: 'ದೋಷ'
  },
  'marketplace.failedLoad': {
    en: 'Failed to load marketplace listings',
    kn: 'ಮಾರುಕಟ್ಟೆ ಪಟ್ಟಿಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ'
  },
  'marketplace.productListed': {
    en: 'Product listed successfully',
    kn: 'ಉತ್ಪನ್ನವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪಟ್ಟಿಯಲ್ಲಿ ಸೇರಿಸಲಾಗಿದೆ'
  },
  'marketplace.productListedDesc': {
    en: 'Your product is now available in the marketplace',
    kn: 'ನಿಮ್ಮ ಉತ್ಪನ್ನವು ಈಗ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಲಭ್ಯವಿದೆ'
  },
  'marketplace.failedAddToCart': {
    en: 'Failed to add item to cart',
    kn: 'ಆઇಟಂ ಅನ್ನು ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಲು ವಿಫಲವಾಗಿದೆ'
  },
  'marketplace.messageSentTitle': {
    en: 'Message sent',
    kn: 'ಸಂದೇಶ ಕಳುಹಿಸಲಾಗಿದೆ'
  },
  'marketplace.messageSentDesc': {
    en: 'Your message has been sent to the seller',
    kn: 'ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಮಾರಾಟಗಾರರಿಗೆ ಕಳುಹಿಸಲಾಗಿದೆ'
  },
  'marketplace.orderPlacedTitle': {
    en: 'Order placed successfully',
    kn: 'ಆದೇಶ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ'
  },
  'marketplace.orderPlacedDesc': {
    en: 'Order {orderNumber} has been placed',
    kn: 'ಆದೇಶ {orderNumber} ಸಲ್ಲಿಸಲಾಗಿದೆ'
  },
  'marketplace.failedPlaceOrder': {
    en: 'Failed to place order',
    kn: 'ಆದೇಶ ಇಡಲು ವಿಫಲವಾಗಿದೆ'
  },
  'marketplace.failedSendMessage': {
    en: 'Failed to send message',
    kn: 'ಸಂದೇಶ ಕಳುಹಿಸಲು ವಿಫಲವಾಗಿದೆ'
  },
  // Market Prices
  'marketPrices.title': {
    en: 'Market Prices',
    kn: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು'
  },
  'marketPrices.loading': {
    en: 'Loading market prices...',
    kn: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...'
  },
  'marketPrices.header': { en: 'Market Prices & Analysis', kn: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು ಮತ್ತು ವಿಶ್ಲೇಷಣೆ' },
  'marketPrices.refresh': { en: 'Refresh Prices', kn: 'ಬೆಲೆಗಳನ್ನು تازهಗೊಳಿಸಿ' },
  'marketPrices.searchPlaceholder': { en: 'Search crops, markets...', kn: 'ಬೆಳೆಗಳು, ಮಾರುಕಟ್ಟೆಗಳನ್ನು ಹುಡುಕಿರಿ...' },
  'marketPrices.addAlert': { en: 'Add Price Alert', kn: 'ಬೆಲೆ ಎಚ್ಚರಿಕೆ ಸೇರಿಸಿ' },
  'marketPrices.addAlertTitle': { en: 'Add Price Alert', kn: 'ಬೆಲೆ ಎಚ್ಚರಿಕೆ ಸೇರಿಸಿ' },
  'marketPrices.alert.cropName': { en: 'Crop Name', kn: 'ಬೆಳೆ ಹೆಸರು' },
  'marketPrices.alert.targetPrice': { en: 'Target Price (₹)', kn: 'ಲಕ್ಷ್ಯ ಬೆಲೆ (₹)' },
  'marketPrices.alert.marketLocation': { en: 'Market Location', kn: 'ಮಾರುಕಟ್ಟೆ ಸ್ಥಳ' },
  'marketPrices.addAlertButton': { en: 'Add Alert', kn: 'ಎಚ್ಚರಿಕೆ ಸೇರಿಸಿ' },
  'marketPrices.cancel': { en: 'Cancel', kn: 'ರದ್ದುಮಾಡಿ' },
  'marketPrices.watchlist.noItems': { en: 'No items in watchlist', kn: 'ವಾಚ್‌ಲಿಸ್ಟ್‌ನಲ್ಲಿ ಯಾವುದೇ ಐಟಂಗಳಿಲ್ಲ' },
  'marketPrices.watchlist.title': { en: 'Your Price Watchlist', kn: 'ನಿಮ್ಮ ಬೆಲೆ ವಾಚ್‌ಲಿಸ್ಟ್' },
  'marketPrices.addedToWatchlist': { en: 'Added to watchlist successfully', kn: 'ವಾಚ್‌ಲಿಸ್ಟ್‌ಗೆ ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ' },
  'marketPrices.failedAddWatchlist': { en: 'Failed to add to watchlist', kn: 'ವಾಚ್‌ಲಿಸ್ಟ್‌ಗೆ ಸೇರಿಸಲು ವಿಫಲವಾಗಿದೆ' },
  'marketPrices.removedFromWatchlist': { en: 'Removed from watchlist', kn: 'ವಾಚ್‌ಲಿಸ್ಟ್‌ನಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ' },
  // Supply Chain
  'supplyChain.title': {
    en: 'Supply Chain',
    kn: 'ಪೂರೈಕೆ ಸರಪಳಿ'
  },
  'supplyChain.subtitle': { en: 'Streamline your agricultural supply chain from farmer to retailer with real-time tracking and management.', kn: 'ಫಾರ್ಮರ್‌ನಿಂದ ರಿಟೇಲರ್‌ವರೆಗೆ ನೈಜ ಸಮಯದ ಟ್ರ್ಯಾಕಿಂಗ್ ಮತ್ತು ನಿರ್ವಹಣೆಯೊಂದಿಗೆ ನಿಮ್ಮ ಕೃಷಿ ಪೂರೈಕೆ ಸರಪಳಿಯನ್ನು ಸುಗಮಗೊಳಿಸಿ.' },
  'supplyChain.stat.availableProducts': { en: 'Available Products', kn: 'ಲಭ್ಯವಿರುವ ಉತ್ಪನ್ನಗಳು' },
  'supplyChain.stat.activeOrders': { en: 'Active Orders', kn: 'ಸಕ್ರಿಯ ಆದೇಶಗಳು' },
  'supplyChain.stat.inTransit': { en: 'In Transit', kn: 'ಪ್ರಯಾಣದಲ್ಲಿದೆ' },
  'supplyChain.stat.delivered': { en: 'Delivered', kn: 'ವಿತರಣೆಯಾದದು' },
  'supplyChain.tab.products': { en: 'Products', kn: 'ಉತ್ಪನ್ನಗಳು' },
  'supplyChain.tab.orders': { en: 'Orders', kn: 'ಆದೇಶಗಳು' },
  'supplyChain.tab.shipments': { en: 'Shipments', kn: 'ಶಿಪ್‌ಮೆಂಟ್‌‌ಗಳು' },
  'supplyChain.tab.analytics': { en: 'Analytics', kn: 'ವಿಶ್ಲೇಷಣೆ' },
  'supplyChain.addProduct': { en: 'Add Product', kn: 'ಉತ್ಪನ್ನ ಸೇರಿಸಿ' },
  'supplyChain.placeOrder': { en: 'Place Order', kn: 'ಆದೇಶ ಇಡಿ' },
  'supplyChain.updateShipment': { en: 'Update Shipment', kn: 'ಶಿಪ್‌ಮೆಂಟ್ ನವೀಕರಿಸಿ' },
  // Weather
  'weather.title': {
    en: 'Weather',
    kn: 'ಹವಾಮಾನ'
  },
  'weather.noData': {
    en: 'No weather data available',
    kn: 'ಯಾವುದೇ ಹವಾಮಾನ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ'
  },
  'weather.header': { en: 'Weather Insights', kn: 'ಹವಾಮಾನ ಒಳನೋಟಗಳು' },
  'weather.subtitle': { en: 'Real-time weather data for Karnataka farmers', kn: 'ಕರ್ನಾಟಕ ರೈತರಿಗಾಗಿ ನೈಜ ಸಮಯದ ಹವಾಮಾನ ಡೇಟಾ' },
  'weather.refresh': { en: 'Refresh', kn: 'ತಾಜಾ ಮಾಡಿ' },
  'weather.loading': { en: 'Loading weather data...', kn: 'ಹವಾಮಾನ ಡೇಟಾವನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...' },
  'weather.current.title': { en: 'Current Weather', kn: 'ಪ್ರಸ್ತುತ ಹವಾಮಾನ' },
  'weather.cropRecommendations.title': { en: 'Crop Recommendations', kn: 'ಬೆಳೆ ಶಿಫಾರಸುಗಳು' },
  'weather.forecast.title': { en: '5-Day Forecast', kn: '5-ದಿನಗಳ ಮುನ್ಸೂಚನೆ' },
  'weather.forecast.desc': { en: 'Weather outlook for the next 5 days', kn: 'ಮುಂದಿನ 5 ದಿನಗಳ ಹವಾಮಾನ ದೃಷ್ಟಿಕೋণেরು' },
  'weather.tips.title': { en: 'Weather-Based Farming Tips', kn: 'ಹವಾಮಾನ ಆಧಾರದ ಮೇಲೆ ಕೃಷಿ ಸಲಹೆಗಳು' },
  'weather.noForecast': { en: 'No forecast data available', kn: 'ಮುನ್ಸೂಚನೆ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ' },
  'weather.noTips': { en: 'No tips available', kn: 'ಯಾವುದೇ ಸಲಹೆಗಳು ಲಭ್ಯವಿಲ್ಲ' },
  'weather.selectPlaceholder': { en: 'Select Karnataka location', kn: 'ಕರ್ನಾಟಕ ಸ್ಥಳವನ್ನು ಆಯ್ಕೆಮಾಡಿ' },
  // Finance
  'finance.title': {
    en: 'Finance Tracker',
    kn: 'ಹಣಕಾಸು ಟ್ರ್ಯಾಕರ್'
  },
  'finance.noData': {
    en: 'No financial records yet',
    kn: 'ಇನ್ನೂ ಯಾವುದೇ ಹಣಕಾಸು ದಾಖಲೆಗಳಿಲ್ಲ'
  },
  // Common actions
  'common.create': { en: 'Create', kn: 'ರಚಿಸಿ' },
  'common.update': { en: 'Update', kn: 'ನವೀಕರಿಸಿ' },
  'common.cancel': { en: 'Cancel', kn: 'ರದ್ದುಮಾಡಿ' },
  'common.clear': { en: 'Clear', kn: 'ಸ್ಪಷ್ಟಪಡಿಸಿ' }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  // Persist selected language in localStorage so user choice survives reloads
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const raw = localStorage.getItem('rbh_language');
      return (raw === 'kn' ? 'kn' : 'en');
    } catch {
      return 'en';
    }
  });

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };
  const setLang = (lang: Language) => {
    try {
      localStorage.setItem('rbh_language', lang);
    } catch {}
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};