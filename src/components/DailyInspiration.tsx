import React, { useState, useEffect } from 'react';
import { Quote, BookOpen, Star, Globe } from 'lucide-react';

const BIBLE_QUOTES_AM = [
  '"ኃይልን በሚሰጠኝ በክርስቶስ ሁሉን እችላለሁ።" - ፊልጵስዩስ 4:13',
  '"እግዚአብሔር የኃይልና የፍቅር ራስንም የመግዛት መንፈስ እንጂ የፍርሃት መንፈስ አልሰጠንምና።" - 2ኛ ጢሞቴዎስ 1:7',
  '"ሥራህን ለእግዚአብሔር አደራ ስጥ፥ አሳብህም ትጸናለች።" - ምሳሌ 16:3',
  '"በሰው ሳይሆን በጌታ እንደምታደርጉት የምታደርጉትን ሁሉ በትጋት አድርጉት።" - ቆላስይስ 3:23',
  '"በእውነት አዝዤሃለሁ፤ ጽና፥ አይዞህ፤ አምላክህ እግዚአብሔር በምትሄድበት ሁሉ ከአንተ ጋር ነውና አትፍራ፥ አትደንግጥ።" - ኢያሱ 1:9',
  '"እግዚአብሔርን ተስፋ የሚያደርጉ ግን ኃይላቸውን ያድሳሉ፤ እንደ ንስር በክንፍ ይወጣሉ፤ ይሮጣሉ፥ አይታክቱም፤ ይሄዳሉ፥ አይደክሙም።" - ኢሳይያስ 40:31',
  '"በፍጹም ልብህ በእግዚአብሔር ታመን፥ በራስህም ማስተዋል አትደገፍ፤ በመንገድህ ሁሉ እርሱን እወቅ፥ እርሱም ጎዳናህን ያቀናልሃል።" - ምሳሌ 3:5-6',
  '"ባንዝልም በጊዜው እናጭዳለንና መልካም ሥራን ለመሥራት አንታክት።" - ገላትያ 6:9',
  '"እኔ ከአንተ ጋር ነኝና አትፍራ፤ እኔ አምላክህ ነኝና አትደንግጥ፤ አበረታሃለሁ፥ እረዳህማለሁ፥ በጽድቄም ቀኝ እደግፍሃለሁ።" - ኢሳይያስ 41:10',
  '"ለእናንተ የማስባትን አሳብ እኔ አውቃለሁ፤ ፍጻሜና ተስፋ እሰጣችሁ ዘንድ የሰላም አሳብ ነው እንጂ የክፉ ነገር አይደለም፥ ይላል እግዚአብሔር።" - ኤርምያስ 29:11'
];

const BIBLE_QUOTES_EN = [
  '"I can do all this through him who gives me strength." - Philippians 4:13',
  '"For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline." - 2 Timothy 1:7',
  '"Commit to the Lord whatever you do, and he will establish your plans." - Proverbs 16:3',
  '"Whatever you do, work at it with all your heart, as working for the Lord, not for human masters." - Colossians 3:23',
  '"Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go." - Joshua 1:9',
  '"But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint." - Isaiah 40:31',
  '"Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight." - Proverbs 3:5-6',
  '"Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up." - Galatians 6:9',
  '"So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand." - Isaiah 41:10',
  '"For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future." - Jeremiah 29:11'
];

const ISLAMIC_QUOTES_EN = [
  '"So verily, with the hardship, there is relief." - Quran 94:5',
  '"Allah does not burden a soul beyond that it can bear." - Quran 2:286',
  '"And He found you lost and guided [you]." - Quran 93:7',
  '"Do not lose hope, nor be sad." - Quran 3:139',
  '"The best of people are those that bring most benefit to the rest of mankind." - Prophet Muhammad (PBUH)',
  '"Richness is not having many belongings, but richness is contentment of the soul." - Prophet Muhammad (PBUH)',
  '"Call upon Me, I will respond to you." - Quran 40:60',
  '"Verily, in the remembrance of Allah do hearts find rest." - Quran 13:28'
];

const ISLAMIC_QUOTES_AM = [
  '"فَإِنَّ مَعَ الْعُسْرِ يُسْرًا"\n(ከችግር ጋር ምቾት አልለና፡፡) - ቁርአን 94:5',
  '"لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا"\n(አላህ ነፍስን ከችሎታዋ በላይ አያስገድዳትም፡፡) - ቁርአን 2:286',
  '"وَوَجَدَكَ ضَالًّا فَهَدَىٰ"\n(ተሳስቶም አገኘህ መራህም፡፡) - ቁርአን 93:7',
  '"وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ"\n(አትስነፉም አትዘኑም፤ እናንተም ምእመናን ብትኾኑ የበላይ ናችሁ፡፡) - ቁርአን 3:139',
  '"خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ"\n(ከሰዎች ሁሉ በላጭ ለሰዎች ጠቃሚ የሆነው ነው።) - ነቢዩ ሙሐመድ (ሰ.ዐ.ወ)',
  '"لَيْسَ الْغِنَى عَنْ كَثْرَةِ الْعَرَضِ، وَلَكِنَّ الْغِنَى غِنَى النَّفْسِ"\n(ሀብት ማለት የንብረት ብዛት አይደለም፤ ነገር ግን እውነተኛ ሀብት የነፍስ መብቃቃት ነው።) - ነቢዩ ሙሐመድ (ሰ.ዐ.ወ)',
  '"وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ"\n(ጌታችሁም አለ፡- ለምኑኝ እቀበላችኋለሁና፡፡) - ቁርአን 40:60',
  '"أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنَّ الْقُلُوبُ"\n(ንቁ! አላህን በማውሳት ልቦች ይረካሉ፡፡) - ቁርአን 13:28'
];

const MOTIVATIONAL_QUOTES_EN = [
  '"The only way to do great work is to love what you do." - Steve Jobs',
  '"Success is not final, failure is not fatal: it is the courage to continue that counts." - Winston Churchill',
  '"Believe you can and you\'re halfway there." - Theodore Roosevelt',
  '"I have not failed. I\'ve just found 10,000 ways that won\'t work." - Thomas A. Edison',
  '"The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt',
  '"You miss 100% of the shots you don\'t take." - Wayne Gretzky',
  '"It does not matter how slowly you go as long as you do not stop." - Confucius',
  '"Everything you\'ve ever wanted is on the other side of fear." - George Addair'
];

type Category = 'christian' | 'islamic' | 'motivational';
type Language = 'am' | 'en';

interface DailyInspirationProps {
  category: Category;
  language: Language;
}

export default function DailyInspiration({ category, language }: DailyInspirationProps) {
  const [quote, setQuote] = useState<string>('');

  useEffect(() => {
    let quotesArray = MOTIVATIONAL_QUOTES_EN;
    
    if (category === 'christian') {
      quotesArray = language === 'am' ? BIBLE_QUOTES_AM : BIBLE_QUOTES_EN;
    } else if (category === 'islamic') {
      quotesArray = language === 'am' ? ISLAMIC_QUOTES_AM : ISLAMIC_QUOTES_EN;
    } else if (category === 'motivational') {
      quotesArray = MOTIVATIONAL_QUOTES_EN; // Motivational is always English in this list
    }

    const randomQuote = quotesArray[Math.floor(Math.random() * quotesArray.length)];
    setQuote(randomQuote);
  }, [category, language]);

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
      <Quote className="w-8 h-8 text-white/10 absolute top-4 left-4" />
      
      <div className="space-y-3 z-10 w-full min-h-[80px] flex flex-col justify-center">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">
          {category === 'christian' && 'Daily Bible Quote'}
          {category === 'islamic' && 'Daily Quran Quote'}
          {category === 'motivational' && 'Daily Motivation'}
        </h3>
        <p className="text-white/90 font-serif italic text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto px-4 transition-all duration-300 whitespace-pre-line">
          {quote}
        </p>
      </div>
    </div>
  );
}
