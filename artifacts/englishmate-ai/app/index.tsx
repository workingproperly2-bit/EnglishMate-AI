import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
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
import { AI_API_KEY, AI_API_URL, AI_DEMO_MODE, ANDROID_APK_URL } from '@/constants/config';

type ViewName = 'home' | 'lessons' | 'practice' | 'progress' | 'downloads' | 'speaking' | 'writing' | 'lesson' | 'test';
type PracticeMode = 'letters' | 'words' | 'sentences' | 'grammar' | 'paragraph';
type SpeakingLevel = 'beginner' | 'elementary' | 'intermediate';
type SpeakingTopic = 'introductions' | 'family' | 'school' | 'work' | 'shopping' | 'food' | 'travel' | 'routine';

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

type AlphabetEntry = { upper: string; lower: string; name: string; guide: string; words: string[]; sentence: string };
type WordExercise = { kind: 'match' | 'missing' | 'choose' | 'type'; prompt: string; answer: string; options?: string[]; hint: string };
type SentenceExercise = { starter: string; prompt: string; answer: string; example: string };
type GrammarExercise = { id: string; title: string; prompt: string; answer: string; options: string[] };
type ParagraphTopic = { id: string; title: string; prompt: string; better: string };

const alphabet: AlphabetEntry[] = [
  { upper: 'A', lower: 'a', name: 'ay', guide: 'A as in apple', words: ['apple', 'ant', 'alligator'], sentence: 'This is an apple.' },
  { upper: 'B', lower: 'b', name: 'bee', guide: 'B as in book', words: ['book', 'ball', 'bird'], sentence: 'I have a book.' },
  { upper: 'C', lower: 'c', name: 'see', guide: 'C as in cat', words: ['cat', 'cup', 'car'], sentence: 'The cat is small.' },
  { upper: 'D', lower: 'd', name: 'dee', guide: 'D as in dog', words: ['dog', 'door', 'day'], sentence: 'The dog can run.' },
  { upper: 'E', lower: 'e', name: 'ee', guide: 'E as in egg', words: ['egg', 'elephant', 'eye'], sentence: 'I eat an egg.' },
  { upper: 'F', lower: 'f', name: 'ef', guide: 'F as in fish', words: ['fish', 'fan', 'food'], sentence: 'I like fish.' },
  { upper: 'G', lower: 'g', name: 'gee', guide: 'G as in goat', words: ['goat', 'girl', 'game'], sentence: 'The goat is white.' },
  { upper: 'H', lower: 'h', name: 'aitch', guide: 'H as in hat', words: ['hat', 'hand', 'home'], sentence: 'This is my hat.' },
  { upper: 'I', lower: 'i', name: 'eye', guide: 'I as in ice', words: ['ice', 'ink', 'insect'], sentence: 'The ice is cold.' },
  { upper: 'J', lower: 'j', name: 'jay', guide: 'J as in jam', words: ['jam', 'juice', 'jump'], sentence: 'I like jam.' },
  { upper: 'K', lower: 'k', name: 'kay', guide: 'K as in kite', words: ['kite', 'king', 'key'], sentence: 'The kite is high.' },
  { upper: 'L', lower: 'l', name: 'el', guide: 'L as in lion', words: ['lion', 'leg', 'lamp'], sentence: 'The lion is big.' },
  { upper: 'M', lower: 'm', name: 'em', guide: 'M as in moon', words: ['moon', 'man', 'milk'], sentence: 'I drink milk.' },
  { upper: 'N', lower: 'n', name: 'en', guide: 'N as in nose', words: ['nose', 'name', 'night'], sentence: 'My name is Nimal.' },
  { upper: 'O', lower: 'o', name: 'oh', guide: 'O as in orange', words: ['orange', 'open', 'ocean'], sentence: 'I eat an orange.' },
  { upper: 'P', lower: 'p', name: 'pee', guide: 'P as in pen', words: ['pen', 'paper', 'pink'], sentence: 'This is a pen.' },
  { upper: 'Q', lower: 'q', name: 'cue', guide: 'Q as in queen', words: ['queen', 'quiet', 'question'], sentence: 'I have a question.' },
  { upper: 'R', lower: 'r', name: 'ar', guide: 'R as in rain', words: ['rain', 'red', 'read'], sentence: 'I read a book.' },
  { upper: 'S', lower: 's', name: 'ess', guide: 'S as in sun', words: ['sun', 'school', 'star'], sentence: 'The sun is hot.' },
  { upper: 'T', lower: 't', name: 'tee', guide: 'T as in tree', words: ['tree', 'tea', 'table'], sentence: 'I drink tea.' },
  { upper: 'U', lower: 'u', name: 'you', guide: 'U as in umbrella', words: ['umbrella', 'under', 'up'], sentence: 'The umbrella is blue.' },
  { upper: 'V', lower: 'v', name: 'vee', guide: 'V as in van', words: ['van', 'vegetable', 'voice'], sentence: 'The van is fast.' },
  { upper: 'W', lower: 'w', name: 'double-you', guide: 'W as in water', words: ['water', 'woman', 'window'], sentence: 'I drink water.' },
  { upper: 'X', lower: 'x', name: 'ex', guide: 'X as in box', words: ['box', 'fox', 'six'], sentence: 'The box is red.' },
  { upper: 'Y', lower: 'y', name: 'why', guide: 'Y as in yellow', words: ['yellow', 'yes', 'young'], sentence: 'Yellow is a colour.' },
  { upper: 'Z', lower: 'z', name: 'zee', guide: 'Z as in zebra', words: ['zebra', 'zero', 'zoo'], sentence: 'The zebra is black and white.' },
];

const wordExercises: WordExercise[] = [
  { kind: 'match', prompt: 'Which word is a fruit?', answer: 'apple', options: ['apple', 'book', 'chair'], hint: 'A fruit is food.' },
  { kind: 'missing', prompt: 'Complete the word: c_t', answer: 'cat', hint: 'A cat is an animal.' },
  { kind: 'choose', prompt: 'I read a ___.', answer: 'book', options: ['book', 'fish', 'milk'], hint: 'You read it.' },
  { kind: 'type', prompt: 'Type the word: b__k', answer: 'book', hint: 'You read this.' },
  { kind: 'missing', prompt: 'Complete the word: s_n', answer: 'sun', hint: 'It is in the sky.' },
  { kind: 'type', prompt: 'Type the word for a drink: w_t_r', answer: 'water', hint: 'We drink it every day.' },
];

const sentenceExercises: SentenceExercise[] = [
  { starter: 'I am…', prompt: 'Complete: I ___ happy.', answer: 'am', example: 'I am happy.' },
  { starter: 'You are…', prompt: 'Complete: You ___ my friend.', answer: 'are', example: 'You are my friend.' },
  { starter: 'This is…', prompt: 'Complete: This ___ a pen.', answer: 'is', example: 'This is a pen.' },
  { starter: 'I have…', prompt: 'Complete: I ___ a book.', answer: 'have', example: 'I have a book.' },
  { starter: 'I like…', prompt: 'Complete: I ___ tea.', answer: 'like', example: 'I like tea.' },
  { starter: 'I want…', prompt: 'Complete: I ___ water.', answer: 'want', example: 'I want water.' },
  { starter: 'I can…', prompt: 'Complete: I ___ swim.', answer: 'can', example: 'I can swim.' },
  { starter: 'I went…', prompt: 'Yesterday, I ___ to school.', answer: 'went', example: 'I went to school yesterday.' },
  { starter: 'I will…', prompt: 'Tomorrow, I ___ study.', answer: 'will', example: 'I will study tomorrow.' },
];

const grammarExercises: GrammarExercise[] = [
  { id: 'nouns', title: 'Nouns', prompt: 'Choose the noun: The ___ is red.', answer: 'ball', options: ['ball', 'run', 'quickly'] },
  { id: 'pronouns', title: 'Pronouns', prompt: '___ is my sister.', answer: 'She', options: ['She', 'They', 'It'] },
  { id: 'verbs', title: 'Verb basics', prompt: 'I ___ a book.', answer: 'read', options: ['read', 'book', 'happy'] },
  { id: 'present', title: 'Present tense', prompt: 'I ___ tea every day.', answer: 'drink', options: ['drink', 'drank', 'will drink'] },
  { id: 'past', title: 'Past tense', prompt: 'Yesterday, I ___ home.', answer: 'went', options: ['go', 'went', 'will go'] },
  { id: 'future', title: 'Future tense', prompt: 'Tomorrow, I ___ study.', answer: 'will', options: ['am', 'went', 'will'] },
  { id: 'articles', title: 'A / an / the', prompt: 'I eat ___ apple.', answer: 'an', options: ['a', 'an', 'the'] },
  { id: 'plural', title: 'Singular & plural', prompt: 'Two ___ are on the table.', answer: 'books', options: ['book', 'books', 'bookes'] },
  { id: 'prepositions', title: 'Prepositions', prompt: 'The book is ___ the table.', answer: 'on', options: ['on', 'eat', 'happy'] },
  { id: 'questions', title: 'Questions', prompt: '___ is your name?', answer: 'What', options: ['What', 'Are', 'The'] },
];

const paragraphTopics: ParagraphTopic[] = [
  { id: 'myself', title: 'About Myself', prompt: 'Write 2–3 short sentences about your name, home, or age.', better: 'My name is Nimal. I live in Colombo. I am learning English.' },
  { id: 'family', title: 'My Family', prompt: 'Write 2–3 short sentences about your family.', better: 'I have a small family. I live with my mother and brother.' },
  { id: 'school', title: 'My School', prompt: 'Write 2–3 short sentences about your school.', better: 'My school is near my home. I like my English class.' },
  { id: 'job', title: 'My Job', prompt: 'Write 2–3 short sentences about your job or work.', better: 'I work in a shop. I meet many people every day.' },
  { id: 'routine', title: 'My Daily Routine', prompt: 'Write 2–3 short sentences about your day.', better: 'I wake up in the morning. I eat breakfast and go to work.' },
  { id: 'food', title: 'My Favourite Food', prompt: 'Write 2–3 short sentences about food you like.', better: 'My favourite food is rice. I like it with vegetables.' },
  { id: 'hobby', title: 'My Hobby', prompt: 'Write 2–3 short sentences about a hobby.', better: 'My hobby is reading. I read a book at night.' },
];

const copy = {
  en: {
    home: 'Home', lessons: 'Lessons', practice: 'Practice', progress: 'Progress', downloads: 'Downloads', hello: 'Hello, learner', subtitle: 'Small steps. Strong English.', continue: 'Continue learning', speaking: 'Speaking practice', writing: 'Writing practice', start: 'Start', viewAll: 'View all', yourProgress: 'Your progress', completed: 'completed', currentLevel: 'Current level', beginner: 'Level 1 · Beginner', chooseLanguage: 'Choose your language', quickPractice: 'Quick practice', learnAZ: 'Learn A–Z', lessonProgress: 'Lesson progress', lesson: 'Lesson', vocabulary: 'Vocabulary', examples: 'Example sentences', explanation: 'Simple explanation', practiceQuestions: 'Practice question', completeLesson: 'Complete lesson', next: 'Next', test: 'Test', testIntro: 'Show what you know. Choose the best answer.', submit: 'Check answer', score: 'Your score', done: 'Done', tryAgain: 'Try again', startTest: 'Start test', aiSpeaking: 'AI Speaking Practice', speakingHint: 'Talk with your friendly English teacher. Your future AI connection can plug into this conversation.', teacher: 'Teacher', you: 'You', send: 'Send', writingTitle: 'Writing practice', writingCorrection: 'Correct my writing', writingHint: 'Write a little every day. We will help you improve.', letters: 'A–Z', words: 'Words', sentences: 'Sentences', grammar: 'Grammar', paragraph: 'Paragraph', prompt: 'Try writing here...', checkWriting: 'Check my writing', correct: 'Correct sentence', mistake: 'Mistake explanation', suggestion: 'Simple improvement', downloadsTitle: 'Your downloads', downloadsHint: 'Keep lessons close, even when you are offline.', pdf: 'Lesson PDF', audio: 'Spoken English MP3', sample: 'Sample file', ready: 'Ready for future files', progressTitle: 'Your learning journey', lessonsDone: 'Lessons completed', testsDone: 'Tests completed', speakingDone: 'Speaking sessions', writingDone: 'Writing practices', noProgress: 'Start your first lesson to see progress here.', noTest: 'No test score yet', languageShort: 'EN', back: 'Back', listen: 'Listen', word: 'Word', pronunciation: 'Say it like', sentence: 'Sentence', encouragement: 'Great effort! Keep going.', level: 'Level 1', testOne: 'Test 1', testTwo: 'Test 2', selectLanguage: 'Language', saved: 'Saved on this device',
  },
  si: {
    home: 'මුල් පිටුව', lessons: 'පාඩම්', practice: 'පුහුණුව', progress: 'ප්‍රගතිය', downloads: 'බාගැනීම්', hello: 'ආයුබෝවන්, සිසුවා', subtitle: 'කුඩා පියවර. ශක්තිමත් ඉංග්‍රීසි.', continue: 'ඉගෙනීම දිගටම', speaking: 'කතා පුහුණුව', writing: 'ලිවීමේ පුහුණුව', start: 'ආරම්භ කරන්න', viewAll: 'සියල්ල බලන්න', yourProgress: 'ඔබේ ප්‍රගතිය', completed: 'සම්පූර්ණයි', currentLevel: 'දැනට මට්ටම', beginner: 'මට්ටම 1 · ආරම්භක', chooseLanguage: 'ඔබේ භාෂාව තෝරන්න', quickPractice: 'ඉක්මන් පුහුණුව', learnAZ: 'A–Z ඉගෙන ගන්න', lessonProgress: 'පාඩම් ප්‍රගතිය', lesson: 'පාඩම', vocabulary: 'වචන', examples: 'උදාහරණ වාක්‍ය', explanation: 'සරල පැහැදිලි කිරීම', practiceQuestions: 'පුහුණු ප්‍රශ්නය', completeLesson: 'පාඩම සම්පූර්ණ කරන්න', next: 'ඊළඟ', test: 'පරීක්ෂණය', testIntro: 'ඔබ දන්නා දේ පෙන්වන්න. හොඳම පිළිතුර තෝරන්න.', submit: 'පිළිතුර පරීක්ෂා කරන්න', score: 'ඔබේ ලකුණු', done: 'අවසන්', tryAgain: 'නැවත උත්සාහ කරන්න', startTest: 'පරීක්ෂණය ආරම්භ කරන්න', aiSpeaking: 'AI කතා පුහුණුව', speakingHint: 'ඔබේ හිතවත් ඉංග්‍රීසි ගුරුවරයා සමඟ කතා කරන්න. අනාගත AI සම්බන්ධතාවය මෙයට එක් කළ හැක.', teacher: 'ගුරුවරයා', you: 'ඔබ', send: 'යවන්න', writingTitle: 'ලිවීමේ පුහුණුව', writingCorrection: 'මගේ ලිවීම නිවැරදි කරන්න', writingHint: 'සෑම දිනකම ටිකක් ලියන්න. අපි ඔබට දියුණු වීමට උදව් කරමු.', letters: 'A–Z', words: 'වචන', sentences: 'වාක්‍ය', grammar: 'ව්‍යාකරණ', paragraph: 'ඡේදය', prompt: 'මෙහි ලියන්න...', checkWriting: 'මගේ ලිවීම පරීක්ෂා කරන්න', correct: 'නිවැරදි වාක්‍යය', mistake: 'වැරදි පැහැදිලි කිරීම', suggestion: 'සරල වැඩිදියුණු කිරීම', downloadsTitle: 'ඔබේ බාගැනීම්', downloadsHint: 'අන්තර්ජාලය නැති විටත් පාඩම් ළඟ තබා ගන්න.', pdf: 'පාඩම් PDF', audio: 'කතා ඉංග්‍රීසි MP3', sample: 'ආදර්ශ ගොනුව', ready: 'අනාගත ගොනු සඳහා සූදානම්', progressTitle: 'ඔබේ ඉගෙනුම් ගමන', lessonsDone: 'සම්පූර්ණ කළ පාඩම්', testsDone: 'සම්පූර්ණ කළ පරීක්ෂණ', speakingDone: 'කතා සැසි', writingDone: 'ලිවීම් පුහුණු', noProgress: 'ඔබේ පළමු පාඩම ආරම්භ කළ විට ප්‍රගතිය මෙහි පෙන්වයි.', noTest: 'තවම පරීක්ෂණ ලකුණු නැත', languageShort: 'සිං', back: 'ආපසු', listen: 'අසන්න', word: 'වචනය', pronunciation: 'කියන්නේ මෙහෙමයි', sentence: 'වාක්‍යය', encouragement: 'හොඳ උත්සාහයක්! දිගටම යන්න.', level: 'මට්ටම 1', testOne: 'පරීක්ෂණය 1', testTwo: 'පරීක්ෂණය 2', selectLanguage: 'භාෂාව', saved: 'මෙම උපාංගයේ සුරැකේ',
  },
  ta: {
    home: 'முகப்பு', lessons: 'பாடங்கள்', practice: 'பயிற்சி', progress: 'முன்னேற்றம்', downloads: 'பதிவிறக்கங்கள்', hello: 'வணக்கம், மாணவரே', subtitle: 'சிறிய படிகள். நல்ல ஆங்கிலம்.', continue: 'கற்றலைத் தொடருங்கள்', speaking: 'பேச்சுப் பயிற்சி', writing: 'எழுத்துப் பயிற்சி', start: 'தொடங்குங்கள்', viewAll: 'அனைத்தையும் காண்க', yourProgress: 'உங்கள் முன்னேற்றம்', completed: 'முடிந்தது', currentLevel: 'தற்போதைய நிலை', beginner: 'நிலை 1 · தொடக்கநிலை', chooseLanguage: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்', quickPractice: 'விரைவு பயிற்சி', learnAZ: 'A–Z கற்றல்', lessonProgress: 'பாட முன்னேற்றம்', lesson: 'பாடம்', vocabulary: 'சொற்கள்', examples: 'எடுத்துக்காட்டு வாக்கியங்கள்', explanation: 'எளிய விளக்கம்', practiceQuestions: 'பயிற்சி கேள்வி', completeLesson: 'பாடத்தை முடிக்கவும்', next: 'அடுத்து', test: 'சோதனை', testIntro: 'உங்களுக்குத் தெரிந்ததை காட்டுங்கள். சிறந்த பதிலைத் தேர்ந்தெடுக்கவும்.', submit: 'பதிலைச் சரிபார்க்கவும்', score: 'உங்கள் மதிப்பெண்', done: 'முடிந்தது', tryAgain: 'மீண்டும் முயற்சி', startTest: 'சோதனையைத் தொடங்குங்கள்', aiSpeaking: 'AI பேச்சுப் பயிற்சி', speakingHint: 'உங்கள் நட்பான ஆங்கில ஆசிரியருடன் பேசுங்கள். எதிர்கால AI இணைப்பை இந்த உரையாடலில் சேர்க்கலாம்.', teacher: 'ஆசிரியர்', you: 'நீங்கள்', send: 'அனுப்பவும்', writingTitle: 'எழுத்துப் பயிற்சி', writingCorrection: 'என் எழுத்தைச் சரிசெய்யவும்', writingHint: 'ஒவ்வொரு நாளும் கொஞ்சம் எழுதுங்கள். முன்னேற நாங்கள் உதவுவோம்.', letters: 'A–Z', words: 'சொற்கள்', sentences: 'வாக்கியங்கள்', grammar: 'இலக்கணம்', paragraph: 'பத்தி', prompt: 'இங்கே எழுதுங்கள்...', checkWriting: 'என் எழுத்தைச் சரிபார்க்கவும்', correct: 'சரியான வாக்கியம்', mistake: 'தவறு விளக்கம்', suggestion: 'எளிய மேம்பாடு', downloadsTitle: 'உங்கள் பதிவிறக்கங்கள்', downloadsHint: 'இணையம் இல்லாவிட்டாலும் பாடங்களை அருகில் வைத்திருங்கள்.', pdf: 'பாட PDF', audio: 'பேசும் ஆங்கில MP3', sample: 'மாதிரி கோப்பு', ready: 'எதிர்கால கோப்புகளுக்குத் தயார்', progressTitle: 'உங்கள் கற்றல் பயணம்', lessonsDone: 'முடிந்த பாடங்கள்', testsDone: 'முடிந்த சோதனைகள்', speakingDone: 'பேச்சு அமர்வுகள்', writingDone: 'எழுத்துப் பயிற்சிகள்', noProgress: 'உங்கள் முதல் பாடத்தைத் தொடங்கினால் முன்னேற்றம் இங்கே தோன்றும்.', noTest: 'சோதனை மதிப்பெண் இல்லை', languageShort: 'த', back: 'பின்', listen: 'கேளுங்கள்', word: 'சொல்', pronunciation: 'இப்படிச் சொல்லுங்கள்', sentence: 'வாக்கியம்', encouragement: 'நல்ல முயற்சி! தொடர்ந்து செல்லுங்கள்.', level: 'நிலை 1', testOne: 'சோதனை 1', testTwo: 'சோதனை 2', selectLanguage: 'மொழி', saved: 'இந்த சாதனத்தில் சேமிக்கப்பட்டது',
  },
};

const getText = (language: Language) => copy[language];
const featureCopy = {
  en: {
    startSpeaking: 'Start speaking',
    stopSpeaking: 'Stop speaking',
    microphone: 'Microphone',
    listening: 'Listening for your answer…',
    readyToListen: 'Ready for your voice',
    demoMode: 'Demo mode · no AI key needed',
    liveMode: 'Connected to your AI service',
    transcript: 'Your transcript',
    feedback: 'Speaking feedback',
    grammarCorrection: 'Grammar correction',
    explanation: 'Simple explanation',
    speakingLevel: 'Speaking level',
    topic: 'Conversation topic',
    startPractice: 'Start practice',
    clearConversation: 'Clear conversation',
    repeatAI: 'Repeat AI voice',
    correctMyEnglish: 'Correct my English',
    tryDemo: 'Try demo phrase',
    demoPhrase: 'My name Kamal.',
    corrected: 'My name is Kamal.',
    speakAgain: 'Tap the microphone, then stop when you finish.',
    locked: 'Complete the required lessons first',
    requiredLessons: 'Finish all five lessons to unlock this test.',
    downloadReady: 'Saved to the app folder. Choose an app to open or share it.',
    downloadError: 'The file could not be saved. Please try again.',
    downloaded: 'File ready',
    exercise: 'Beginner exercise',
    betterExample: 'Better example',
    mistakesFound: 'Mistakes found',
    noMistakes: 'No mistakes found',
    sentencePrompt: 'Write one English sentence about yourself.',
    wordPrompt: 'Write three English words you know.',
    grammarPrompt: 'Fix this: i like tea',
    paragraphPrompt: 'Write two simple sentences about your day.',
    azProgress: 'A–Z progress',
    letterName: 'Letter name',
    pronunciationGuide: 'Pronunciation guide',
    exampleWords: 'Example words',
    exampleSentence: 'Example sentence',
    markLetter: 'Mark letter complete',
    completedLetter: 'Letter completed',
    nextLetter: 'Next letter',
    wordTypeMatch: 'Match words',
    wordTypeMissing: 'Missing letters',
    wordTypeChoose: 'Choose a word',
    wordTypeType: 'Type the word',
    checkAnswer: 'Check answer',
    tryNext: 'Try next',
    yourAnswer: 'Your answer',
    selectOption: 'Select an answer',
    grammarCategory: 'Grammar category',
    paragraphTopic: 'Paragraph topic',
    correctionDemo: 'Demo correction · no AI key needed',
    apkDownload: 'Download Android APK',
    apkUnavailable: 'APK download is not configured yet.',
    apkSetup: 'Set EXPO_PUBLIC_ANDROID_APK_URL after hosting a built APK.',
    apkError: 'The APK could not be downloaded. Please try again.',
  },
  si: {
    startSpeaking: 'කතා කිරීම ආරම්භ කරන්න',
    stopSpeaking: 'කතා කිරීම නවත්වන්න',
    microphone: 'මයික්‍රොෆෝනය',
    listening: 'ඔබේ පිළිතුර අසමින්…',
    readyToListen: 'ඔබේ හඬට සූදානම්',
    demoMode: 'ආදර්ශ මාදිලිය · AI යතුරක් අවශ්‍ය නැත',
    liveMode: 'ඔබේ AI සේවයට සම්බන්ධයි',
    transcript: 'ඔබේ පෙළ',
    feedback: 'කතා ප්‍රතිචාරය',
    grammarCorrection: 'ව්‍යාකරණ නිවැරදි කිරීම',
    explanation: 'සරල පැහැදිලි කිරීම',
    speakingLevel: 'කතා මට්ටම',
    topic: 'සංවාද මාතෘකාව',
    startPractice: 'පුහුණුව ආරම්භ කරන්න',
    clearConversation: 'සංවාදය මකන්න',
    repeatAI: 'AI හඬ නැවත අසන්න',
    correctMyEnglish: 'මගේ ඉංග්‍රීසි නිවැරදි කරන්න',
    tryDemo: 'ආදර්ශ වාක්‍යය උත්සාහ කරන්න',
    demoPhrase: 'My name Kamal.',
    corrected: 'My name is Kamal.',
    speakAgain: 'මයික්‍රොෆෝනය තට්ටු කර අවසන් වූ විට නවත්වන්න.',
    locked: 'අවශ්‍ය පාඩම් පළමුව සම්පූර්ණ කරන්න',
    requiredLessons: 'මෙම පරීක්ෂණය විවෘත කිරීමට පාඩම් පහම අවසන් කරන්න.',
    downloadReady: 'යෙදුම් ෆෝල්ඩරයේ සුරකින ලදී. විවෘත කිරීමට හෝ බෙදා ගැනීමට යෙදුමක් තෝරන්න.',
    downloadError: 'ගොනුව සුරැකිය නොහැක. නැවත උත්සාහ කරන්න.',
    downloaded: 'ගොනුව සූදානම්',
    exercise: 'ආරම්භක අභ්‍යාසය',
    betterExample: 'වඩා හොඳ උදාහරණය',
    mistakesFound: 'හමු වූ වැරදි',
    noMistakes: 'වැරදි හමු නොවීය',
    sentencePrompt: 'ඔබ ගැන ඉංග්‍රීසි වාක්‍යයක් ලියන්න.',
    wordPrompt: 'ඔබ දන්නා ඉංග්‍රීසි වචන තුනක් ලියන්න.',
    grammarPrompt: 'මෙය නිවැරදි කරන්න: i like tea',
    paragraphPrompt: 'ඔබේ දවස ගැන සරල වාක්‍ය දෙකක් ලියන්න.',
    azProgress: 'A–Z ප්‍රගතිය',
    letterName: 'අකුරේ නම',
    pronunciationGuide: 'උච්චාරණ මාර්ගෝපදේශය',
    exampleWords: 'උදාහරණ වචන',
    exampleSentence: 'උදාහරණ වාක්‍යය',
    markLetter: 'අකුර සම්පූර්ණ ලෙස සලකුණු කරන්න',
    completedLetter: 'අකුර සම්පූර්ණයි',
    nextLetter: 'ඊළඟ අකුර',
    wordTypeMatch: 'වචන ගළපන්න',
    wordTypeMissing: 'අහිමි අකුරු',
    wordTypeChoose: 'වචනය තෝරන්න',
    wordTypeType: 'වචනය ටයිප් කරන්න',
    checkAnswer: 'පිළිතුර පරීක්ෂා කරන්න',
    tryNext: 'ඊළඟට උත්සාහ කරන්න',
    yourAnswer: 'ඔබේ පිළිතුර',
    selectOption: 'පිළිතුරක් තෝරන්න',
    grammarCategory: 'ව්‍යාකරණ කාණ්ඩය',
    paragraphTopic: 'ඡේද මාතෘකාව',
    correctionDemo: 'ආදර්ශ නිවැරදි කිරීම · AI යතුරක් අවශ්‍ය නැත',
    apkDownload: 'Android APK බාගන්න',
    apkUnavailable: 'APK බාගැනීම තවම සකසා නැත.',
    apkSetup: 'APK එක සත්කාරක කළ පසු EXPO_PUBLIC_ANDROID_APK_URL සකසන්න.',
    apkError: 'APK එක බාගත කළ නොහැක. නැවත උත්සාහ කරන්න.',
  },
  ta: {
    startSpeaking: 'பேசத் தொடங்குங்கள்',
    stopSpeaking: 'பேசுவதை நிறுத்துங்கள்',
    microphone: 'ஒலிவாங்கி',
    listening: 'உங்கள் பதிலைக் கேட்கிறது…',
    readyToListen: 'உங்கள் குரலுக்குத் தயார்',
    demoMode: 'மாதிரி நிலை · AI விசை தேவையில்லை',
    liveMode: 'உங்கள் AI சேவையுடன் இணைக்கப்பட்டது',
    transcript: 'உங்கள் உரை',
    feedback: 'பேச்சு கருத்து',
    grammarCorrection: 'இலக்கண திருத்தம்',
    explanation: 'எளிய விளக்கம்',
    speakingLevel: 'பேச்சு நிலை',
    topic: 'உரையாடல் தலைப்பு',
    startPractice: 'பயிற்சியைத் தொடங்குங்கள்',
    clearConversation: 'உரையாடலை அழிக்கவும்',
    repeatAI: 'AI குரலை மீண்டும் கேளுங்கள்',
    correctMyEnglish: 'என் ஆங்கிலத்தைச் சரிசெய்யவும்',
    tryDemo: 'மாதிரி வாக்கியத்தை முயற்சிக்கவும்',
    demoPhrase: 'My name Kamal.',
    corrected: 'My name is Kamal.',
    speakAgain: 'ஒலிவாங்கியைத் தட்டி முடித்ததும் நிறுத்துங்கள்.',
    locked: 'தேவையான பாடங்களை முதலில் முடிக்கவும்',
    requiredLessons: 'இந்த சோதனையைத் திறக்க ஐந்து பாடங்களையும் முடிக்கவும்.',
    downloadReady: 'ஆப் கோப்புறையில் சேமிக்கப்பட்டது. திறக்க அல்லது பகிர ஒரு ஆப்பைத் தேர்ந்தெடுக்கவும்.',
    downloadError: 'கோப்பைச் சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
    downloaded: 'கோப்பு தயார்',
    exercise: 'தொடக்கநிலை பயிற்சி',
    betterExample: 'சிறந்த எடுத்துக்காட்டு',
    mistakesFound: 'கண்டறியப்பட்ட தவறுகள்',
    noMistakes: 'தவறுகள் இல்லை',
    sentencePrompt: 'உங்களைப் பற்றி ஒரு ஆங்கில வாக்கியம் எழுதுங்கள்.',
    wordPrompt: 'உங்களுக்குத் தெரிந்த மூன்று ஆங்கிலச் சொற்களை எழுதுங்கள்.',
    grammarPrompt: 'இதைச் சரிசெய்யவும்: i like tea',
    paragraphPrompt: 'உங்கள் நாளைப் பற்றி இரண்டு எளிய வாக்கியங்களை எழுதுங்கள்.',
    azProgress: 'A–Z முன்னேற்றம்',
    letterName: 'எழுத்தின் பெயர்',
    pronunciationGuide: 'உச்சரிப்பு வழிகாட்டி',
    exampleWords: 'எடுத்துக்காட்டு சொற்கள்',
    exampleSentence: 'எடுத்துக்காட்டு வாக்கியம்',
    markLetter: 'எழுத்தை முடிந்ததாகக் குறிக்கவும்',
    completedLetter: 'எழுத்து முடிந்தது',
    nextLetter: 'அடுத்த எழுத்து',
    wordTypeMatch: 'சொற்களைப் பொருத்தவும்',
    wordTypeMissing: 'விடுபட்ட எழுத்துகள்',
    wordTypeChoose: 'ஒரு சொல்லைத் தேர்ந்தெடுக்கவும்',
    wordTypeType: 'சொல்லைத் தட்டச்சு செய்யவும்',
    checkAnswer: 'பதிலைச் சரிபார்க்கவும்',
    tryNext: 'அடுத்து முயற்சி',
    yourAnswer: 'உங்கள் பதில்',
    selectOption: 'ஒரு பதிலைத் தேர்ந்தெடுக்கவும்',
    grammarCategory: 'இலக்கண வகை',
    paragraphTopic: 'பத்தி தலைப்பு',
    correctionDemo: 'மாதிரி திருத்தம் · AI விசை தேவையில்லை',
    apkDownload: 'Android APK பதிவிறக்கவும்',
    apkUnavailable: 'APK பதிவிறக்கம் இன்னும் அமைக்கப்படவில்லை.',
    apkSetup: 'APK-ஐ ஹோஸ்ட் செய்த பிறகு EXPO_PUBLIC_ANDROID_APK_URL அமைக்கவும்.',
    apkError: 'APK-ஐ பதிவிறக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  },
};
const iconForView: Record<ViewName, keyof typeof Ionicons.glyphMap> = { home: 'home-outline', lessons: 'book-outline', practice: 'pencil-outline', progress: 'stats-chart-outline', downloads: 'download-outline', speaking: 'chatbubbles-outline', writing: 'create-outline', lesson: 'book-outline', test: 'checkmark-circle-outline' };

const speakingLevels: { id: SpeakingLevel; labels: Record<Language, string> }[] = [
  { id: 'beginner', labels: { en: 'Beginner', si: 'ආරම්භක', ta: 'தொடக்கநிலை' } },
  { id: 'elementary', labels: { en: 'Elementary', si: 'මූලික', ta: 'அடிப்படை' } },
  { id: 'intermediate', labels: { en: 'Intermediate', si: 'මධ්‍යම', ta: 'இடைநிலை' } },
];

const speakingTopics: { id: SpeakingTopic; labels: Record<Language, string> }[] = [
  { id: 'introductions', labels: { en: 'Introducing yourself', si: 'ඔබව හඳුන්වා දීම', ta: 'உங்களை அறிமுகப்படுத்துதல்' } },
  { id: 'family', labels: { en: 'Family', si: 'පවුල', ta: 'குடும்பம்' } },
  { id: 'school', labels: { en: 'School', si: 'පාසල', ta: 'பள்ளி' } },
  { id: 'work', labels: { en: 'Work', si: 'රැකියාව', ta: 'வேலை' } },
  { id: 'shopping', labels: { en: 'Shopping', si: 'සාප්පු සවාරි', ta: 'ஷாப்பிங்' } },
  { id: 'food', labels: { en: 'Food', si: 'ආහාර', ta: 'உணவு' } },
  { id: 'travel', labels: { en: 'Travel', si: 'ගමන්', ta: 'பயணம்' } },
  { id: 'routine', labels: { en: 'Daily routine', si: 'දෛනික චර්යාව', ta: 'தினசரி வழக்கம்' } },
];

function actionHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

function openingTeacherMessage(topic: SpeakingTopic) {
  const openings: Record<SpeakingTopic, string> = {
    introductions: 'Hello! What is your name?',
    family: 'Hello! How many people are in your family?',
    school: 'Hello! What do you study at school?',
    work: 'Hello! What do you do for work?',
    shopping: 'Hello! What would you like to buy?',
    food: 'Hello! What food do you like?',
    travel: 'Hello! Where would you like to travel?',
    routine: 'Hello! What do you do in the morning?',
  };
  return openings[topic];
}

function mockTeacherReply(transcript: string, topic: SpeakingTopic) {
  const lower = transcript.toLowerCase();
  if (topic === 'family' || lower.includes('family') || lower.includes('brother') || lower.includes('sister')) return 'That is nice. Do you live with your family?';
  if (topic === 'school' || lower.includes('school') || lower.includes('study')) return 'Good! What is your favourite subject?';
  if (topic === 'work' || lower.includes('work') || lower.includes('job')) return 'I see. What do you do at work?';
  if (topic === 'shopping' || lower.includes('buy') || lower.includes('price')) return 'Good question. What colour would you like?';
  if (topic === 'food' || lower.includes('eat') || lower.includes('food')) return 'Yummy! Do you like rice or noodles?';
  if (topic === 'travel' || lower.includes('travel') || lower.includes('visit')) return 'That sounds exciting. Who will travel with you?';
  if (topic === 'routine' || lower.includes('morning') || lower.includes('every day')) return 'Great! What do you do in the evening?';
  if (lower.includes('my name')) return 'Nice to meet you! Where do you live?';
  if (lower.includes('live')) return 'That sounds nice. What do you like to eat?';
  if (lower.includes('like')) return 'Good sentence! What do you do every morning?';
  return 'Good try! Please say one more simple sentence.';
}

function getSpeakingFeedback(transcript: string, language: Language) {
  const lower = transcript.trim().toLowerCase();
  const feature = featureCopy[language];
  if (lower.includes('my name') && !lower.includes(' is ')) {
    return { correction: feature.corrected, explanation: language === 'si' ? 'නමෙන් පසු is යෙදීමෙන් සම්පූර්ණ වාක්‍යයක් සෑදේ.' : language === 'ta' ? 'பெயருக்குப் பிறகு is சேர்த்தால் முழுமையான வாக்கியம் கிடைக்கும்.' : 'Use is after the name to make a complete sentence.' };
  }
  return { correction: transcript.trim(), explanation: language === 'si' ? 'ඔබ හොඳින් උත්සාහ කළා. සරල වාක්‍ය දිගටම කතා කරන්න.' : language === 'ta' ? 'நல்ல முயற்சி. எளிய வாக்கியங்களைத் தொடர்ந்து பேசுங்கள்.' : 'Nice effort. Keep speaking in short, clear sentences.' };
}

async function requestTeacherReply(transcript: string, language: Language, level: SpeakingLevel, topic: SpeakingTopic) {
  if (AI_API_URL) {
    try {
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(AI_API_KEY ? { Authorization: `Bearer ${AI_API_KEY}` } : {}) },
        body: JSON.stringify({ mode: 'english-conversation', level, topic, message: transcript, explanationLanguage: language }),
      });
      if (response.ok) {
        const data = await response.json() as { reply?: string };
        if (data.reply) return data.reply;
      }
    } catch {
      // Fall back to the offline teacher so the speaking flow always works.
    }
  }
  return mockTeacherReply(transcript, topic);
}

type WritingResult = { correct: string; mistakes: string; explanation: string; better: string };

function localizedWritingExplanation(language: Language, kind: 'past' | 'capital' | 'period' | 'general') {
  const explanations: Record<'past' | 'capital' | 'period' | 'general', Record<Language, string>> = {
    past: {
      en: 'This sentence talks about the past, so use “went”. Remove “am” before the past verb.',
      si: 'මෙම වාක්‍යය අතීතය ගැනයි. ඒ නිසා “went” භාවිතා කරන්න. අතීත ක්‍රියා පදයට පෙර “am” ඉවත් කරන්න.',
      ta: 'இந்த வாக்கியம் கடந்த காலத்தைப் பற்றி பேசுகிறது. எனவே “went” பயன்படுத்துங்கள். கடந்தகால வினைச்சொல்லுக்கு முன் “am” வேண்டாம்.',
    },
    capital: {
      en: 'Start an English sentence with a capital letter.',
      si: 'ඉංග්‍රීසි වාක්‍යයක් විශාල අකුරකින් ආරම්භ කරන්න.',
      ta: 'ஆங்கில வாக்கியத்தை பெரிய எழுத்தில் தொடங்குங்கள்.',
    },
    period: {
      en: 'Put a full stop at the end of a complete sentence.',
      si: 'සම්පූර්ණ වාක්‍යයක අවසානයේ තිතක් දමන්න.',
      ta: 'முழுமையான வாக்கியத்தின் முடிவில் ஒரு புள்ளி இடுங்கள்.',
    },
    general: {
      en: 'Use short sentences. Check the subject, verb, and time word.',
      si: 'කෙටි වාක්‍ය භාවිතා කරන්න. කර්තෘ, ක්‍රියා පදය සහ කාල වචනය පරීක්ෂා කරන්න.',
      ta: 'சிறிய வாக்கியங்களைப் பயன்படுத்துங்கள். எழுவாய், வினைச்சொல், காலச் சொல்லைச் சரிபார்க்கவும்.',
    },
  };
  return explanations[kind][language];
}

function demoWritingCorrection(text: string, language: Language, mode: PracticeMode, paragraphTopicId?: string): WritingResult {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase().replace(/[.!?]+$/, '');
  const paragraph = paragraphTopics.find((item) => item.id === paragraphTopicId) ?? paragraphTopics[0];

  if (lower === 'i am go school yesterday' || lower.includes('i am go school yesterday')) {
    return {
      correct: 'I went to school yesterday.',
      mistakes: '• “go” should be “went”\n• Remove “am”\n• Add “to” before “school”',
      explanation: localizedWritingExplanation(language, 'past'),
      better: 'I went to school yesterday. I learned English with my friends.',
    };
  }
  if (lower === 'my name kamal') {
    return {
      correct: 'My name is Kamal.',
      mistakes: '• Add “is” after “name”\n• Start with a capital letter\n• Add a full stop',
      explanation: language === 'si' ? 'නම පැවසීමට “My name is …” යන රටාව භාවිතා කරන්න.' : language === 'ta' ? 'பெயரைச் சொல்ல “My name is …” என்ற வடிவத்தைப் பயன்படுத்துங்கள்.' : 'Use the pattern “My name is …” to say your name.',
      better: 'My name is Kamal. I am learning English.',
    };
  }
  if (lower === 'i go school') {
    return {
      correct: 'I go to school.',
      mistakes: '• Add “to” before “school”\n• Add a full stop',
      explanation: language === 'si' ? 'ස්ථානයකට යන විට “go to” භාවිතා කරන්න.' : language === 'ta' ? 'ஒரு இடத்திற்குச் செல்லும்போது “go to” பயன்படுத்துங்கள்.' : 'Use “go to” when you travel to a place.',
      better: 'I go to school every day.',
    };
  }

  let corrected = trimmed;
  const issues: string[] = [];
  if (mode !== 'words' && /^[a-z]/.test(corrected)) {
    corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
    issues.push('• Start with a capital letter');
  }
  if (mode !== 'words' && corrected && !/[.?!]$/.test(corrected)) {
    corrected = `${corrected}.`;
    issues.push('• Add a full stop');
  }
  const looksGood = mode === 'words'
    ? trimmed.split(/\s|,/).filter(Boolean).length >= 3
    : issues.length === 0;
  return {
    correct: looksGood ? trimmed : corrected,
    mistakes: looksGood ? 'No mistakes found.' : issues.join('\n'),
    explanation: looksGood ? 'Good work. Your sentence is clear.' : issues.some((item) => item.includes('capital')) ? localizedWritingExplanation(language, 'capital') : localizedWritingExplanation(language, 'period'),
    better: mode === 'paragraph' ? paragraph.better : mode === 'words' ? 'I read a book every day.' : 'I am learning English every day.',
  };
}

async function requestWritingCorrection(text: string, language: Language, mode: PracticeMode, paragraphTopicId?: string): Promise<WritingResult> {
  if (AI_API_URL) {
    try {
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(AI_API_KEY ? { Authorization: `Bearer ${AI_API_KEY}` } : {}) },
        body: JSON.stringify({ mode: 'writing-correction', practiceMode: mode, paragraphTopic: paragraphTopicId, text, explanationLanguage: language }),
      });
      if (response.ok) {
        const data = await response.json() as Partial<WritingResult>;
        if (data.correct && data.mistakes && data.explanation && data.better) {
          return { correct: data.correct, mistakes: data.mistakes, explanation: data.explanation, better: data.better };
        }
      }
    } catch {
      // Keep the offline demo correction available when the optional service is unavailable.
    }
  }
  return demoWritingCorrection(text, language, mode, paragraphTopicId);
}

async function saveAndShareAsset(moduleId: number, filename: string, mimeType: string, title: string, language: Language) {
  try {
    const asset = Asset.fromModule(moduleId);
    await asset.downloadAsync();
    const sourceUri = asset.localUri ?? asset.uri;
    const targetUri = `${FileSystem.documentDirectory}${filename}`;
    if (sourceUri !== targetUri) {
      const existing = await FileSystem.getInfoAsync(targetUri);
      if (!existing.exists) await FileSystem.copyAsync({ from: sourceUri, to: targetUri });
    }
    if (Platform.OS !== 'web' && await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(targetUri, { mimeType, dialogTitle: title, UTI: mimeType === 'application/pdf' ? 'com.adobe.pdf' : 'public.audio' });
    } else {
      Alert.alert(featureCopy[language].downloaded, featureCopy[language].downloadReady);
    }
  } catch {
    Alert.alert(featureCopy[language].downloaded, featureCopy[language].downloadError);
  }
}

async function downloadAndroidApk(language: Language) {
  const feature = featureCopy[language];
  if (!ANDROID_APK_URL) {
    Alert.alert(feature.apkUnavailable, feature.apkSetup);
    return;
  }

  try {
    if (Platform.OS === 'android' && FileSystem.documentDirectory && await Sharing.isAvailableAsync()) {
      const targetUri = `${FileSystem.documentDirectory}englishmate-ai.apk`;
      const download = await FileSystem.downloadAsync(ANDROID_APK_URL, targetUri);
      await Sharing.shareAsync(download.uri, {
        mimeType: 'application/vnd.android.package-archive',
        dialogTitle: feature.apkDownload,
      });
      return;
    }
    await Linking.openURL(ANDROID_APK_URL);
  } catch {
    Alert.alert(feature.apkDownload, feature.apkError);
  }
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
  const requiredIds = testId === 1 ? [1, 2, 3, 4, 5] : [6, 7, 8, 9, 10];
  const unlocked = requiredIds.every((id) => app.completedLessons.includes(id));
  const feature = featureCopy[language];
  return <Pressable testID={`test-${testId}`} disabled={!unlocked} onPress={() => go('test', testId)} style={({ pressed }) => [styles.testRow, { backgroundColor: unlocked ? colors.accent : colors.muted, borderColor: unlocked ? colors.gold : colors.border }, !unlocked && styles.lockedRow, pressed && styles.pressed]}><View style={[styles.testIcon, { backgroundColor: unlocked ? colors.gold : colors.secondary }]}><Ionicons name={unlocked ? 'trophy-outline' : 'lock-closed-outline'} size={20} color={unlocked ? colors.navy : colors.mutedForeground} /></View><View style={styles.flex}><Text style={[styles.testTitle, { color: colors.foreground }]}>{testId === 1 ? t.testOne : t.testTwo}</Text><Text style={[styles.testHint, { color: colors.mutedForeground }]}>{unlocked ? (score === undefined ? t.startTest : `${t.score}: ${score}%`) : feature.requiredLessons}</Text></View><Ionicons name={unlocked ? 'arrow-forward-circle' : 'lock-closed-outline'} size={22} color={unlocked ? colors.accentForeground : colors.mutedForeground} /></Pressable>;
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
  const feature = featureCopy[language];
  const testLessons = testId === 1 ? lessons.slice(0, 5) : lessons.slice(5, 10);
  const questions = testLessons.map((lesson) => ({ question: lesson.question, answer: lesson.answer, options: [lesson.answer, 'blue', 'please'] }));
  const requiredIds = testId === 1 ? [1, 2, 3, 4, 5] : [6, 7, 8, 9, 10];
  const unlocked = requiredIds.every((id) => app.completedLessons.includes(id));
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const question = questions[current];
  const score = answers.filter((answer, index) => answer?.toLowerCase() === questions[index]?.answer.toLowerCase()).length * 20;
  if (!unlocked) return <View style={[styles.screen, { backgroundColor: colors.background }]}><Header title={testId === 1 ? t.testOne : t.testTwo} onBack={() => go('lessons')} language={language} onLanguage={onLanguage} /><View style={styles.resultWrap}><View style={[styles.resultIcon, { backgroundColor: colors.muted }]}><Ionicons name="lock-closed-outline" size={34} color={colors.mutedForeground} /></View><Text style={[styles.resultTitle, { color: colors.foreground }]}>{feature.locked}</Text><Text style={[styles.resultHint, { color: colors.mutedForeground }]}>{feature.requiredLessons}</Text><PrimaryButton label={t.back} icon="arrow-back" colors={colors} onPress={() => go('lessons')} /></View></View>;
  if (finished) return <View style={[styles.screen, { backgroundColor: colors.background }]}><Header title={testId === 1 ? t.testOne : t.testTwo} onBack={() => go('lessons')} language={language} onLanguage={onLanguage} /><View style={styles.resultWrap}><View style={[styles.resultIcon, { backgroundColor: colors.gold }]}><Ionicons name="trophy" size={34} color={colors.navy} /></View><Text style={[styles.resultTitle, { color: colors.foreground }]}>{t.score}</Text><Text style={[styles.resultScore, { color: colors.primary }]}>{score}%</Text><Text style={[styles.resultHint, { color: colors.mutedForeground }]}>{score >= 60 ? t.encouragement : t.tryAgain}</Text><PrimaryButton label={t.done} icon="arrow-back" colors={colors} onPress={() => go('lessons')} /></View></View>;
  return <View style={[styles.screen, { backgroundColor: colors.background }]}><Header title={testId === 1 ? t.testOne : t.testTwo} onBack={() => go('lessons')} language={language} onLanguage={onLanguage} /><ScrollView contentContainerStyle={styles.scrollContent}><View style={[styles.testIntro, { backgroundColor: colors.accent }]}><Text style={[styles.testCounter, { color: colors.accentForeground }]}>{current + 1} / {questions.length}</Text><Text style={[styles.testIntroText, { color: colors.foreground }]}>{t.testIntro}</Text></View><InfoSection title={t.practiceQuestions} colors={colors}><Text style={[styles.questionText, { color: colors.foreground }]}>{question.question}</Text>{question.options.map((option) => <Pressable key={option} testID={`test-option-${option}`} onPress={() => setAnswers([...answers.slice(0, current), option])} style={[styles.optionRow, { borderColor: answers[current] === option ? colors.primary : colors.border, backgroundColor: answers[current] === option ? colors.secondary : colors.background }]}><Text style={[styles.optionText, { color: colors.foreground }]}>{option}</Text>{answers[current] === option && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}</Pressable>)}</InfoSection><PrimaryButton label={current === questions.length - 1 ? t.done : t.next} icon={current === questions.length - 1 ? 'checkmark' : 'arrow-forward'} colors={colors} onPress={() => { if (!answers[current]) return; if (current === questions.length - 1) { app.saveTestScore(testId, score); setFinished(true); } else setCurrent(current + 1); }} /></ScrollView></View>;
}

function PracticeView({ go, language, onLanguage }: { go: (view: ViewName, data?: number) => void; language: Language; onLanguage: (language: Language) => void }) {
  const colors = useColors();
  const t = getText(language);
  return <View style={[styles.screen, { backgroundColor: colors.background }]}><Header title={t.practice} language={language} onLanguage={onLanguage} /><ScrollView contentContainerStyle={styles.scrollContent}><View style={[styles.practiceHero, { backgroundColor: colors.navy }]}><Ionicons name="sparkles" size={25} color={colors.gold} /><Text style={styles.practiceHeroTitle}>{t.quickPractice}</Text><Text style={styles.practiceHeroHint}>Choose a skill and build confidence.</Text></View><Pressable onPress={() => go('writing')} style={[styles.practiceLink, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.practiceLinkIcon, { backgroundColor: colors.accent }]}><Ionicons name="create-outline" size={22} color={colors.accentForeground} /></View><View style={styles.flex}><Text style={[styles.practiceLinkTitle, { color: colors.foreground }]}>{t.writing}</Text><Text style={[styles.practiceLinkHint, { color: colors.mutedForeground }]}>{t.writingHint}</Text></View><Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} /></Pressable><Pressable onPress={() => go('speaking')} style={[styles.practiceLink, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.practiceLinkIcon, { backgroundColor: colors.mint }]}><Ionicons name="mic-outline" size={22} color={colors.success} /></View><View style={styles.flex}><Text style={[styles.practiceLinkTitle, { color: colors.foreground }]}>{t.speaking}</Text><Text style={[styles.practiceLinkHint, { color: colors.mutedForeground }]}>{t.speakingHint}</Text></View><Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} /></Pressable><Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.learnAZ}</Text><View style={[styles.alphabetPreview, { backgroundColor: colors.card, borderColor: colors.border }]}>{alphabet.slice(0, 12).map((item) => <View key={item.upper} style={[styles.letterBox, { backgroundColor: colors.secondary }]}><Text style={[styles.letterUpper, { color: colors.foreground }]}>{item.upper}</Text><Text style={[styles.letterLower, { color: colors.primary }]}>{item.lower}</Text></View>)}<Pressable onPress={() => go('writing')} style={[styles.azButton, { backgroundColor: colors.primary }]}><Text style={styles.azButtonText}>{t.start}</Text><Ionicons name="arrow-forward" size={16} color="#FFFFFF" /></Pressable></View></ScrollView><BottomNav active="practice" go={go} language={language} /></View>;
}

function WritingView({ go, language, onLanguage }: { go: (view: ViewName, data?: number) => void; language: Language; onLanguage: (language: Language) => void }) {
  const colors = useColors();
  const t = getText(language);
  const app = useApp();
  const [mode, setMode] = useState<PracticeMode>('letters');
  const [value, setValue] = useState('');
  const [result, setResult] = useState<{ correct: string; mistakes: string; explanation: string; better: string } | null>(null);
  const feature = featureCopy[language];
  const modes: { id: PracticeMode; label: string }[] = [{ id: 'letters', label: t.letters }, { id: 'words', label: t.words }, { id: 'sentences', label: t.sentences }, { id: 'grammar', label: t.grammar }, { id: 'paragraph', label: t.paragraph }];
  const placeholder = mode === 'letters' ? 'A B C...' : mode === 'words' ? 'apple, book...' : mode === 'paragraph' ? 'I am learning English...' : 'I like English.';
  const exercise = mode === 'words' ? feature.wordPrompt : mode === 'grammar' ? feature.grammarPrompt : mode === 'paragraph' ? feature.paragraphPrompt : feature.sentencePrompt;
  const checkWriting = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    const correct = mode === 'words' ? 'apple, book, cat' : mode === 'paragraph' ? 'I am learning English every day. I read a book.' : 'I like English.';
    let corrected = trimmed;
    const issues: string[] = [];
    if (mode !== 'words' && /^[a-z]/.test(corrected)) {
      corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
      issues.push(language === 'si' ? 'වාක්‍යය විශාල අකුරකින් ආරම්භ කරන්න.' : language === 'ta' ? 'வாக்கியத்தை பெரிய எழுத்தில் தொடங்குங்கள்.' : 'Start with a capital letter.');
    }
    if (mode === 'grammar' && lower === 'i like tea') {
      corrected = 'I like tea.';
      issues.push(language === 'si' ? 'අවසානයේ තිතක් දමන්න.' : language === 'ta' ? 'இறுதியில் புள்ளி இடுங்கள்.' : 'Add a full stop at the end.');
    }
    if (mode !== 'words' && !/[.?!]$/.test(corrected)) {
      corrected = `${corrected}.`;
      issues.push(language === 'si' ? 'වාක්‍යය අවසානයේ තිතක් දමන්න.' : language === 'ta' ? 'வாக்கியத்தின் முடிவில் புள்ளி இடுங்கள்.' : 'Add a full stop at the end.');
    }
    const looksGood = mode === 'words'
      ? trimmed.split(/\s|,/).filter(Boolean).length >= 3
      : issues.length === 0 && /^[A-Z]/.test(trimmed) && /[.?!]$/.test(trimmed);
    setResult({
      correct: looksGood ? trimmed : corrected || correct,
      mistakes: looksGood ? feature.noMistakes : issues.join(' '),
      explanation: looksGood ? t.encouragement : language === 'si' ? 'නිවැරදි වාක්‍යයකට විශාල මුල් අකුරක් සහ අවසාන තිතක් අවශ්‍යයි.' : language === 'ta' ? 'சரியான வாக்கியத்திற்கு பெரிய தொடக்க எழுத்தும் இறுதி புள்ளியும் தேவை.' : 'A clear beginner sentence needs a capital letter and an ending full stop.',
      better: mode === 'words' ? 'I read a book every day.' : mode === 'paragraph' ? 'I wake up in the morning. I study English.' : correct,
    });
    app.incrementWriting();
    actionHaptic();
  };
  return <View style={[styles.screen, { backgroundColor: colors.background }]}><Header title={t.writingTitle} onBack={() => go('practice')} language={language} onLanguage={onLanguage} /><KeyboardAvoidingView behavior="padding" style={styles.flex}><ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled"><Text style={[styles.bodyText, { color: colors.mutedForeground }]}>{t.writingHint}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeRow}>{modes.map((item) => <Pressable key={item.id} onPress={() => { setMode(item.id); setResult(null); }} style={[styles.modeChip, { backgroundColor: mode === item.id ? colors.navy : colors.card, borderColor: mode === item.id ? colors.navy : colors.border }]}><Text style={[styles.modeChipText, { color: mode === item.id ? '#FFFFFF' : colors.foreground }]}>{item.label}</Text></Pressable>)}</ScrollView>{mode === 'letters' ? <LetterList colors={colors} t={t} /> : <View style={[styles.writingCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.exerciseBox, { backgroundColor: colors.secondary }]}><Text style={[styles.exerciseLabel, { color: colors.primary }]}>{feature.exercise}</Text><Text style={[styles.exerciseText, { color: colors.foreground }]}>{exercise}</Text></View><TextInput testID="writing-input" value={value} onChangeText={setValue} multiline numberOfLines={5} placeholder={placeholder} placeholderTextColor={colors.mutedForeground} style={[styles.writingInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} textAlignVertical="top" /><PrimaryButton label={t.checkWriting} icon="checkmark-circle-outline" colors={colors} onPress={checkWriting} />{result && <View style={[styles.resultBox, { backgroundColor: colors.mint }]}><ResultLine label={t.correct} value={result.correct} colors={colors} icon="checkmark-circle" /><ResultLine label={feature.mistakesFound} value={result.mistakes} colors={colors} icon="alert-circle-outline" /><ResultLine label={feature.explanation} value={result.explanation} colors={colors} icon="information-circle" /><ResultLine label={feature.betterExample} value={result.better} colors={colors} icon="bulb-outline" /></View>}</View>}</ScrollView></KeyboardAvoidingView></View>;
}

function LetterList({ colors, t }: { colors: ReturnType<typeof useColors>; t: typeof copy.en }) {
  return <View style={[styles.letterPracticeCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.rowBetween}><View><Text style={[styles.writingPrompt, { color: colors.foreground }]}>{t.learnAZ}</Text><Text style={[styles.bodyText, { color: colors.mutedForeground }]}>{t.pronunciation}: “ay, bee, see...”</Text></View><Ionicons name="volume-medium-outline" size={24} color={colors.primary} /></View><View style={styles.alphabetGrid}>{alphabet.map((item) => <View key={item.upper} style={[styles.letterTile, { backgroundColor: colors.secondary }]}><Text style={[styles.tileUpper, { color: colors.foreground }]}>{item.upper}</Text><Text style={[styles.tileLower, { color: colors.primary }]}>{item.lower}</Text><Text style={[styles.tileWord, { color: colors.mutedForeground }]}>{item.words[0]}</Text></View>)}</View></View>;
}

function ResultLine({ label, value, colors, icon }: { label: string; value: string; colors: ReturnType<typeof useColors>; icon: keyof typeof Ionicons.glyphMap }) {
  return <View style={styles.resultLine}><Ionicons name={icon} size={18} color={colors.success} /><View style={styles.flex}><Text style={[styles.resultLabel, { color: colors.success }]}>{label}</Text><Text style={[styles.resultValue, { color: colors.foreground }]}>{value}</Text></View></View>;
}

function SpeakingView({ go, language, onLanguage }: { go: (view: ViewName, data?: number) => void; language: Language; onLanguage: (language: Language) => void }) {
  const colors = useColors();
  const t = getText(language);
  const app = useApp();
  const feature = featureCopy[language];
  const [message, setMessage] = useState('');
  const [level, setLevel] = useState<SpeakingLevel>('beginner');
  const [topic, setTopic] = useState<SpeakingTopic>('introductions');
  const [messages, setMessages] = useState<{ speaker: 'teacher' | 'you'; text: string }[]>([{ speaker: 'teacher', text: openingTeacherMessage('introductions') }]);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState(feature.readyToListen);
  const [lastTranscript, setLastTranscript] = useState('');
  const [feedback, setFeedback] = useState<{ correction: string; explanation: string } | null>(null);
  const [lastTeacherReply, setLastTeacherReply] = useState(openingTeacherMessage('introductions'));

  const completeTurn = async (transcript: string) => {
    const trimmed = transcript.trim();
    if (!trimmed) return;
    setLastTranscript(trimmed);
    const reply = await requestTeacherReply(trimmed, language, level, topic);
    setMessages((current) => [...current, { speaker: 'you', text: trimmed }, { speaker: 'teacher', text: reply }]);
    setLastTeacherReply(reply);
    setFeedback(getSpeakingFeedback(trimmed, language));
    Speech.speak(reply, { language: 'en-US', rate: 0.88 });
    setMessage('');
    app.incrementSpeaking();
    actionHaptic();
  };
  const startListening = () => {
    setIsListening(true);
    setVoiceStatus(feature.listening);
    actionHaptic();
  };
  const stopListening = async () => {
    setIsListening(false);
    setVoiceStatus(feature.readyToListen);
    await completeTurn(message.trim() || feature.demoPhrase);
  };
  const sendMessage = async () => {
    await completeTurn(message);
  };
  const useDemoPhrase = () => setMessage(feature.demoPhrase);
  const clearConversation = () => {
    setMessages([{ speaker: 'teacher', text: openingTeacherMessage(topic) }]);
    setLastTeacherReply(openingTeacherMessage(topic));
    setLastTranscript('');
    setFeedback(null);
    setMessage('');
    setIsListening(false);
    setVoiceStatus(feature.readyToListen);
  };
  const chooseTopic = (nextTopic: SpeakingTopic) => {
    setTopic(nextTopic);
    setMessages([{ speaker: 'teacher', text: openingTeacherMessage(nextTopic) }]);
    setLastTeacherReply(openingTeacherMessage(nextTopic));
    setLastTranscript('');
    setFeedback(null);
  };
  const correctMyEnglish = () => {
    if (lastTranscript) setFeedback(getSpeakingFeedback(lastTranscript, language));
  };
  const repeatAI = () => {
    if (lastTeacherReply) Speech.speak(lastTeacherReply, { language: 'en-US', rate: 0.88 });
  };

  return <View style={[styles.screen, { backgroundColor: colors.background }]}>
    <Header title={t.aiSpeaking} onBack={() => go('practice')} language={language} onLanguage={onLanguage} />
    <KeyboardAvoidingView behavior="padding" style={styles.flex}>
      <ScrollView contentContainerStyle={styles.chatContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.aiIntro, { backgroundColor: colors.mint }]}>
          <View style={[styles.aiAvatar, { backgroundColor: colors.navy }]}><Ionicons name="sparkles" size={20} color={colors.gold} /></View>
          <View style={styles.flex}><Text style={[styles.aiIntroTitle, { color: colors.foreground }]}>{t.teacher}</Text><Text style={[styles.aiIntroHint, { color: colors.mutedForeground }]}>{t.speakingHint}</Text></View>
        </View>
        <Text style={[styles.selectorLabel, { color: colors.foreground }]}>{feature.speakingLevel}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorRow}>
          {speakingLevels.map((item) => <Pressable key={item.id} testID={`speaking-level-${item.id}`} onPress={() => setLevel(item.id)} style={[styles.selectorChip, { backgroundColor: level === item.id ? colors.navy : colors.card, borderColor: level === item.id ? colors.navy : colors.border }]}><Text style={[styles.selectorText, { color: level === item.id ? '#FFFFFF' : colors.foreground }]}>{item.labels[language]}</Text></Pressable>)}
        </ScrollView>
        <Text style={[styles.selectorLabel, { color: colors.foreground }]}>{feature.topic}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorRow}>
          {speakingTopics.map((item) => <Pressable key={item.id} testID={`speaking-topic-${item.id}`} onPress={() => chooseTopic(item.id)} style={[styles.selectorChip, { backgroundColor: topic === item.id ? colors.secondary : colors.card, borderColor: topic === item.id ? colors.primary : colors.border }]}><Text style={[styles.selectorText, { color: topic === item.id ? colors.primary : colors.foreground }]}>{item.labels[language]}</Text></Pressable>)}
        </ScrollView>
        <View style={[styles.voiceStatusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable testID="microphone-button" onPress={isListening ? stopListening : startListening} style={[styles.micButton, { backgroundColor: isListening ? colors.coral : colors.secondary }]}><Ionicons name={isListening ? 'mic-off' : 'mic'} size={28} color={isListening ? '#FFFFFF' : colors.primary} /></Pressable>
          <View style={styles.flex}><Text style={[styles.voiceStatus, { color: colors.foreground }]}>{voiceStatus}</Text><Text style={[styles.voiceMode, { color: colors.mutedForeground }]}>{AI_DEMO_MODE ? feature.demoMode : feature.liveMode}</Text></View>
        </View>
        <View style={styles.voiceActions}>
          <Pressable testID="start-speaking" disabled={isListening} onPress={startListening} style={({ pressed }) => [styles.voiceAction, { backgroundColor: isListening ? colors.muted : colors.primary }, pressed && styles.pressed]}><Ionicons name="mic-outline" size={19} color="#FFFFFF" /><Text style={styles.voiceActionText}>{feature.startPractice}</Text></Pressable>
          <Pressable testID="stop-speaking" disabled={!isListening} onPress={stopListening} style={({ pressed }) => [styles.voiceAction, { backgroundColor: isListening ? colors.navy : colors.muted }, pressed && styles.pressed]}><Ionicons name="stop-circle-outline" size={19} color={isListening ? '#FFFFFF' : colors.mutedForeground} /><Text style={[styles.voiceActionText, { color: isListening ? '#FFFFFF' : colors.mutedForeground }]}>{feature.stopSpeaking}</Text></Pressable>
        </View>
        <View style={styles.conversationControls}>
          <Pressable testID="clear-conversation" onPress={clearConversation} style={[styles.controlButton, { backgroundColor: colors.card, borderColor: colors.border }]}><Ionicons name="refresh-outline" size={16} color={colors.primary} /><Text style={[styles.controlText, { color: colors.foreground }]}>{feature.clearConversation}</Text></Pressable>
          <Pressable testID="repeat-ai-voice" onPress={repeatAI} style={[styles.controlButton, { backgroundColor: colors.card, borderColor: colors.border }]}><Ionicons name="volume-medium-outline" size={16} color={colors.primary} /><Text style={[styles.controlText, { color: colors.foreground }]}>{feature.repeatAI}</Text></Pressable>
        </View>
        <Pressable testID="demo-phrase" onPress={useDemoPhrase} style={styles.demoPhraseButton}><Ionicons name="flask-outline" size={15} color={colors.primary} /><Text style={[styles.demoPhraseText, { color: colors.primary }]}>{feature.tryDemo}</Text></Pressable>
        {messages.map((item, index) => <View key={`${item.speaker}-${index}`} style={[styles.messageRow, item.speaker === 'you' && styles.messageRowYou]}><View style={[styles.messageBubble, { backgroundColor: item.speaker === 'you' ? colors.navy : colors.card, borderColor: colors.border }]}><Text style={[styles.messageSpeaker, { color: item.speaker === 'you' ? colors.gold : colors.primary }]}>{item.speaker === 'you' ? t.you : t.teacher}</Text><Text style={[styles.messageText, { color: item.speaker === 'you' ? '#FFFFFF' : colors.foreground }]}>{item.text}</Text>{item.speaker === 'teacher' && <Pressable onPress={() => Speech.speak(item.text, { language: 'en-US', rate: 0.88 })} style={styles.listenButton}><Ionicons name="volume-medium-outline" size={16} color={colors.primary} /><Text style={[styles.listenText, { color: colors.primary }]}>{t.listen}</Text></Pressable>}</View></View>)}
        {lastTranscript && feedback && <View style={[styles.speakingFeedback, { backgroundColor: colors.accent }]}>
          <View style={styles.rowBetween}><Text style={[styles.feedbackHeading, { color: colors.foreground }]}>{feature.feedback}</Text><Pressable testID="correct-my-english" onPress={correctMyEnglish} style={styles.correctButton}><Ionicons name="sparkles-outline" size={15} color={colors.primary} /><Text style={[styles.correctButtonText, { color: colors.primary }]}>{feature.correctMyEnglish}</Text></Pressable></View>
          <View style={styles.feedbackItem}><Ionicons name="text-outline" size={17} color={colors.accentForeground} /><View style={styles.flex}><Text style={[styles.feedbackLabel, { color: colors.accentForeground }]}>{feature.transcript}</Text><Text style={[styles.feedbackValue, { color: colors.foreground }]}>{lastTranscript}</Text></View></View>
          <View style={styles.feedbackItem}><Ionicons name="checkmark-circle-outline" size={17} color={colors.success} /><View style={styles.flex}><Text style={[styles.feedbackLabel, { color: colors.success }]}>{feature.grammarCorrection}</Text><Text style={[styles.feedbackValue, { color: colors.foreground }]}>{feedback.correction}</Text></View></View>
          <View style={styles.feedbackItem}><Ionicons name="bulb-outline" size={17} color={colors.accentForeground} /><View style={styles.flex}><Text style={[styles.feedbackLabel, { color: colors.accentForeground }]}>{feature.explanation}</Text><Text style={[styles.feedbackValue, { color: colors.foreground }]}>{feedback.explanation}</Text></View></View>
        </View>}
        <View style={[styles.correctionNote, { backgroundColor: colors.accent }]}><Ionicons name="bulb-outline" size={18} color={colors.accentForeground} /><Text style={[styles.correctionText, { color: colors.foreground }]}>{feature.speakAgain}</Text></View>
      </ScrollView>
      <View style={[styles.chatComposer, { backgroundColor: colors.card, borderTopColor: colors.border }]}><TextInput testID="speaking-input" value={message} onChangeText={setMessage} onSubmitEditing={sendMessage} placeholder="Type your answer..." placeholderTextColor={colors.mutedForeground} style={[styles.chatInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} /><Pressable testID="send-speaking" onPress={sendMessage} style={[styles.sendButton, { backgroundColor: colors.primary }]}><Ionicons name="arrow-up" size={21} color="#FFFFFF" /></Pressable></View>
    </KeyboardAvoidingView>
  </View>;
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
  const feature = featureCopy[language];
  const items = [
    { icon: 'document-text-outline' as const, title: t.pdf, detail: 'Level 1 · Lessons 1–5', color: colors.accent, asset: require('../assets/downloads/lesson-1-greetings.pdf'), filename: 'englishmate-lesson-1.pdf', mimeType: 'application/pdf' },
    { icon: 'musical-notes-outline' as const, title: t.audio, detail: 'Greetings & introductions', color: colors.mint, asset: require('../assets/downloads/spoken-english-lesson.mp3'), filename: 'englishmate-spoken-lesson.mp3', mimeType: 'audio/mpeg' },
    { icon: 'document-text-outline' as const, title: t.pdf, detail: 'Level 1 · Lessons 6–10', color: colors.secondary, asset: require('../assets/downloads/lesson-1-greetings.pdf'), filename: 'englishmate-lesson-6-10-sample.pdf', mimeType: 'application/pdf' },
  ];
  return <View style={[styles.screen, { backgroundColor: colors.background }]}>
    <Header title={t.downloadsTitle} language={language} onLanguage={onLanguage} />
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={[styles.downloadHero, { backgroundColor: colors.secondary }]}><Ionicons name="cloud-download-outline" size={30} color={colors.primary} /><Text style={[styles.downloadHeroTitle, { color: colors.foreground }]}>{t.downloadsTitle}</Text><Text style={[styles.downloadHeroHint, { color: colors.mutedForeground }]}>{t.downloadsHint}</Text></View>
      {items.map((item, index) => <View key={`${item.title}-${index}`} style={[styles.downloadRow, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.downloadIcon, { backgroundColor: item.color }]}><Ionicons name={item.icon} size={22} color={colors.foreground} /></View><View style={styles.flex}><Text style={[styles.downloadTitle, { color: colors.foreground }]}>{item.title}</Text><Text style={[styles.downloadDetail, { color: colors.mutedForeground }]}>{item.detail}</Text><Text style={[styles.downloadSample, { color: colors.primary }]}>{t.sample} · {t.ready}</Text></View><Pressable testID={`download-${index}`} onPress={() => { actionHaptic(); void saveAndShareAsset(item.asset, item.filename, item.mimeType, item.title, language); }} style={[styles.downloadButton, { backgroundColor: colors.navy }]}><Ionicons name="download-outline" size={18} color="#FFFFFF" /></Pressable></View>)}
      <View style={[styles.downloadRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.downloadIcon, { backgroundColor: colors.mint }]}><Ionicons name="logo-android" size={22} color={colors.success} /></View>
        <View style={styles.flex}><Text style={[styles.downloadTitle, { color: colors.foreground }]}>{feature.apkDownload}</Text><Text style={[styles.downloadDetail, { color: colors.mutedForeground }]}>{ANDROID_APK_URL ? 'Android installer file' : feature.apkUnavailable}</Text><Text style={[styles.downloadSample, { color: colors.primary }]}>{ANDROID_APK_URL ? 'Ready to download' : feature.apkSetup}</Text></View>
        <Pressable testID="download-android-apk" onPress={() => { actionHaptic(); void downloadAndroidApk(language); }} style={[styles.downloadButton, { backgroundColor: ANDROID_APK_URL ? colors.navy : colors.muted }]}><Ionicons name="download-outline" size={18} color={ANDROID_APK_URL ? '#FFFFFF' : colors.mutedForeground} /></Pressable>
      </View>
      <View style={[styles.offlineNote, { backgroundColor: colors.accent }]}><Ionicons name="information-circle-outline" size={19} color={colors.accentForeground} /><Text style={[styles.offlineNoteText, { color: colors.foreground }]}>{t.saved}</Text></View>
    </ScrollView>
    <BottomNav active="downloads" go={go} language={language} />
  </View>;
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
  lockedRow: { opacity: 0.72 },
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
  exerciseBox: { borderRadius: 14, padding: 12, gap: 4 },
  exerciseLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.7 },
  exerciseText: { fontSize: 13, fontFamily: 'Inter_500Medium', lineHeight: 19 },
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
  voiceStatusCard: { borderWidth: 1, borderRadius: 19, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  micButton: { width: 54, height: 54, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  voiceStatus: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  voiceMode: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 4 },
  voiceActions: { flexDirection: 'row', gap: 10 },
  voiceAction: { flex: 1, minHeight: 49, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 8 },
  voiceActionText: { color: '#FFFFFF', fontSize: 12, fontFamily: 'Inter_700Bold' },
  selectorLabel: { fontSize: 12, fontFamily: 'Inter_700Bold', marginTop: 2 },
  selectorRow: { gap: 8, paddingVertical: 2 },
  selectorChip: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 9 },
  selectorText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  conversationControls: { flexDirection: 'row', gap: 8 },
  controlButton: { flex: 1, minHeight: 42, borderWidth: 1, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 7 },
  controlText: { fontSize: 10, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  demoPhraseButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 3 },
  demoPhraseText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  messageRow: { flexDirection: 'row', justifyContent: 'flex-start' },
  messageRowYou: { justifyContent: 'flex-end' },
  messageBubble: { maxWidth: '82%', borderRadius: 17, borderWidth: 1, padding: 13, gap: 5 },
  messageSpeaker: { fontSize: 10, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.7 },
  messageText: { fontSize: 14, lineHeight: 20, fontFamily: 'Inter_500Medium' },
  listenButton: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', marginTop: 3 },
  listenText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  speakingFeedback: { borderRadius: 16, padding: 14, gap: 11 },
  feedbackHeading: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  correctButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 3, paddingLeft: 7 },
  correctButtonText: { fontSize: 10, fontFamily: 'Inter_700Bold' },
  feedbackItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  feedbackLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.6 },
  feedbackValue: { fontSize: 12, lineHeight: 18, fontFamily: 'Inter_500Medium', marginTop: 2 },
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