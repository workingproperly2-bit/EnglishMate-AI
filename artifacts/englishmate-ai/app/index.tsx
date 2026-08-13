import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { Language, useApp } from '@/context/app-context';

type ViewName = 'home' | 'lessons' | 'practice' | 'progress' | 'downloads' | 'speaking' | 'writing' | 'lesson' | 'test';
type PracticeMode = 'letters' | 'words' | 'sentences' | 'grammar' | 'paragraph';

type Lesson = {
  id: number;
  title: string;
  focus: string;
  explanation: { en: string; si: string; ta: string };
  vocabulary: string[];
  examples: string[];
  question: string;
  answer: string;
};

const lessons: Lesson[] = [
  { id: 1, title: 'Hello & introductions', focus: 'Meet someone new', explanation: { en: 'Learn friendly greetings and how to say your name.', si: 'සුහද ආචාර සහ ඔබේ නම කියන ආකාරය ඉගෙන ගන්න.', ta: 'நட்பான வாழ்த்துகளையும் உங்கள் பெயரைச் சொல்வதையும் கற்றுக்கொள்ளுங்கள்.' }, vocabulary: ['hello', 'name', 'meet', 'nice'], examples: ['Hello! My name is Kamal.', 'Nice to meet you.'], question: 'What do you say when you meet someone?', answer: 'Hello' },
  { id: 2, title: 'People around me', focus: 'Family & friends', explanation: { en: 'Use simple words to talk about people you know.', si: 'ඔබ දන්නා පුද්ගලයන් ගැන කතා කිරීමට සරල වචන භාවිතා කරන්න.', ta: 'உங்களுக்குத் தெரிந்தவர்களைப் பற்றி பேச எளிய சொற்களைப் பயன்படுத்துங்கள்.' }, vocabulary: ['I', 'you', 'he', 'she'], examples: ['She is my friend.', 'He is my brother.'], question: 'Choose the correct word: ___ is my sister.', answer: 'She' },
  { id: 3, title: 'Everyday actions', focus: 'Simple verbs', explanation: { en: 'Build short sentences with everyday action words.', si: 'දිනපතා ක්‍රියා වචන භාවිතයෙන් කෙටි වාක්‍ය සාදන්න.', ta: 'தினசரி செயல் சொற்களைக் கொண்டு சிறிய வாக்கியங்களை உருவாக்குங்கள்.' }, vocabulary: ['eat', 'go', 'come', 'read'], examples: ['I read a book.', 'I go home.'], question: 'Complete: I ___ a book.', answer: 'read' },
  { id: 4, title: 'Numbers & time', focus: 'Count and ask', explanation: { en: 'Say numbers and ask simple questions about time.', si: 'අංක කියමින් වේලාව ගැන සරල ප්‍රශ්න අසන්න.', ta: 'எண்களைச் சொல்லி நேரத்தைப் பற்றி எளிய கேள்விகளைக் கேளுங்கள்.' }, vocabulary: ['one', 'two', 'today', 'time'], examples: ['I have two pens.', 'What time is it?'], question: 'Which word means 2?', answer: 'two' },
  { id: 5, title: 'My home', focus: 'Places & objects', explanation: { en: 'Describe your home with easy place and object words.', si: 'ස්ථාන සහ දේවල් සඳහා පහසු වචන වලින් ඔබේ නිවස විස්තර කරන්න.', ta: 'எளிய இடம் மற்றும் பொருள் சொற்களால் உங்கள் வீட்டை விவரியுங்கள்.' }, vocabulary: ['home', 'room', 'door', 'table'], examples: ['This is my room.', 'The door is open.'], question: 'Complete: This is my ___.', answer: 'home' },
  { id: 6, title: 'Food I like', focus: 'Likes & dislikes', explanation: { en: 'Talk about food you like using I like and I do not like.', si: 'I like සහ I do not like භාවිතයෙන් ඔබ කැමති ආහාර ගැන කතා කරන්න.', ta: 'I like மற்றும் I do not like பயன்படுத்தி உங்களுக்குப் பிடித்த உணவைப் பற்றி பேசுங்கள்.' }, vocabulary: ['rice', 'tea', 'like', 'water'], examples: ['I like rice.', 'I drink water.'], question: 'Complete: I ___ tea.', answer: 'like' },
  { id: 7, title: 'At school or work', focus: 'Daily places', explanation: { en: 'Name common places and say where you are.', si: 'සාමාන්‍ය ස්ථාන නම් කර ඔබ සිටින ස්ථානය කියන්න.', ta: 'பொதுவான இடங்களுக்குப் பெயரிட்டு நீங்கள் இருக்கும் இடத்தைச் சொல்லுங்கள்.' }, vocabulary: ['school', 'work', 'class', 'office'], examples: ['I am at school.', 'This is my class.'], question: 'Where are you? I am at ___.', answer: 'school' },
  { id: 8, title: 'Shopping basics', focus: 'Ask for things', explanation: { en: 'Ask for an item and use polite words in a shop.', si: 'සාප්පුවකදී භාණ්ඩයක් ඉල්ලා ආචාරශීලී වචන භාවිතා කරන්න.', ta: 'கடையில் ஒரு பொருளைக் கேட்டு மரியாதையான சொற்களைப் பயன்படுத்துங்கள்.' }, vocabulary: ['please', 'want', 'buy', 'price'], examples: ['I want a pen, please.', 'What is the price?'], question: 'Which word makes a request polite?', answer: 'please' },
  { id: 9, title: 'Weather & feelings', focus: 'Describe today', explanation: { en: 'Say how the weather is and how you feel.', si: 'කාලගුණය සහ ඔබේ හැඟීම කියන්න.', ta: 'வானிலை மற்றும் உங்கள் உணர்வைச் சொல்லுங்கள்.' }, vocabulary: ['hot', 'rainy', 'happy', 'tired'], examples: ['It is hot today.', 'I am happy.'], question: 'Complete: I am ___. (not sad)', answer: 'happy' },
  { id: 10, title: 'A simple day', focus: 'Review & connect', explanation: { en: 'Join your new words to describe a simple day.', si: 'ඔබේ නව වචන එකතු කර සරල දවසක් විස්තර කරන්න.', ta: 'உங்கள் புதிய சொற்களை இணைத்து ஒரு எளிய நாளை விவரியுங்கள்.' }, vocabulary: ['morning', 'eat', 'go', 'home'], examples: ['I eat in the morning.', 'I go home.'], question: 'Complete: I go ___.', answer: 'home' },
];

const alphabet = [
  ['A', 'a', 'apple'], ['B', 'b', 'book'], ['C', 'c', 'cat'], ['D', 'd', 'dog'], ['E', 'e', 'egg'], ['F', 'f', 'fish'],
  ['G', 'g', 'goat'], ['H', 'h', 'hat'], ['I', 'i', 'ice'], ['J', 'j', 'jam'], ['K', 'k', 'kite'], ['L', 'l', 'lion'],
  ['M', 'm', 'moon'], ['N', 'n', 'nose'], ['O', 'o', 'orange'], ['P', 'p', 'pen'], ['Q', 'q', 'queen'], ['R', 'r', 'rain'],
  ['S', 's', 'sun'], ['T', 't', 'tree'], ['U', 'u', 'umbrella'], ['V', 'v', 'van'], ['W', 'w', 'water'], ['X', 'x', 'box'],
  ['Y', 'y', 'yellow'], ['Z', 'z', 'zebra'],
];

const copy = {
  en: {
    home: 'Home', lessons: 'Lessons', practice: 'Practice', progress: 'Progress', downloads: 'Downloads', hello: 'Hello, learner', subtitle: 'Small steps. Strong English.', continue: 'Continue learning', speaking: 'Speaking practice', writing: 'Writing practice', start: 'Start', viewAll: 'View all', yourProgress: 'Your progress', completed: 'completed', currentLevel: 'Current level', beginner: 'Level 1 · Beginner', chooseLanguage: 'Choose your language', quickPractice: 'Quick practice', learnAZ: 'Learn A–Z', lessonProgress: 'Lesson progress', lesson: 'Lesson', vocabulary: 'Vocabulary', examples: 'Example sentences', explanation: 'Simple explanation', practiceQuestions: 'Practice question', completeLesson: 'Complete lesson', next: 'Next', test: 'Test', testIntro: 'Show what you know. Choose the best answer.', submit: 'Check answer', score: 'Your score', done: 'Done', tryAgain: 'Try again', startTest: 'Start test', aiSpeaking: 'AI Speaking Practice', speakingHint: 'Talk with your friendly English teacher. Your future AI connection can plug into this conversation.', teacher: 'Teacher', you: 'You', send: 'Send', writingTitle: 'Writing practice', writingHint: 'Write a little every day. We will help you improve.', letters: 'A–Z', words: 'Words', sentences: 'Sentences', grammar: 'Grammar', paragraph: 'Paragraph', prompt: 'Try writing here...', checkWriting: 'Check my writing', correct: 'Correct sentence', mistake: 'Mistake explanation', suggestion: 'Simple improvement', downloadsTitle: 'Your downloads', downloadsHint: 'Keep lessons close, even when you are offline.', pdf: 'Lesson PDF', audio: 'Spoken English MP3', sample: 'Sample file', ready: 'Ready for future files', progressTitle: 'Your learning journey', lessonsDone: 'Lessons completed', testsDone: 'Tests completed', speakingDone: 'Speaking sessions', writingDone: 'Writing practices', noProgress: 'Start your first lesson to see progress here.', noTest: 'No test score yet', languageShort: 'EN', back: 'Back', listen: 'Listen', word: 'Word', pronunciation: 'Say it like', sentence: 'Sentence', encouragement: 'Great effort! Keep going.', level: 'Level 1', testOne: 'Test 1', testTwo: 'Test 2', selectLanguage: 'Language', saved: 'Saved on this device',
  },
  si: {
    home: 'මුල් පිටුව', lessons: 'පාඩම්', practice: 'පුහුණුව', progress: 'ප්‍රගතිය', downloads: 'බාගැනීම්', hello: 'ආයුබෝවන්, සිසුවා', subtitle: 'කුඩා පියවර. ශක්තිමත් ඉංග්‍රීසි.', continue: 'ඉගෙනීම දිගටම', speaking: 'කතා පුහුණුව', writing: 'ලිවීමේ පුහුණුව', start: 'ආරම්භ කරන්න', viewAll: 'සියල්ල බලන්න', yourProgress: 'ඔබේ ප්‍රගතිය', completed: 'සම්පූර්ණයි', currentLevel: 'දැනට මට්ටම', beginner: 'මට්ටම 1 · ආරම්භක', chooseLanguage: 'ඔබේ භාෂාව තෝරන්න', quickPractice: 'ඉක්මන් පුහුණුව', learnAZ: 'A–Z ඉගෙන ගන්න', lessonProgress: 'පාඩම් ප්‍රගතිය', lesson: 'පාඩම', vocabulary: 'වචන', examples: 'උදාහරණ වාක්‍ය', explanation: 'සරල පැහැදිලි කිරීම', practiceQuestions: 'පුහුණු ප්‍රශ්නය', completeLesson: 'පාඩම සම්පූර්ණ කරන්න', next: 'ඊළඟ', test: 'පරීක්ෂණය', testIntro: 'ඔබ දන්නා දේ පෙන්වන්න. හොඳම පිළිතුර තෝරන්න.', submit: 'පිළිතුර පරීක්ෂා කරන්න', score: 'ඔබේ ලකුණු', done: 'අවසන්', tryAgain: 'නැවත උත්සාහ කරන්න', startTest: 'පරීක්ෂණය ආරම්භ කරන්න', aiSpeaking: 'AI කතා පුහුණුව', speakingHint: 'ඔබේ හිතවත් ඉංග්‍රීසි ගුරුවරයා සමඟ කතා කරන්න. අනාගත AI සම්බන්ධතාවය මෙයට එක් කළ හැක.', teacher: 'ගුරුවරයා', you: 'ඔබ', send: 'යවන්න', writingTitle: 'ලිවීමේ පුහුණුව', writingHint: 'සෑම දිනකම ටිකක් ලියන්න. අපි ඔබට දියුණු වීමට උදව් කරමු.', letters: 'A–Z', words: 'වචන', sentences: 'වාක්‍ය', grammar: 'ව්‍යාකරණ', paragraph: 'ඡේදය', prompt: 'මෙහි ලියන්න...', checkWriting: 'මගේ ලිවීම පරීක්ෂා කරන්න', correct: 'නිවැරදි වාක්‍යය', mistake: 'වැරදි පැහැදිලි කිරීම', suggestion: 'සරල වැඩිදියුණු කිරීම', downloadsTitle: 'ඔබේ බාගැනීම්', downloadsHint: 'අන්තර්ජාලය නැති විටත් පාඩම් ළඟ තබා ගන්න.', pdf: 'පාඩම් PDF', audio: 'කතා ඉංග්‍රීසි MP3', sample: 'ආදර්ශ ගොනුව', ready: 'අනාගත ගොනු සඳහා සූදානම්', progressTitle: 'ඔබේ ඉගෙනුම් ගමන', lessonsDone: 'සම්පූර්ණ කළ පාඩම්', testsDone: 'සම්පූර්ණ කළ පරීක්ෂණ', speakingDone: 'කතා සැසි', writingDone: 'ලිවීම් පුහුණු', noProgress: 'ඔබේ පළමු පාඩම ආරම්භ කළ විට ප්‍රගතිය මෙහි පෙන්වයි.', noTest: 'තවම පරීක්ෂණ ලකුණු නැත', languageShort: 'සිං', back: 'ආපසු', listen: 'අසන්න', word: 'වචනය', pronunciation: 'කියන්නේ මෙහෙමයි', sentence: 'වාක්‍යය', encouragement: 'හොඳ උත්සාහයක්! දිගටම යන්න.', level: 'මට්ටම 1', testOne: 'පරීක්ෂණය 1', testTwo: 'පරීක්ෂණය 2', selectLanguage: 'භාෂාව', saved: 'මෙම උපාංගයේ සුරැකේ',
  },
  ta: {
    home: 'முகப்பு', lessons: 'பாடங்கள்', practice: 'பயிற்சி', progress: 'முன்னேற்றம்', downloads: 'பதிவிறக்கங்கள்', hello: 'வணக்கம், மாணவரே', subtitle: 'சிறிய படிகள். நல்ல ஆங்கிலம்.', continue: 'கற்றலைத் தொடருங்கள்', speaking: 'பேச்சுப் பயிற்சி', writing: 'எழுத்துப் பயிற்சி', start: 'தொடங்குங்கள்', viewAll: 'அனைத்தையும் காண்க', yourProgress: 'உங்கள் முன்னேற்றம்', completed: 'முடிந்தது', currentLevel: 'தற்போதைய நிலை', beginner: 'நிலை 1 · தொடக்கநிலை', chooseLanguage: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்', quickPractice: 'விரைவு பயிற்சி', learnAZ: 'A–Z கற்றல்', lessonProgress: 'பாட முன்னேற்றம்', lesson: 'பாடம்', vocabulary: 'சொற்கள்', examples: 'எடுத்துக்காட்டு வாக்கியங்கள்', explanation: 'எளிய விளக்கம்', practiceQuestions: 'பயிற்சி கேள்வி', completeLesson: 'பாடத்தை முடிக்கவும்', next: 'அடுத்து', test: 'சோதனை', testIntro: 'உங்களுக்குத் தெரிந்ததை காட்டுங்கள். சிறந்த பதிலைத் தேர்ந்தெடுக்கவும்.', submit: 'பதிலைச் சரிபார்க்கவும்', score: 'உங்கள் மதிப்பெண்', done: 'முடிந்தது', tryAgain: 'மீண்டும் முயற்சி', startTest: 'சோதனையைத் தொடங்குங்கள்', aiSpeaking: 'AI பேச்சுப் பயிற்சி', speakingHint: 'உங்கள் நட்பான ஆங்கில ஆசிரியருடன் பேசுங்கள். எதிர்கால AI இணைப்பை இந்த உரையாடலில் சேர்க்கலாம்.', teacher: 'ஆசிரியர்', you: 'நீங்கள்', send: 'அனுப்பவும்', writingTitle: 'எழுத்துப் பயிற்சி', writingHint: 'ஒவ்வொரு நாளும் கொஞ்சம் எழுதுங்கள். முன்னேற நாங்கள் உதவுவோம்.', letters: 'A–Z', words: 'சொற்கள்', sentences: 'வாக்கியங்கள்', grammar: 'இலக்கணம்', paragraph: 'பத்தி', prompt: 'இங்கே எழுதுங்கள்...', checkWriting: 'என் எழுத்தைச் சரிபார்க்கவும்', correct: 'சரியான வாக்கியம்', mistake: 'தவறு விளக்கம்', suggestion: 'எளிய மேம்பாடு', downloadsTitle: 'உங்கள் பதிவிறக்கங்கள்', downloadsHint: 'இணையம் இல்லாவிட்டாலும் பாடங்களை அருகில் வைத்திருங்கள்.', pdf: 'பாட PDF', audio: 'பேசும் ஆங்கில MP3', sample: 'மாதிரி கோப்பு', ready: 'எதிர்கால கோப்புகளுக்குத் தயார்', progressTitle: 'உங்கள் கற்றல் பயணம்', lessonsDone: 'முடிந்த பாடங்கள்', testsDone: 'முடிந்த சோதனைகள்', speakingDone: 'பேச்சு அமர்வுகள்', writingDone: 'எழுத்துப் பயிற்சிகள்', noProgress: 'உங்கள் முதல் பாடத்தைத் தொடங்கினால் முன்னேற்றம் இங்கே தோன்றும்.', noTest: 'சோதனை மதிப்பெண் இல்லை', languageShort: 'த', back: 'பின்', listen: 'கேளுங்கள்', word: 'சொல்', pronunciation: 'இப்படிச் சொல்லுங்கள்', sentence: 'வாக்கியம்', encouragement: 'நல்ல முயற்சி! தொடர்ந்து செல்லுங்கள்.', level: 'நிலை 1', testOne: 'சோதனை 1', testTwo: 'சோதனை 2', selectLanguage: 'மொழி', saved: 'இந்த சாதனத்தில் சேமிக்கப்பட்டது',
  },
};

const getText = (language: Language) => copy[language];
const iconForView: Record<ViewName, keyof typeof Ionicons.glyphMap> = { home: 'home-outline', lessons: 'book-outline', practice: 'pencil-outline', progress: 'stats-chart-outline', downloads: 'download-outline', speaking: 'chatbubbles-outline', writing: 'create-outline', lesson: 'book-outline', test: 'checkmark-circle-outline' };

function actionHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

function Header({ title, onBack, language, onLanguage }: { title: string; onBack?: () => void; language: Language; onLanguage: (language: Language) => void }) {
  const colors = useColors();
  const t = getText(language);
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        {onBack ? <Pressable testID="back-button" onPress={onBack} style={styles.iconButton}><Ionicons name="arrow-back" size={22} color={colors.foreground} /></Pressable> : <Image source={require('../assets/images/icon.png')} style={styles.logo} />}
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{title}</Text>
        <LanguageMenu language={language} onLanguage={onLanguage} t={t} />
      </View>
    </View>
  );
}

function LanguageMenu({ language, onLanguage, t }: { language: Language; onLanguage: (language: Language) => void; t: typeof copy.en }) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  const languages: { id: Language; label: string }[] = [{ id: 'en', label: 'English' }, { id: 'si', label: 'සිංහල' }, { id: 'ta', label: 'தமிழ்' }];
  return (
    <View style={styles.languageWrap}>
      <Pressable testID="language-button" onPress={() => setOpen(!open)} style={[styles.languageButton, { backgroundColor: colors.secondary }]}>
        <Ionicons name="globe-outline" size={15} color={colors.primary} />
        <Text style={[styles.languageButtonText, { color: colors.foreground }]}>{t.languageShort}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={14} color={colors.mutedForeground} />
      </Pressable>
      {open && <View style={[styles.languagePopover, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {languages.map((item) => <Pressable key={item.id} onPress={() => { onLanguage(item.id); setOpen(false); }} style={[styles.languageOption, item.id === language && { backgroundColor: colors.secondary }]}><Text style={[styles.languageOptionText, { color: colors.foreground }]}>{item.label}</Text>{item.id === language && <Ionicons name="checkmark" size={16} color={colors.primary} />}</Pressable>)}
      </View>}
    </View>
  );
}

function PrimaryButton({ label, icon, onPress, colors, secondary = false }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void; colors: ReturnType<typeof useColors>; secondary?: boolean }) {
  return <Pressable testID={`button-${label}`} onPress={() => { actionHaptic(); onPress(); }} style={({ pressed }) => [styles.primaryButton, { backgroundColor: secondary ? colors.secondary : colors.navy }, pressed && styles.pressed]}>
    <Ionicons name={icon} size={19} color={secondary ? colors.primary : '#FFFFFF'} />
    <Text style={[styles.primaryButtonText, { color: secondary ? colors.secondaryForeground : '#FFFFFF' }]}>{label}</Text>
  </Pressable>;
}

function StatPill({ icon, value, label, colors }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string; colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.statPill, { backgroundColor: colors.card, borderColor: colors.border }]}><Ionicons name={icon} size={18} color={colors.primary} /><View><Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text></View></View>;
}

function HomeView({ go, language, onLanguage }: { go: (view: ViewName, data?: number) => void; language: Language; onLanguage: (language: Language) => void }) {
  const colors = useColors();
  const t = getText(language);
  const app = useApp();
  const progress = Math.round((app.completedLessons.length / lessons.length) * 100);
  return <View style={[styles.screen, { backgroundColor: colors.background }]}>
    <Header title="EnglishMate AI" language={language} onLanguage={onLanguage} />
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.welcomeCard, { backgroundColor: colors.navy }]}>
        <View style={styles.welcomeCopy}><Text style={styles.eyebrow}>ENGLISHMATE AI</Text><Text style={styles.welcomeTitle}>{t.hello}</Text><Text style={styles.welcomeSubtitle}>{t.subtitle}</Text><Pressable testID="continue-learning" onPress={() => { actionHaptic(); go('lessons'); }} style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}><Text style={[styles.continueText, { color: colors.navy }]}>{t.continue}</Text><Ionicons name="arrow-forward" size={18} color={colors.navy} /></Pressable></View>
        <View style={[styles.starBadge, { backgroundColor: colors.gold }]}><Ionicons name="sparkles" size={24} color={colors.navy} /></View>
      </View>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.quickPractice}</Text>
      <View style={styles.actionGrid}>
        <Pressable testID="speaking-practice" onPress={() => go('speaking')} style={({ pressed }) => [styles.actionCard, { backgroundColor: colors.mint }, pressed && styles.pressed]}><View style={[styles.actionIcon, { backgroundColor: colors.card }]}><Ionicons name="mic-outline" size={24} color={colors.success} /></View><Text style={[styles.actionTitle, { color: colors.foreground }]}>{t.speaking}</Text><Text style={[styles.actionHint, { color: colors.mutedForeground }]}>Talk & listen</Text></Pressable>
        <Pressable testID="writing-practice" onPress={() => go('writing')} style={({ pressed }) => [styles.actionCard, { backgroundColor: colors.accent }, pressed && styles.pressed]}><View style={[styles.actionIcon, { backgroundColor: colors.card }]}><Ionicons name="create-outline" size={24} color={colors.accentForeground} /></View><Text style={[styles.actionTitle, { color: colors.foreground }]}>{t.writing}</Text><Text style={[styles.actionHint, { color: colors.mutedForeground }]}>Write & improve</Text></Pressable>
      </View>
      <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.rowBetween}><View><Text style={[styles.cardEyebrow, { color: colors.primary }]}>{t.yourProgress.toUpperCase()}</Text><Text style={[styles.progressBig, { color: colors.foreground }]}>{progress}%</Text></View><View style={[styles.progressCircle, { borderColor: colors.gold }]}><Text style={[styles.progressCircleText, { color: colors.foreground }]}>{app.completedLessons.length}/{lessons.length}</Text><Text style={[styles.progressCircleLabel, { color: colors.mutedForeground }]}>{t.lesson}</Text></View></View><View style={[styles.progressTrack, { backgroundColor: colors.muted }]}><View style={[styles.progressFill, { width: `${Math.max(progress, 3)}%`, backgroundColor: colors.primary }]} /></View><View style={styles.rowBetween}><Text style={[styles.progressFoot, { color: colors.mutedForeground }]}>{t.currentLevel}</Text><Text style={[styles.progressFoot, { color: colors.foreground }]}>{t.beginner}</Text></View></View>
      <View style={styles.rowBetween}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.lessonProgress}</Text><Pressable onPress={() => go('lessons')}><Text style={[styles.linkText, { color: colors.primary }]}>{t.viewAll}</Text></Pressable></View>
      <Pressable onPress={() => go('lessons')} style={[styles.lessonPreview, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.numberCircle, { backgroundColor: colors.secondary }]}><Text style={[styles.numberText, { color: colors.primary }]}>01</Text></View><View style={styles.flex}><Text style={[styles.lessonPreviewTitle, { color: colors.foreground }]}>{lessons[app.completedLessons.length] ? lessons[app.completedLessons.length].title : lessons[0].title}</Text><Text style={[styles.lessonPreviewHint, { color: colors.mutedForeground }]}>{lessons[Math.min(app.completedLessons.length, lessons.length - 1)].focus}</Text></View><Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} /></Pressable>
    </ScrollView>
    <BottomNav active="home" go={go} language={language} />
  </View>;
}

function BottomNav({ active, go, language }: { active: ViewName; go: (view: ViewName, data?: number) => void; language: Language }) {
  const colors = useColors();
  const t = getText(language);
  const tabs: { id: ViewName; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [{ id: 'home', icon: 'home-outline', label: t.home }, { id: 'lessons', icon: 'book-outline', label: t.lessons }, { id: 'practice', icon: 'sparkles-outline', label: t.practice }, { id: 'progress', icon: 'stats-chart-outline', label: t.progress }, { id: 'downloads', icon: 'download-outline', label: t.downloads }];
  return <View style={[styles.bottomNav, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: Math.max(Platform.OS === 'web' ? 34 : 8, useSafeAreaInsets().bottom) }]}>{tabs.map((tab) => <Pressable testID={`nav-${tab.id}`} key={tab.id} onPress={() => go(tab.id)} style={styles.navItem}><Ionicons name={tab.icon} size={21} color={active === tab.id ? colors.primary : colors.mutedForeground} /><Text numberOfLines={1} style={[styles.navLabel, { color: active === tab.id ? colors.primary : colors.mutedForeground }]}>{tab.label}</Text></Pressable>)}</View>;
}

function LessonsView({ go, language, onLanguage }: { go: (view: ViewName, data?: number) => void; language: Language; onLanguage: (language: Language) => void }) {
  const colors = useColors();
  const t = getText(language);
  const app = useApp();
  return <View style={[styles.screen, { backgroundColor: colors.background }]}><Header title={t.lessons} language={language} onLanguage={onLanguage} /><ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}><View style={[styles.levelBanner, { backgroundColor: colors.navy }]}><View><Text style={styles.eyebrow}>{t.level.toUpperCase()}</Text><Text style={styles.levelTitle}>{t.beginner}</Text><Text style={styles.levelHint}>10 friendly lessons to get started</Text></View><MaterialCommunityIcons name="school-outline" size={44} color={colors.gold} /></View><Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.lessonProgress}</Text>{lessons.map((item) => <React.Fragment key={item.id}><Pressable testID={`lesson-${item.id}`} onPress={() => go('lesson', item.id)} style={({ pressed }) => [styles.lessonRow, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.pressed]}><View style={[styles.lessonStatus, { backgroundColor: app.completedLessons.includes(item.id) ? colors.mint : colors.secondary }]}>{app.completedLessons.includes(item.id) ? <Ionicons name="checkmark" size={18} color={colors.success} /> : <Text style={[styles.lessonNumber, { color: colors.primary }]}>{String(item.id).padStart(2, '0')}</Text>}</View><View style={styles.flex}><Text style={[styles.lessonRowTitle, { color: colors.foreground }]}>{item.title}</Text><Text style={[styles.lessonRowHint, { color: colors.mutedForeground }]}>{item.focus}</Text></View><Ionicons name="chevron-forward" size={19} color={colors.mutedForeground} /></Pressable>{item.id === 5 && <TestRow testId={1} go={go} language={language} />}{item.id === 10 && <TestRow testId={2} go={go} language={language} />}</React.Fragment>)}</ScrollView><BottomNav active="lessons" go={go} language={language} /></View>;
}

function TestRow({ testId, go, language }: { testId: number; go: (view: ViewName, data?: number) => void; language: Language }) {
  const colors = useColors();
  const t = getText(language);
  const app = useApp();
  const score = app.testScores[String(testId)];
  return <Pressable testID={`test-${testId}`} onPress={() => go('test', testId)} style={({ pressed }) => [styles.testRow, { backgroundColor: colors.accent, borderColor: colors.gold }, pressed && styles.pressed]}><View style={[styles.testIcon, { backgroundColor: colors.gold }]}><Ionicons name="trophy-outline" size={20} color={colors.navy} /></View><View style={styles.flex}><Text style={[styles.testTitle, { color: colors.foreground }]}>{testId === 1 ? t.testOne : t.testTwo}</Text><Text style={[styles.testHint, { color: colors.mutedForeground }]}>{score === undefined ? t.startTest : `${t.score}: ${score}%`}</Text></View><Ionicons name="arrow-forward-circle" size={23} color={colors.accentForeground} /></Pressable>;
}

function LessonView({ lessonId, go, language, onLanguage }: { lessonId: number; go: (view: ViewName, data?: number) => void; language: Language; onLanguage: (language: Language) => void }) {
  const colors = useColors();
  const t = getText(language);
  const app = useApp();
  const lesson = lessons.find((item) => item.id === lessonId) ?? lessons[0];
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const isCorrect = answer.trim().toLowerCase() === lesson.answer.toLowerCase();
  return <View style={[styles.screen, { backgroundColor: colors.background }]}><Header title={`${t.lesson} ${lesson.id}`} onBack={() => go('lessons')} language={language} onLanguage={onLanguage} /><ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}><View style={[styles.lessonHero, { backgroundColor: colors.secondary }]}><Text style={[styles.lessonHeroNumber, { color: colors.primary }]}>0{lesson.id}</Text><Text style={[styles.lessonHeroTitle, { color: colors.foreground }]}>{lesson.title}</Text><Text style={[styles.lessonHeroFocus, { color: colors.mutedForeground }]}>{lesson.focus}</Text></View><InfoSection title={t.explanation} colors={colors}><Text style={[styles.bodyText, { color: colors.mutedForeground }]}>{lesson.explanation[language]}</Text></InfoSection><InfoSection title={t.vocabulary} colors={colors}><View style={styles.chipWrap}>{lesson.vocabulary.map((word) => <View key={word} style={[styles.chip, { backgroundColor: colors.mint }]}><Text style={[styles.chipText, { color: colors.success }]}>{word}</Text></View>)}</View></InfoSection><InfoSection title={t.examples} colors={colors}>{lesson.examples.map((example) => <View key={example} style={styles.exampleRow}><Ionicons name="volume-medium-outline" size={17} color={colors.primary} /><Text style={[styles.exampleText, { color: colors.foreground }]}>{example}</Text></View>)}</InfoSection><InfoSection title={t.practiceQuestions} colors={colors}><Text style={[styles.questionText, { color: colors.foreground }]}>{lesson.question}</Text><TextInput testID="lesson-answer" value={answer} onChangeText={setAnswer} placeholder={t.prompt} placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} autoCapitalize="none" /><Pressable testID="check-lesson-answer" onPress={() => { actionHaptic(); setChecked(true); }} style={({ pressed }) => [styles.smallAction, { backgroundColor: colors.primary }, pressed && styles.pressed]}><Text style={styles.smallActionText}>{t.submit}</Text></Pressable>{checked && <View style={[styles.feedback, { backgroundColor: isCorrect ? colors.mint : colors.accent }]}><Ionicons name={isCorrect ? 'checkmark-circle' : 'information-circle'} size={20} color={isCorrect ? colors.success : colors.accentForeground} /><Text style={[styles.feedbackText, { color: colors.foreground }]}>{isCorrect ? t.encouragement : `${t.suggestion}: ${lesson.answer}`}</Text></View>}</InfoSection><PrimaryButton label={app.completedLessons.includes(lesson.id) ? t.next : t.completeLesson} icon="checkmark-circle-outline" colors={colors} onPress={() => { app.markLessonComplete(lesson.id); go(lesson.id < 10 ? 'lesson' : 'lessons', lesson.id < 10 ? lesson.id + 1 : undefined); }} /></ScrollView></View>;
}

function InfoSection({ title, children, colors }: { title: string; children: React.ReactNode; colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.infoSection, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.infoTitle, { color: colors.foreground }]}>{title}</Text>{children}</View>;
}

function TestView({ testId, go, language, onLanguage }: { testId: number; go: (view: ViewName, data?: number) => void; language: Language; onLanguage: (language: Language) => void }) {
  const colors = useColors();
  const t = getText(language);
  const app = useApp();
  const testLessons = testId === 1 ? lessons.slice(0, 5) : lessons.slice(5, 10);
  const questions = testLessons.map((lesson) => ({ question: lesson.question, answer: lesson.answer, options: [lesson.answer, 'blue', 'please'] }));
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const question = questions[current];
  const score = answers.filter((answer, index) => answer?.toLowerCase() === questions[index]?.answer.toLowerCase()).length * 20;
  if (finished) return <View style={[styles.screen, { backgroundColor: colors.background }]}><Header title={testId === 1 ? t.testOne : t.testTwo} onBack={() => go('lessons')} language={language} onLanguage={onLanguage} /><View style={styles.resultWrap}><View style={[styles.resultIcon, { backgroundColor: colors.gold }]}><Ionicons name="trophy" size={34} color={colors.navy} /></View><Text style={[styles.resultTitle, { color: colors.foreground }]}>{t.score}</Text><Text style={[styles.resultScore, { color: colors.primary }]}>{score}%</Text><Text style={[styles.resultHint, { color: colors.mutedForeground }]}>{score >= 60 ? t.encouragement : t.tryAgain}</Text><PrimaryButton label={t.done} icon="arrow-back" colors={colors} onPress={() => go('lessons')} /></View></View>;
  return <View style={[styles.screen, { backgroundColor: colors.background }]}><Header title={testId === 1 ? t.testOne : t.testTwo} onBack={() => go('lessons')} language={language} onLanguage={onLanguage} /><ScrollView contentContainerStyle={styles.scrollContent}><View style={[styles.testIntro, { backgroundColor: colors.accent }]}><Text style={[styles.testCounter, { color: colors.accentForeground }]}>{current + 1} / {questions.length}</Text><Text style={[styles.testIntroText, { color: colors.foreground }]}>{t.testIntro}</Text></View><InfoSection title={t.practiceQuestions} colors={colors}><Text style={[styles.questionText, { color: colors.foreground }]}>{question.question}</Text>{question.options.map((option) => <Pressable key={option} testID={`test-option-${option}`} onPress={() => setAnswers([...answers.slice(0, current), option])} style={[styles.optionRow, { borderColor: answers[current] === option ? colors.primary : colors.border, backgroundColor: answers[current] === option ? colors.secondary : colors.background }]}><Text style={[styles.optionText, { color: colors.foreground }]}>{option}</Text>{answers[current] === option && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}</Pressable>)}</InfoSection><PrimaryButton label={current === questions.length - 1 ? t.done : t.next} icon={current === questions.length - 1 ? 'checkmark' : 'arrow-forward'} colors={colors} onPress={() => { if (!answers[current]) return; if (current === questions.length - 1) { app.saveTestScore(testId, score); setFinished(true); } else setCurrent(current + 1); }} /></ScrollView></View>;
}

function PracticeView({ go, language, onLanguage }: { go: (view: ViewName, data?: number) => void; language: Language; onLanguage: (language: Language) => void }) {
  const colors = useColors();
  const t = getText(language);
  return <View style={[styles.screen, { backgroundColor: colors.background }]}><Header title={t.practice} language={language} onLanguage={onLanguage} /><ScrollView contentContainerStyle={styles.scrollContent}><View style={[styles.practiceHero, { backgroundColor: colors.navy }]}><Ionicons name="sparkles" size={25} color={colors.gold} /><Text style={styles.practiceHeroTitle}>{t.quickPractice}</Text><Text style={styles.practiceHeroHint}>Choose a skill and build confidence.</Text></View><Pressable onPress={() => go('writing')} style={[styles.practiceLink, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.practiceLinkIcon, { backgroundColor: colors.accent }]}><Ionicons name="create-outline" size={22} color={colors.accentForeground} /></View><View style={styles.flex}><Text style={[styles.practiceLinkTitle, { color: colors.foreground }]}>{t.writing}</Text><Text style={[styles.practiceLinkHint, { color: colors.mutedForeground }]}>{t.writingHint}</Text></View><Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} /></Pressable><Pressable onPress={() => go('speaking')} style={[styles.practiceLink, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.practiceLinkIcon, { backgroundColor: colors.mint }]}><Ionicons name="mic-outline" size={22} color={colors.success} /></View><View style={styles.flex}><Text style={[styles.practiceLinkTitle, { color: colors.foreground }]}>{t.speaking}</Text><Text style={[styles.practiceLinkHint, { color: colors.mutedForeground }]}>{t.speakingHint}</Text></View><Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} /></Pressable><Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.learnAZ}</Text><View style={[styles.alphabetPreview, { backgroundColor: colors.card, borderColor: colors.border }]}>{alphabet.slice(0, 12).map(([upper, lower]) => <View key={upper} style={[styles.letterBox, { backgroundColor: colors.secondary }]}><Text style={[styles.letterUpper, { color: colors.foreground }]}>{upper}</Text><Text style={[styles.letterLower, { color: colors.primary }]}>{lower}</Text></View>)}<Pressable onPress={() => go('writing')} style={[styles.azButton, { backgroundColor: colors.primary }]}><Text style={styles.azButtonText}>{t.start}</Text><Ionicons name="arrow-forward" size={16} color="#FFFFFF" /></Pressable></View></ScrollView><BottomNav active="practice" go={go} language={language} /></View>;
}

function WritingView({ go, language, onLanguage }: { go: (view: ViewName, data?: number) => void; language: Language; onLanguage: (language: Language) => void }) {
  const colors = useColors();
  const t = getText(language);
  const app = useApp();
  const [mode, setMode] = useState<PracticeMode>('letters');
  const [value, setValue] = useState('');
  const [result, setResult] = useState<{ correct: string; mistake: string; suggestion: string } | null>(null);
  const modes: { id: PracticeMode; label: string }[] = [{ id: 'letters', label: t.letters }, { id: 'words', label: t.words }, { id: 'sentences', label: t.sentences }, { id: 'grammar', label: t.grammar }, { id: 'paragraph', label: t.paragraph }];
  const placeholder = mode === 'letters' ? 'A B C...' : mode === 'words' ? 'apple, book...' : mode === 'paragraph' ? 'I am learning English...' : 'I like English.';
  const checkWriting = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    const correct = mode === 'letters' ? 'A B C D E' : mode === 'words' ? 'apple, book, cat' : mode === 'paragraph' ? 'I am learning English every day.' : 'I like English.';
    const looksGood = mode === 'letters' ? /a/i.test(trimmed) : mode === 'words' ? trimmed.split(/\s|,/).filter(Boolean).length >= 2 : /[.?!]$/.test(trimmed) && /^[A-Z]/.test(trimmed);
    setResult({ correct: looksGood ? trimmed : correct, mistake: looksGood ? 'Your sentence looks good.' : language === 'si' ? 'වාක්‍යය විශාල අකුරකින් ආරම්භ කර අවසානයේ තිතක් දමන්න.' : language === 'ta' ? 'வாக்கியத்தை பெரிய எழுத்தில் தொடங்கி இறுதியில் புள்ளி இடுங்கள்.' : 'Start with a capital letter and add a full stop.', suggestion: looksGood ? t.encouragement : `${t.suggestion}: ${correct}` });
    app.incrementWriting();
    actionHaptic();
  };
  return <View style={[styles.screen, { backgroundColor: colors.background }]}><Header title={t.writingTitle} onBack={() => go('practice')} language={language} onLanguage={onLanguage} /><KeyboardAvoidingView behavior="padding" style={styles.flex}><ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled"><Text style={[styles.bodyText, { color: colors.mutedForeground }]}>{t.writingHint}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeRow}>{modes.map((item) => <Pressable key={item.id} onPress={() => { setMode(item.id); setResult(null); }} style={[styles.modeChip, { backgroundColor: mode === item.id ? colors.navy : colors.card, borderColor: mode === item.id ? colors.navy : colors.border }]}><Text style={[styles.modeChipText, { color: mode === item.id ? '#FFFFFF' : colors.foreground }]}>{item.label}</Text></Pressable>)}</ScrollView>{mode === 'letters' ? <LetterList colors={colors} t={t} /> : <View style={[styles.writingCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.writingPrompt, { color: colors.foreground }]}>{mode === 'words' ? 'Write three English words.' : mode === 'paragraph' ? 'Write two simple sentences about your day.' : 'Write one simple English sentence.'}</Text><TextInput testID="writing-input" value={value} onChangeText={setValue} multiline numberOfLines={5} placeholder={placeholder} placeholderTextColor={colors.mutedForeground} style={[styles.writingInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} textAlignVertical="top" /><PrimaryButton label={t.checkWriting} icon="checkmark-circle-outline" colors={colors} onPress={checkWriting} />{result && <View style={[styles.resultBox, { backgroundColor: colors.mint }]}><ResultLine label={t.correct} value={result.correct} colors={colors} icon="checkmark-circle" /><ResultLine label={t.mistake} value={result.mistake} colors={colors} icon="information-circle" /><ResultLine label={t.suggestion} value={result.suggestion} colors={colors} icon="bulb-outline" /></View>}</View>}</ScrollView></KeyboardAvoidingView></View>;
}

function LetterList({ colors, t }: { colors: ReturnType<typeof useColors>; t: typeof copy.en }) {
  return <View style={[styles.letterPracticeCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.rowBetween}><View><Text style={[styles.writingPrompt, { color: colors.foreground }]}>{t.learnAZ}</Text><Text style={[styles.bodyText, { color: colors.mutedForeground }]}>{t.pronunciation}: “ay, bee, see...”</Text></View><Ionicons name="volume-medium-outline" size={24} color={colors.primary} /></View><View style={styles.alphabetGrid}>{alphabet.map(([upper, lower, word]) => <View key={upper} style={[styles.letterTile, { backgroundColor: colors.secondary }]}><Text style={[styles.tileUpper, { color: colors.foreground }]}>{upper}</Text><Text style={[styles.tileLower, { color: colors.primary }]}>{lower}</Text><Text style={[styles.tileWord, { color: colors.mutedForeground }]}>{word}</Text></View>)}</View></View>;
}

function ResultLine({ label, value, colors, icon }: { label: string; value: string; colors: ReturnType<typeof useColors>; icon: keyof typeof Ionicons.glyphMap }) {
  return <View style={styles.resultLine}><Ionicons name={icon} size={18} color={colors.success} /><View style={styles.flex}><Text style={[styles.resultLabel, { color: colors.success }]}>{label}</Text><Text style={[styles.resultValue, { color: colors.foreground }]}>{value}</Text></View></View>;
}

function SpeakingView({ go, language, onLanguage }: { go: (view: ViewName, data?: number) => void; language: Language; onLanguage: (language: Language) => void }) {
  const colors = useColors();
  const t = getText(language);
  const app = useApp();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ speaker: 'teacher' | 'you'; text: string }[]>([{ speaker: 'teacher', text: 'Hello! What is your name?' }]);
  const sendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    const reply = trimmed.toLowerCase().includes('my name') ? 'Nice to meet you! Where do you live?' : trimmed.toLowerCase().includes('live') ? 'That sounds nice. What do you like to eat?' : 'Good try! Please say one more simple sentence.';
    setMessages([...messages, { speaker: 'you', text: trimmed }, { speaker: 'teacher', text: reply }]);
    setMessage('');
    app.incrementSpeaking();
    actionHaptic();
  };
  return <View style={[styles.screen, { backgroundColor: colors.background }]}><Header title={t.aiSpeaking} onBack={() => go('practice')} language={language} onLanguage={onLanguage} /><KeyboardAvoidingView behavior="padding" style={styles.flex}><ScrollView contentContainerStyle={styles.chatContent} keyboardShouldPersistTaps="handled"><View style={[styles.aiIntro, { backgroundColor: colors.mint }]}><View style={[styles.aiAvatar, { backgroundColor: colors.navy }]}><Ionicons name="sparkles" size={20} color={colors.gold} /></View><View style={styles.flex}><Text style={[styles.aiIntroTitle, { color: colors.foreground }]}>{t.teacher}</Text><Text style={[styles.aiIntroHint, { color: colors.mutedForeground }]}>{t.speakingHint}</Text></View></View>{messages.map((item, index) => <View key={`${item.speaker}-${index}`} style={[styles.messageRow, item.speaker === 'you' && styles.messageRowYou]}><View style={[styles.messageBubble, { backgroundColor: item.speaker === 'you' ? colors.navy : colors.card, borderColor: colors.border }]}><Text style={[styles.messageSpeaker, { color: item.speaker === 'you' ? colors.gold : colors.primary }]}>{item.speaker === 'you' ? t.you : t.teacher}</Text><Text style={[styles.messageText, { color: item.speaker === 'you' ? '#FFFFFF' : colors.foreground }]}>{item.text}</Text></View></View>)}<View style={[styles.correctionNote, { backgroundColor: colors.accent }]}><Ionicons name="bulb-outline" size={18} color={colors.accentForeground} /><Text style={[styles.correctionText, { color: colors.foreground }]}>{language === 'si' ? 'වැරදි නම් කරුණාකර නැවත උත්සාහ කරන්න.' : language === 'ta' ? 'தவறு இருந்தால் மீண்டும் முயற்சி செய்யுங்கள்.' : 'Make a mistake? That is how we learn.'}</Text></View></ScrollView><View style={[styles.chatComposer, { backgroundColor: colors.card, borderTopColor: colors.border }]}><TextInput testID="speaking-input" value={message} onChangeText={setMessage} onSubmitEditing={sendMessage} placeholder="Type your answer..." placeholderTextColor={colors.mutedForeground} style={[styles.chatInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} /><Pressable testID="send-speaking" onPress={sendMessage} style={[styles.sendButton, { backgroundColor: colors.primary }]}><Ionicons name="arrow-up" size={21} color="#FFFFFF" /></Pressable></View></KeyboardAvoidingView></View>;
}

function ProgressView({ go, language, onLanguage }: { go: (view: ViewName, data?: number) => void; language: Language; onLanguage: (language: Language) => void }) {
  const colors = useColors();
  const t = getText(language);
  const app = useApp();
  const scores = Object.values(app.testScores);
  const average = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const stats = [{ icon: 'book-outline' as const, value: `${app.completedLessons.length}`, label: t.lessonsDone }, { icon: 'trophy-outline' as const, value: `${app.completedTests.length}`, label: t.testsDone }, { icon: 'mic-outline' as const, value: `${app.speakingCount}`, label: t.speakingDone }, { icon: 'create-outline' as const, value: `${app.writingCount}`, label: t.writingDone }];
  return <View style={[styles.screen, { backgroundColor: colors.background }]}><Header title={t.progressTitle} language={language} onLanguage={onLanguage} /><ScrollView contentContainerStyle={styles.scrollContent}><View style={[styles.progressHero, { backgroundColor: colors.navy }]}><Text style={styles.eyebrow}>{t.currentLevel.toUpperCase()}</Text><Text style={styles.progressHeroTitle}>{t.beginner}</Text><Text style={styles.progressHeroHint}>{average ? `${t.score}: ${average}%` : t.noTest}</Text></View><View style={styles.statsGrid}>{stats.map((stat) => <StatPill key={stat.label} {...stat} colors={colors} />)}</View><View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.rowBetween}><Text style={[styles.cardEyebrow, { color: colors.primary }]}>{t.lessonProgress.toUpperCase()}</Text><Text style={[styles.progressBig, { color: colors.foreground }]}>{Math.round((app.completedLessons.length / lessons.length) * 100)}%</Text></View><View style={[styles.progressTrack, { backgroundColor: colors.muted }]}><View style={[styles.progressFill, { width: `${Math.max(3, (app.completedLessons.length / lessons.length) * 100)}%`, backgroundColor: colors.success }]} /></View><Text style={[styles.progressFoot, { color: colors.mutedForeground }]}>{app.completedLessons.length ? `${app.completedLessons.length} / ${lessons.length} ${t.completed}` : t.noProgress}</Text></View><Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.testsDone}</Text>{[1, 2].map((id) => <View key={id} style={[styles.scoreRow, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.testIcon, { backgroundColor: colors.accent }]}><Ionicons name="trophy-outline" size={18} color={colors.accentForeground} /></View><Text style={[styles.flex, styles.scoreTitle, { color: colors.foreground }]}>{id === 1 ? t.testOne : t.testTwo}</Text><Text style={[styles.scoreValue, { color: colors.primary }]}>{app.testScores[String(id)] === undefined ? '—' : `${app.testScores[String(id)]}%`}</Text></View>)}</ScrollView><BottomNav active="progress" go={go} language={language} /></View>;
}

function DownloadsView({ go, language, onLanguage }: { go: (view: ViewName, data?: number) => void; language: Language; onLanguage: (language: Language) => void }) {
  const colors = useColors();
  const t = getText(language);
  const items = [{ icon: 'document-text-outline' as const, title: t.pdf, detail: 'Level 1 · Lessons 1–5', color: colors.accent }, { icon: 'musical-notes-outline' as const, title: t.audio, detail: 'Greetings & introductions', color: colors.mint }, { icon: 'document-text-outline' as const, title: t.pdf, detail: 'Level 1 · Lessons 6–10', color: colors.secondary }];
  return <View style={[styles.screen, { backgroundColor: colors.background }]}><Header title={t.downloadsTitle} language={language} onLanguage={onLanguage} /><ScrollView contentContainerStyle={styles.scrollContent}><View style={[styles.downloadHero, { backgroundColor: colors.secondary }]}><Ionicons name="cloud-download-outline" size={30} color={colors.primary} /><Text style={[styles.downloadHeroTitle, { color: colors.foreground }]}>{t.downloadsTitle}</Text><Text style={[styles.downloadHeroHint, { color: colors.mutedForeground }]}>{t.downloadsHint}</Text></View>{items.map((item, index) => <View key={`${item.title}-${index}`} style={[styles.downloadRow, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.downloadIcon, { backgroundColor: item.color }]}><Ionicons name={item.icon} size={22} color={colors.foreground} /></View><View style={styles.flex}><Text style={[styles.downloadTitle, { color: colors.foreground }]}>{item.title}</Text><Text style={[styles.downloadDetail, { color: colors.mutedForeground }]}>{item.detail}</Text><Text style={[styles.downloadSample, { color: colors.primary }]}>{t.sample} · {t.ready}</Text></View><Pressable testID={`download-${index}`} onPress={() => Alert.alert(t.sample, `${item.title}\n${t.ready}`)} style={[styles.downloadButton, { backgroundColor: colors.navy }]}><Ionicons name="download-outline" size={18} color="#FFFFFF" /></Pressable></View>)}<View style={[styles.offlineNote, { backgroundColor: colors.accent }]}><Ionicons name="information-circle-outline" size={19} color={colors.accentForeground} /><Text style={[styles.offlineNoteText, { color: colors.foreground }]}>{t.saved}</Text></View></ScrollView><BottomNav active="downloads" go={go} language={language} /></View>;
}

export default function App() {
  const [view, setView] = useState<ViewName>('home');
  const [selectedId, setSelectedId] = useState(1);
  const { interfaceLanguage, setInterfaceLanguage } = useApp();
  const go = (nextView: ViewName, data?: number) => { setView(nextView); if (data !== undefined) setSelectedId(data); };
  const shared = { go, language: interfaceLanguage, onLanguage: setInterfaceLanguage };
  if (view === 'home') return <HomeView {...shared} />;
  if (view === 'lessons') return <LessonsView {...shared} />;
  if (view === 'lesson') return <LessonView {...shared} lessonId={selectedId} />;
  if (view === 'test') return <TestView {...shared} testId={selectedId} />;
  if (view === 'practice') return <PracticeView {...shared} />;
  if (view === 'writing') return <WritingView {...shared} />;
  if (view === 'speaking') return <SpeakingView {...shared} />;
  if (view === 'progress') return <ProgressView {...shared} />;
  return <DownloadsView {...shared} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  header: { paddingTop: 12, paddingHorizontal: 20, paddingBottom: 10 },
  headerRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 38, height: 38, borderRadius: 12 },
  headerTitle: { flex: 1, fontSize: 21, fontFamily: 'Inter_700Bold', letterSpacing: -0.4 },
  iconButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  languageWrap: { position: 'relative', zIndex: 20 },
  languageButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 9, paddingHorizontal: 10, borderRadius: 14 },
  languageButtonText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  languagePopover: { position: 'absolute', right: 0, top: 44, width: 145, borderWidth: 1, borderRadius: 14, padding: 5, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, elevation: 4 },
  languageOption: { paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  languageOptionText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 105, gap: 16 },
  welcomeCard: { minHeight: 205, borderRadius: 26, padding: 23, flexDirection: 'row', overflow: 'hidden' },
  welcomeCopy: { flex: 1 },
  eyebrow: { color: '#B9D8EF', fontSize: 11, letterSpacing: 1.5, fontFamily: 'Inter_700Bold', marginBottom: 12 },
  welcomeTitle: { color: '#FFFFFF', fontSize: 28, fontFamily: 'Inter_700Bold', letterSpacing: -0.7, marginBottom: 6 },
  welcomeSubtitle: { color: '#D8E7F2', fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 21, maxWidth: 220 },
  continueButton: { alignSelf: 'flex-start', backgroundColor: '#F5C85B', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 15, marginTop: 19, flexDirection: 'row', alignItems: 'center', gap: 10 },
  continueText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  starBadge: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', marginTop: 4 },
  actionGrid: { flexDirection: 'row', gap: 12 },
  actionCard: { flex: 1, minHeight: 142, borderRadius: 20, padding: 15 },
  actionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  actionTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', lineHeight: 19 },
  actionHint: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 3 },
  pressed: { opacity: 0.76 },
  progressCard: { borderWidth: 1, borderRadius: 20, padding: 18, gap: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardEyebrow: { fontSize: 10, letterSpacing: 1.1, fontFamily: 'Inter_700Bold' },
  progressBig: { fontSize: 30, fontFamily: 'Inter_700Bold', marginTop: 2 },
  progressCircle: { width: 66, height: 66, borderWidth: 3, borderRadius: 33, alignItems: 'center', justifyContent: 'center' },
  progressCircleText: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  progressCircleLabel: { fontSize: 9, fontFamily: 'Inter_400Regular', marginTop: 1 },
  progressTrack: { height: 9, borderRadius: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 8 },
  progressFoot: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  linkText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  lessonPreview: { borderWidth: 1, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  numberCircle: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  lessonPreviewTitle: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  lessonPreviewHint: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 3 },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 1, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-around' },
  navItem: { alignItems: 'center', justifyContent: 'center', width: '20%', gap: 3 },
  navLabel: { fontSize: 9, fontFamily: 'Inter_600SemiBold' },
  levelBanner: { borderRadius: 22, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  levelTitle: { color: '#FFFFFF', fontSize: 23, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  levelHint: { color: '#D8E7F2', fontSize: 12, fontFamily: 'Inter_400Regular' },
  lessonRow: { borderWidth: 1, minHeight: 72, borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  lessonStatus: { width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  lessonNumber: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  lessonRowTitle: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  lessonRowHint: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 4 },
  testRow: { borderWidth: 1, borderRadius: 19, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  testIcon: { width: 41, height: 41, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  testTitle: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  testHint: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 3 },
  lessonHero: { borderRadius: 22, padding: 21 },
  lessonHeroNumber: { fontSize: 12, fontFamily: 'Inter_700Bold', letterSpacing: 1.2, marginBottom: 8 },
  lessonHeroTitle: { fontSize: 25, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  lessonHeroFocus: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 6 },
  infoSection: { borderWidth: 1, borderRadius: 19, padding: 17, gap: 12 },
  infoTitle: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  bodyText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 21 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 12, paddingHorizontal: 11, paddingVertical: 8 },
  chipText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  exampleRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  exampleText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  questionText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', lineHeight: 22 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: 'Inter_400Regular' },
  smallAction: { alignSelf: 'flex-start', borderRadius: 13, paddingHorizontal: 15, paddingVertical: 11 },
  smallActionText: { color: '#FFFFFF', fontSize: 12, fontFamily: 'Inter_700Bold' },
  feedback: { borderRadius: 13, padding: 12, flexDirection: 'row', gap: 9, alignItems: 'center' },
  feedbackText: { flex: 1, fontSize: 12, lineHeight: 18, fontFamily: 'Inter_500Medium' },
  primaryButton: { minHeight: 52, borderRadius: 16, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  primaryButtonText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  testIntro: { padding: 18, borderRadius: 18, gap: 7 },
  testCounter: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  testIntroText: { fontSize: 14, lineHeight: 21, fontFamily: 'Inter_500Medium' },
  optionRow: { minHeight: 48, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  resultWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 12 },
  resultIcon: { width: 72, height: 72, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  resultTitle: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  resultScore: { fontSize: 52, fontFamily: 'Inter_700Bold' },
  resultHint: { textAlign: 'center', fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 12 },
  practiceHero: { borderRadius: 22, padding: 21, gap: 8 },
  practiceHeroTitle: { color: '#FFFFFF', fontSize: 24, fontFamily: 'Inter_700Bold' },
  practiceHeroHint: { color: '#D8E7F2', fontSize: 13, fontFamily: 'Inter_400Regular' },
  practiceLink: { borderWidth: 1, borderRadius: 19, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  practiceLinkIcon: { width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  practiceLinkTitle: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  practiceLinkHint: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 3 },
  alphabetPreview: { borderWidth: 1, borderRadius: 19, padding: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  letterBox: { width: '21%', aspectRatio: 1, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  letterUpper: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  letterLower: { fontSize: 12, fontFamily: 'Inter_600SemiBold', marginTop: 1 },
  azButton: { borderRadius: 13, paddingHorizontal: 14, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', gap: 7 },
  azButtonText: { color: '#FFFFFF', fontSize: 12, fontFamily: 'Inter_700Bold' },
  modeRow: { gap: 8, paddingVertical: 4 },
  modeChip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 },
  modeChipText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  writingCard: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 13 },
  writingPrompt: { fontSize: 16, fontFamily: 'Inter_700Bold', lineHeight: 22 },
  writingInput: { minHeight: 115, borderWidth: 1, borderRadius: 14, padding: 13, fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 22 },
  resultBox: { borderRadius: 15, padding: 13, gap: 12 },
  resultLine: { flexDirection: 'row', gap: 9, alignItems: 'flex-start' },
  resultLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.6 },
  resultValue: { fontSize: 13, lineHeight: 19, fontFamily: 'Inter_500Medium', marginTop: 2 },
  letterPracticeCard: { borderWidth: 1, borderRadius: 20, padding: 15, gap: 15 },
  alphabetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  letterTile: { width: '22%', minHeight: 76, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  tileUpper: { fontSize: 19, fontFamily: 'Inter_700Bold' },
  tileLower: { fontSize: 12, fontFamily: 'Inter_600SemiBold', marginTop: 1 },
  tileWord: { fontSize: 9, fontFamily: 'Inter_400Regular', marginTop: 4 },
  chatContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 18, gap: 13 },
  aiIntro: { borderRadius: 19, padding: 14, flexDirection: 'row', gap: 11, alignItems: 'center', marginBottom: 4 },
  aiAvatar: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  aiIntroTitle: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  aiIntroHint: { fontSize: 11, lineHeight: 16, fontFamily: 'Inter_400Regular', marginTop: 3 },
  messageRow: { flexDirection: 'row', justifyContent: 'flex-start' },
  messageRowYou: { justifyContent: 'flex-end' },
  messageBubble: { maxWidth: '82%', borderRadius: 17, borderWidth: 1, padding: 13, gap: 5 },
  messageSpeaker: { fontSize: 10, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.7 },
  messageText: { fontSize: 14, lineHeight: 20, fontFamily: 'Inter_500Medium' },
  correctionNote: { borderRadius: 15, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'center' },
  correctionText: { flex: 1, fontSize: 12, lineHeight: 18, fontFamily: 'Inter_500Medium' },
  chatComposer: { borderTopWidth: 1, padding: 10, flexDirection: 'row', gap: 8, alignItems: 'center' },
  chatInput: { flex: 1, height: 45, borderWidth: 1, borderRadius: 15, paddingHorizontal: 13, fontSize: 14, fontFamily: 'Inter_400Regular' },
  sendButton: { width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  progressHero: { borderRadius: 22, padding: 21, gap: 5 },
  progressHeroTitle: { color: '#FFFFFF', fontSize: 23, fontFamily: 'Inter_700Bold' },
  progressHeroHint: { color: '#D8E7F2', fontSize: 13, fontFamily: 'Inter_400Regular' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statPill: { width: '48%', borderWidth: 1, borderRadius: 17, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10 },
  statValue: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 10, lineHeight: 14, fontFamily: 'Inter_400Regular', maxWidth: 95 },
  scoreRow: { borderWidth: 1, borderRadius: 17, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 10 },
  scoreTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  scoreValue: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  downloadHero: { borderRadius: 22, padding: 21, gap: 8 },
  downloadHeroTitle: { fontSize: 23, fontFamily: 'Inter_700Bold' },
  downloadHeroHint: { fontSize: 13, lineHeight: 20, fontFamily: 'Inter_400Regular' },
  downloadRow: { borderWidth: 1, borderRadius: 19, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  downloadIcon: { width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  downloadTitle: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  downloadDetail: { fontSize: 11, marginTop: 3, fontFamily: 'Inter_400Regular' },
  downloadSample: { fontSize: 10, marginTop: 5, fontFamily: 'Inter_600SemiBold' },
  downloadButton: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  offlineNote: { borderRadius: 15, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'center' },
  offlineNoteText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
});