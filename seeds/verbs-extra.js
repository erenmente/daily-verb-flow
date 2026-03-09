/**
 * Ek fiil verileri — Her seviyeyi 50+ fiile tamamlar
 * Kullanım: node seeds/verbs-extra.js
 */
require('dotenv').config();
const { db } = require('../config/firebase');

const extraVerbs = [
    // =================== A1 EK ===================
    {
        v1: 'sit', v2: 'sat', v3: 'sat', meaning: 'oturmak', level: 'A1', exampleSentences: [
            { en: 'Please sit down.', tr: 'Lütfen oturun.' },
            { en: 'She sat on the bench.', tr: 'Banka oturdu.' },
            { en: 'He has sat there all day.', tr: 'Bütün gün orada oturdu.' }
        ]
    },
    {
        v1: 'stand', v2: 'stood', v3: 'stood', meaning: 'ayakta durmak', level: 'A1', exampleSentences: [
            { en: 'Stand up, please.', tr: 'Lütfen ayağa kalkın.' },
            { en: 'She stood near the door.', tr: 'Kapının yanında durdu.' },
            { en: 'I have stood here for an hour.', tr: 'Bir saattir burada duruyorum.' }
        ]
    },
    {
        v1: 'sleep', v2: 'slept', v3: 'slept', meaning: 'uyumak', level: 'A1', exampleSentences: [
            { en: 'I sleep eight hours a night.', tr: 'Gecede sekiz saat uyurum.' },
            { en: 'The baby slept all night.', tr: 'Bebek bütün gece uyudu.' },
            { en: 'Have you slept well?', tr: 'İyi uyudun mu?' }
        ]
    },
    {
        v1: 'get', v2: 'got', v3: 'got', meaning: 'almak, elde etmek', level: 'A1', exampleSentences: [
            { en: 'I get up at 7 AM.', tr: 'Sabah 7\'de kalkarım.' },
            { en: 'She got a new phone.', tr: 'Yeni bir telefon aldı.' },
            { en: 'He has got a cold.', tr: 'Soğuk aldı.' }
        ]
    },
    {
        v1: 'say', v2: 'said', v3: 'said', meaning: 'söylemek, demek', level: 'A1', exampleSentences: [
            { en: 'What did you say?', tr: 'Ne dedin?' },
            { en: 'She said hello.', tr: 'Merhaba dedi.' },
            { en: 'Nothing has been said yet.', tr: 'Henüz bir şey söylenmedi.' }
        ]
    },
    {
        v1: 'put', v2: 'put', v3: 'put', meaning: 'koymak', level: 'A1', exampleSentences: [
            { en: 'Put the book on the table.', tr: 'Kitabı masaya koy.' },
            { en: 'I put my keys in my bag.', tr: 'Anahtarlarımı çantama koydum.' },
            { en: 'The toys have been put away.', tr: 'Oyuncaklar kaldırıldı.' }
        ]
    },
    {
        v1: 'cut', v2: 'cut', v3: 'cut', meaning: 'kesmek', level: 'A1', exampleSentences: [
            { en: 'Cut the paper in half.', tr: 'Kağıdı ikiye kes.' },
            { en: 'He cut his finger.', tr: 'Parmağını kesti.' },
            { en: 'The cake has been cut.', tr: 'Pasta kesildi.' }
        ]
    },
    {
        v1: 'let', v2: 'let', v3: 'let', meaning: 'izin vermek', level: 'A1', exampleSentences: [
            { en: 'Let me help you.', tr: 'Sana yardım edeyim.' },
            { en: 'She let him go.', tr: 'Gitmesine izin verdi.' },
            { en: 'They haven\'t let us in.', tr: 'Bizi içeri almadılar.' }
        ]
    },
    {
        v1: 'hear', v2: 'heard', v3: 'heard', meaning: 'duymak', level: 'A1', exampleSentences: [
            { en: 'Can you hear me?', tr: 'Beni duyabiliyor musun?' },
            { en: 'I heard a strange noise.', tr: 'Garip bir ses duydum.' },
            { en: 'Have you heard the news?', tr: 'Haberleri duydun mu?' }
        ]
    },
    {
        v1: 'bring', v2: 'brought', v3: 'brought', meaning: 'getirmek', level: 'A1', exampleSentences: [
            { en: 'Bring me some water.', tr: 'Bana biraz su getir.' },
            { en: 'She brought flowers.', tr: 'Çiçek getirdi.' },
            { en: 'He has brought his laptop.', tr: 'Laptopunu getirdi.' }
        ]
    },
    {
        v1: 'meet', v2: 'met', v3: 'met', meaning: 'tanışmak, buluşmak', level: 'A1', exampleSentences: [
            { en: 'Nice to meet you.', tr: 'Tanıştığımıza memnun oldum.' },
            { en: 'We met at a party.', tr: 'Bir partide tanıştık.' },
            { en: 'I have met her before.', tr: 'Onunla daha önce tanıştım.' }
        ]
    },
    {
        v1: 'feel', v2: 'felt', v3: 'felt', meaning: 'hissetmek', level: 'A1', exampleSentences: [
            { en: 'I feel happy today.', tr: 'Bugün mutlu hissediyorum.' },
            { en: 'She felt tired after work.', tr: 'İşten sonra yorgun hissetti.' },
            { en: 'I have never felt so excited.', tr: 'Hiç bu kadar heyecanlı olmamıştım.' }
        ]
    },
    {
        v1: 'win', v2: 'won', v3: 'won', meaning: 'kazanmak', level: 'A1', exampleSentences: [
            { en: 'I want to win the game.', tr: 'Oyunu kazanmak istiyorum.' },
            { en: 'She won the race.', tr: 'Yarışı kazandı.' },
            { en: 'Our team has won the cup.', tr: 'Takımımız kupayı kazandı.' }
        ]
    },
    {
        v1: 'lose', v2: 'lost', v3: 'lost', meaning: 'kaybetmek', level: 'A1', exampleSentences: [
            { en: 'Don\'t lose your ticket.', tr: 'Biletini kaybetme.' },
            { en: 'I lost my wallet.', tr: 'Cüzdanımı kaybettim.' },
            { en: 'She has lost her way.', tr: 'Yolunu kaybetti.' }
        ]
    },
    {
        v1: 'pay', v2: 'paid', v3: 'paid', meaning: 'ödemek', level: 'A1', exampleSentences: [
            { en: 'I pay my bills online.', tr: 'Faturalarımı online öderim.' },
            { en: 'He paid for the dinner.', tr: 'Akşam yemeğini ödedi.' },
            { en: 'The rent has been paid.', tr: 'Kira ödendi.' }
        ]
    },
    {
        v1: 'catch', v2: 'caught', v3: 'caught', meaning: 'yakalamak', level: 'A1', exampleSentences: [
            { en: 'Catch the ball!', tr: 'Topu yakala!' },
            { en: 'The police caught the thief.', tr: 'Polis hırsızı yakaladı.' },
            { en: 'I have caught a cold.', tr: 'Soğuk aldım.' }
        ]
    },
    {
        v1: 'hold', v2: 'held', v3: 'held', meaning: 'tutmak', level: 'A1', exampleSentences: [
            { en: 'Hold my hand.', tr: 'Elimi tut.' },
            { en: 'She held the door open.', tr: 'Kapıyı açık tuttu.' },
            { en: 'The meeting has been held.', tr: 'Toplantı yapıldı.' }
        ]
    },
    {
        v1: 'build', v2: 'built', v3: 'built', meaning: 'inşa etmek', level: 'A1', exampleSentences: [
            { en: 'They build houses.', tr: 'Evler inşa ederler.' },
            { en: 'He built a sandcastle.', tr: 'Kumdan kale yaptı.' },
            { en: 'The bridge has been built.', tr: 'Köprü inşa edildi.' }
        ]
    },

    // =================== A2 EK ===================
    {
        v1: 'sing', v2: 'sang', v3: 'sung', meaning: 'şarkı söylemek', level: 'A2', exampleSentences: [
            { en: 'She sings beautifully.', tr: 'Güzel şarkı söyler.' },
            { en: 'We sang happy birthday.', tr: 'Doğum günü şarkısı söyledik.' },
            { en: 'That song has been sung many times.', tr: 'O şarkı çok kez söylendi.' }
        ]
    },
    {
        v1: 'drive', v2: 'drove', v3: 'driven', meaning: 'sürmek, araba kullanmak', level: 'A2', exampleSentences: [
            { en: 'I drive to work every day.', tr: 'Her gün işe arabayla giderim.' },
            { en: 'She drove us to the airport.', tr: 'Bizi havalimanına bıraktı.' },
            { en: 'He has driven for 10 hours.', tr: '10 saattir araba kullanıyor.' }
        ]
    },
    {
        v1: 'fly', v2: 'flew', v3: 'flown', meaning: 'uçmak', level: 'A2', exampleSentences: [
            { en: 'Birds fly in the sky.', tr: 'Kuşlar gökyüzünde uçar.' },
            { en: 'We flew to Istanbul.', tr: 'İstanbul\'a uçtuk.' },
            { en: 'I have never flown first class.', tr: 'Hiç birinci sınıf uçmadım.' }
        ]
    },
    {
        v1: 'swim', v2: 'swam', v3: 'swum', meaning: 'yüzmek', level: 'A2', exampleSentences: [
            { en: 'She swims every morning.', tr: 'Her sabah yüzer.' },
            { en: 'We swam in the sea.', tr: 'Denizde yüzdük.' },
            { en: 'I have swum in this pool before.', tr: 'Daha önce bu havuzda yüzdüm.' }
        ]
    },
    {
        v1: 'draw', v2: 'drew', v3: 'drawn', meaning: 'çizmek', level: 'A2', exampleSentences: [
            { en: 'She draws beautiful pictures.', tr: 'Güzel resimler çizer.' },
            { en: 'I drew a map of the city.', tr: 'Şehrin haritasını çizdim.' },
            { en: 'The plan has been drawn up.', tr: 'Plan hazırlandı.' }
        ]
    },
    {
        v1: 'send', v2: 'sent', v3: 'sent', meaning: 'göndermek', level: 'A2', exampleSentences: [
            { en: 'I send emails every day.', tr: 'Her gün e-posta gönderirim.' },
            { en: 'She sent me a message.', tr: 'Bana bir mesaj gönderdi.' },
            { en: 'The package has been sent.', tr: 'Paket gönderildi.' }
        ]
    },
    {
        v1: 'forget', v2: 'forgot', v3: 'forgotten', meaning: 'unutmak', level: 'A2', exampleSentences: [
            { en: 'Don\'t forget your keys.', tr: 'Anahtarlarını unutma.' },
            { en: 'I forgot her name.', tr: 'Adını unuttum.' },
            { en: 'She has forgotten the password.', tr: 'Şifreyi unuttu.' }
        ]
    },
    {
        v1: 'understand', v2: 'understood', v3: 'understood', meaning: 'anlamak', level: 'A2', exampleSentences: [
            { en: 'I understand the question.', tr: 'Soruyu anlıyorum.' },
            { en: 'She understood the instructions.', tr: 'Talimatları anladı.' },
            { en: 'The message has been understood.', tr: 'Mesaj anlaşıldı.' }
        ]
    },
    {
        v1: 'sell', v2: 'sold', v3: 'sold', meaning: 'satmak', level: 'A2', exampleSentences: [
            { en: 'They sell fresh fruit here.', tr: 'Burada taze meyve satarlar.' },
            { en: 'He sold his old car.', tr: 'Eski arabasını sattı.' },
            { en: 'All tickets have been sold.', tr: 'Bütün biletler satıldı.' }
        ]
    },
    {
        v1: 'wake', v2: 'woke', v3: 'woken', meaning: 'uyanmak', level: 'A2', exampleSentences: [
            { en: 'I wake up at 6 AM.', tr: 'Sabah 6\'da uyanırım.' },
            { en: 'She woke up late today.', tr: 'Bugün geç uyandı.' },
            { en: 'The children have woken up.', tr: 'Çocuklar uyandı.' }
        ]
    },
    {
        v1: 'show', v2: 'showed', v3: 'shown', meaning: 'göstermek', level: 'A2', exampleSentences: [
            { en: 'Show me your ticket, please.', tr: 'Biletinizi gösterin, lütfen.' },
            { en: 'She showed us her new house.', tr: 'Bize yeni evini gösterdi.' },
            { en: 'The results have been shown.', tr: 'Sonuçlar gösterildi.' }
        ]
    },
    {
        v1: 'bite', v2: 'bit', v3: 'bitten', meaning: 'ısırmak', level: 'A2', exampleSentences: [
            { en: 'Dogs sometimes bite.', tr: 'Köpekler bazen ısırır.' },
            { en: 'A mosquito bit me.', tr: 'Bir sivrisinek beni ısırdı.' },
            { en: 'He has been bitten by a snake.', tr: 'Yılan tarafından ısırıldı.' }
        ]
    },
    {
        v1: 'hide', v2: 'hid', v3: 'hidden', meaning: 'saklamak, gizlenmek', level: 'A2', exampleSentences: [
            { en: 'Where did you hide it?', tr: 'Onu nereye sakladın?' },
            { en: 'The cat hid under the bed.', tr: 'Kedi yatağın altına gizlendi.' },
            { en: 'The treasure has been hidden.', tr: 'Hazine saklandı.' }
        ]
    },
    {
        v1: 'shake', v2: 'shook', v3: 'shaken', meaning: 'sallamak', level: 'A2', exampleSentences: [
            { en: 'Shake the bottle before use.', tr: 'Kullanmadan önce şişeyi çalkalayın.' },
            { en: 'He shook my hand firmly.', tr: 'Elimi sıkıca sıktı.' },
            { en: 'I was shaken by the news.', tr: 'Haberden sarsıldım.' }
        ]
    },
    {
        v1: 'hang', v2: 'hung', v3: 'hung', meaning: 'asmak', level: 'A2', exampleSentences: [
            { en: 'Hang your coat here.', tr: 'Montunu buraya as.' },
            { en: 'She hung the picture on the wall.', tr: 'Resmi duvara astı.' },
            { en: 'The clothes have been hung to dry.', tr: 'Çamaşırlar kuruması için asıldı.' }
        ]
    },
    {
        v1: 'blow', v2: 'blew', v3: 'blown', meaning: 'üflemek, esmek', level: 'A2', exampleSentences: [
            { en: 'The wind blows strongly today.', tr: 'Bugün rüzgar kuvvetli esiyor.' },
            { en: 'She blew out the candles.', tr: 'Mumları üfledi.' },
            { en: 'The roof has been blown off.', tr: 'Çatı uçtu.' }
        ]
    },
    {
        v1: 'lend', v2: 'lent', v3: 'lent', meaning: 'ödünç vermek', level: 'A2', exampleSentences: [
            { en: 'Can you lend me your pen?', tr: 'Kalemini ödünç verir misin?' },
            { en: 'She lent me some money.', tr: 'Bana biraz para ödünç verdi.' },
            { en: 'The book has been lent out.', tr: 'Kitap ödünç verildi.' }
        ]
    },
    {
        v1: 'set', v2: 'set', v3: 'set', meaning: 'ayarlamak, kurmak', level: 'A2', exampleSentences: [
            { en: 'Set the alarm for 7 AM.', tr: 'Alarmı 7\'ye kur.' },
            { en: 'She set the table for dinner.', tr: 'Akşam yemeği için sofra kurdu.' },
            { en: 'The date has been set.', tr: 'Tarih belirlendi.' }
        ]
    },

    // =================== B1 EK ===================
    {
        v1: 'mean', v2: 'meant', v3: 'meant', meaning: 'anlamına gelmek, kastetmek', level: 'B1', exampleSentences: [
            { en: 'What does this word mean?', tr: 'Bu kelimenin anlamı ne?' },
            { en: 'I didn\'t mean to hurt you.', tr: 'Seni incitmek istemedim.' },
            { en: 'It was meant to be a surprise.', tr: 'Sürpriz olması gerekiyordu.' }
        ]
    },
    {
        v1: 'bend', v2: 'bent', v3: 'bent', meaning: 'eğilmek, bükmek', level: 'B1', exampleSentences: [
            { en: 'Don\'t bend the card.', tr: 'Kartı bükme.' },
            { en: 'She bent down to pick it up.', tr: 'Almak için eğildi.' },
            { en: 'The metal has been bent.', tr: 'Metal büküldü.' }
        ]
    },
    {
        v1: 'dig', v2: 'dug', v3: 'dug', meaning: 'kazmak', level: 'B1', exampleSentences: [
            { en: 'The workers dig a hole.', tr: 'İşçiler bir çukur kazıyor.' },
            { en: 'He dug a well in the garden.', tr: 'Bahçede kuyu kazdı.' },
            { en: 'A tunnel has been dug.', tr: 'Bir tünel kazıldı.' }
        ]
    },
    {
        v1: 'shoot', v2: 'shot', v3: 'shot', meaning: 'ateş etmek, çekmek', level: 'B1', exampleSentences: [
            { en: 'He shoots the ball toward the goal.', tr: 'Topu kaleye doğru atar.' },
            { en: 'She shot the photo at sunset.', tr: 'Fotoğrafı gün batımında çekti.' },
            { en: 'The movie has been shot in Turkey.', tr: 'Film Türkiye\'de çekildi.' }
        ]
    },
    {
        v1: 'deal', v2: 'dealt', v3: 'dealt', meaning: 'ilgilenmek, dağıtmak', level: 'B1', exampleSentences: [
            { en: 'I deal with customers daily.', tr: 'Her gün müşterilerle ilgilenirim.' },
            { en: 'She dealt with the problem quickly.', tr: 'Sorunu hızlıca çözdü.' },
            { en: 'The cards have been dealt.', tr: 'Kartlar dağıtıldı.' }
        ]
    },
    {
        v1: 'freeze', v2: 'froze', v3: 'frozen', meaning: 'donmak, dondurmak', level: 'B1', exampleSentences: [
            { en: 'Water freezes at 0 degrees.', tr: 'Su 0 derecede donar.' },
            { en: 'The lake froze completely.', tr: 'Göl tamamen dondu.' },
            { en: 'The food has been frozen.', tr: 'Yiyecek donduruldu.' }
        ]
    },
    {
        v1: 'spread', v2: 'spread', v3: 'spread', meaning: 'yaymak, yayılmak', level: 'B1', exampleSentences: [
            { en: 'Spread the butter on the bread.', tr: 'Ekmeğe tereyağı sür.' },
            { en: 'The news spread quickly.', tr: 'Haber hızla yayıldı.' },
            { en: 'The virus has spread worldwide.', tr: 'Virüs dünya çapında yayıldı.' }
        ]
    },
    {
        v1: 'swing', v2: 'swung', v3: 'swung', meaning: 'sallanmak, sallamak', level: 'B1', exampleSentences: [
            { en: 'Children swing in the park.', tr: 'Çocuklar parkta sallanır.' },
            { en: 'She swung the door open.', tr: 'Kapıyı açıverdi.' },
            { en: 'The gate has swung shut.', tr: 'Kapı kapandı.' }
        ]
    },
    {
        v1: 'stick', v2: 'stuck', v3: 'stuck', meaning: 'yapıştırmak, batırmak', level: 'B1', exampleSentences: [
            { en: 'Stick the stamp on the envelope.', tr: 'Pulu zarfın üstüne yapıştır.' },
            { en: 'The car got stuck in the mud.', tr: 'Araba çamura saplandı.' },
            { en: 'The poster has been stuck on the wall.', tr: 'Poster duvara yapıştırıldı.' }
        ]
    },
    {
        v1: 'slide', v2: 'slid', v3: 'slid', meaning: 'kaymak, kaydırmak', level: 'B1', exampleSentences: [
            { en: 'Children slide down the slope.', tr: 'Çocuklar bayırdan kayar.' },
            { en: 'She slid the book across the table.', tr: 'Kitabı masanın üstünde kaydırdı.' },
            { en: 'The door has slid open.', tr: 'Kapı sürgülenerek açıldı.' }
        ]
    },
    {
        v1: 'shine', v2: 'shone', v3: 'shone', meaning: 'parlamak', level: 'B1', exampleSentences: [
            { en: 'The sun shines brightly.', tr: 'Güneş parlıyor.' },
            { en: 'The light shone through the window.', tr: 'Işık pencereden içeri girdi.' },
            { en: 'The stars have shone all night.', tr: 'Yıldızlar bütün gece parladı.' }
        ]
    },
    {
        v1: 'tear', v2: 'tore', v3: 'torn', meaning: 'yırtmak', level: 'B1', exampleSentences: [
            { en: 'Be careful not to tear the paper.', tr: 'Kağıdı yırtmamaya dikkat et.' },
            { en: 'She tore the letter into pieces.', tr: 'Mektubu parçalara ayırdı.' },
            { en: 'His shirt has been torn.', tr: 'Gömleği yırtıldı.' }
        ]
    },
    {
        v1: 'hurt', v2: 'hurt', v3: 'hurt', meaning: 'incitmek, acımak', level: 'B1', exampleSentences: [
            { en: 'Does it hurt?', tr: 'Acıyor mu?' },
            { en: 'His words hurt her deeply.', tr: 'Sözleri onu derinden incitti.' },
            { en: 'Nobody has been hurt.', tr: 'Kimse zarar görmedi.' }
        ]
    },
    {
        v1: 'shut', v2: 'shut', v3: 'shut', meaning: 'kapatmak', level: 'B1', exampleSentences: [
            { en: 'Shut the door, please.', tr: 'Kapıyı kapat, lütfen.' },
            { en: 'She shut her eyes.', tr: 'Gözlerini kapattı.' },
            { en: 'The shop has been shut.', tr: 'Dükkan kapatıldı.' }
        ]
    },
    {
        v1: 'lay', v2: 'laid', v3: 'laid', meaning: 'koymak, sermek, yumurtlamak', level: 'B1', exampleSentences: [
            { en: 'She lays the baby on the bed.', tr: 'Bebeği yatağa yatırır.' },
            { en: 'He laid the foundation of the house.', tr: 'Evin temelini attı.' },
            { en: 'The table has been laid for dinner.', tr: 'Sofra akşam yemeği için kuruldu.' }
        ]
    },
    {
        v1: 'feed', v2: 'fed', v3: 'fed', meaning: 'beslemek', level: 'B1', exampleSentences: [
            { en: 'I feed my cat twice a day.', tr: 'Kedimi günde iki kez beslerim.' },
            { en: 'She fed the birds in the park.', tr: 'Parktaki kuşları besledi.' },
            { en: 'The baby has been fed.', tr: 'Bebek beslendi.' }
        ]
    },

    // =================== B2 EK ===================
    {
        v1: 'weave', v2: 'wove', v3: 'woven', meaning: 'dokumak', level: 'B2', exampleSentences: [
            { en: 'They weave beautiful carpets.', tr: 'Güzel halılar dokurlar.' },
            { en: 'She wove a basket from bamboo.', tr: 'Bambudan bir sepet dokudu.' },
            { en: 'The fabric has been woven by hand.', tr: 'Kumaş elle dokundu.' }
        ]
    },
    {
        v1: 'mislead', v2: 'misled', v3: 'misled', meaning: 'yanıltmak, yanlış yönlendirmek', level: 'B2', exampleSentences: [
            { en: 'Don\'t mislead the public.', tr: 'Halkı yanıltma.' },
            { en: 'The data misled the researchers.', tr: 'Veriler araştırmacıları yanılttı.' },
            { en: 'We have been misled.', tr: 'Yanıltıldık.' }
        ]
    },
    {
        v1: 'overthrow', v2: 'overthrew', v3: 'overthrown', meaning: 'devirmek', level: 'B2', exampleSentences: [
            { en: 'The people want to overthrow the dictator.', tr: 'Halk diktatörü devirmek istiyor.' },
            { en: 'They overthrew the government.', tr: 'Hükümeti devirdiler.' },
            { en: 'The regime has been overthrown.', tr: 'Rejim devrildi.' }
        ]
    },
    {
        v1: 'foresee', v2: 'foresaw', v3: 'foreseen', meaning: 'önceden görmek', level: 'B2', exampleSentences: [
            { en: 'No one can foresee the future.', tr: 'Kimse geleceği önceden göremez.' },
            { en: 'She foresaw the crisis.', tr: 'Krizi önceden gördü.' },
            { en: 'This problem could have been foreseen.', tr: 'Bu sorun önceden tahmin edilebilirdi.' }
        ]
    },
    {
        v1: 'cling', v2: 'clung', v3: 'clung', meaning: 'sarılmak, yapışmak', level: 'B2', exampleSentences: [
            { en: 'The child clings to her mother.', tr: 'Çocuk annesine sarılıyor.' },
            { en: 'She clung to the rope tightly.', tr: 'İpe sıkıca tutundu.' },
            { en: 'He has clung to his beliefs.', tr: 'İnançlarına bağlı kaldı.' }
        ]
    },
    {
        v1: 'creep', v2: 'crept', v3: 'crept', meaning: 'süzülmek, sürünmek', level: 'B2', exampleSentences: [
            { en: 'The cat creeps toward the mouse.', tr: 'Kedi fareye doğru süzülüyor.' },
            { en: 'He crept into the room quietly.', tr: 'Sessizce odaya süzüldü.' },
            { en: 'Doubt has crept into my mind.', tr: 'Aklıma şüphe girdi.' }
        ]
    },
    {
        v1: 'grind', v2: 'ground', v3: 'ground', meaning: 'öğütmek, ezmek', level: 'B2', exampleSentences: [
            { en: 'She grinds coffee beans every morning.', tr: 'Her sabah kahve çekirdeklerini öğütür.' },
            { en: 'He ground the spices.', tr: 'Baharatları ezdi.' },
            { en: 'The wheat has been ground into flour.', tr: 'Buğday una öğütüldü.' }
        ]
    },
    {
        v1: 'kneel', v2: 'knelt', v3: 'knelt', meaning: 'diz çökmek', level: 'B2', exampleSentences: [
            { en: 'She kneels to pray.', tr: 'Dua etmek için diz çöker.' },
            { en: 'He knelt before the king.', tr: 'Kralın önünde diz çöktü.' },
            { en: 'They have knelt in silence.', tr: 'Sessizce diz çöktüler.' }
        ]
    },
    {
        v1: 'lean', v2: 'leant', v3: 'leant', meaning: 'yaslanmak, eğilmek', level: 'B2', exampleSentences: [
            { en: 'She leans against the wall.', tr: 'Duvara yaslanıyor.' },
            { en: 'He leant forward to listen.', tr: 'Dinlemek için öne eğildi.' },
            { en: 'The tower has leant over time.', tr: 'Kule zamanla eğildi.' }
        ]
    },
    {
        v1: 'spell', v2: 'spelt', v3: 'spelt', meaning: 'harflerini söylemek, hecelemek', level: 'B2', exampleSentences: [
            { en: 'How do you spell your name?', tr: 'İsminizi nasıl yazarsınız?' },
            { en: 'She spelt the word incorrectly.', tr: 'Kelimeyi yanlış yazdı.' },
            { en: 'It has been spelt differently.', tr: 'Farklı yazılmış.' }
        ]
    },
    {
        v1: 'sting', v2: 'stung', v3: 'stung', meaning: 'sokmak (arı)', level: 'B2', exampleSentences: [
            { en: 'Bees sting when threatened.', tr: 'Arılar tehdit edildiğinde sokar.' },
            { en: 'The jellyfish stung my leg.', tr: 'Denizanası bacağımı soktu.' },
            { en: 'I have been stung by a wasp.', tr: 'Bir yaban arısı tarafından sokuldum.' }
        ]
    },
    {
        v1: 'weep', v2: 'wept', v3: 'wept', meaning: 'ağlamak', level: 'B2', exampleSentences: [
            { en: 'She weeps whenever she watches that film.', tr: 'O filmi izlediğinde ağlar.' },
            { en: 'He wept with joy.', tr: 'Sevinçten ağladı.' },
            { en: 'They have wept for the loss.', tr: 'Kayıp için ağladılar.' }
        ]
    },
    {
        v1: 'flee', v2: 'fled', v3: 'fled', meaning: 'kaçmak', level: 'B2', exampleSentences: [
            { en: 'They must flee the country.', tr: 'Ülkeden kaçmalılar.' },
            { en: 'The refugees fled the war zone.', tr: 'Mülteciler savaş bölgesinden kaçtı.' },
            { en: 'The suspect has fled the scene.', tr: 'Şüpheli olay yerinden kaçtı.' }
        ]
    },
    {
        v1: 'sow', v2: 'sowed', v3: 'sown', meaning: 'ekmek (tohum)', level: 'B2', exampleSentences: [
            { en: 'Farmers sow seeds in spring.', tr: 'Çiftçiler ilkbaharda tohum eker.' },
            { en: 'She sowed the garden with flowers.', tr: 'Bahçeye çiçek ekti.' },
            { en: 'The seeds have been sown.', tr: 'Tohumlar ekildi.' }
        ]
    },
    {
        v1: 'leap', v2: 'leapt', v3: 'leapt', meaning: 'sıçramak, atlamak', level: 'B2', exampleSentences: [
            { en: 'The cat leaps from tree to tree.', tr: 'Kedi ağaçtan ağaca sıçrar.' },
            { en: 'She leapt over the fence.', tr: 'Çitin üzerinden atladı.' },
            { en: 'Technology has leapt forward.', tr: 'Teknoloji ileri sıçradı.' }
        ]
    },

    // =================== C1 EK ===================
    {
        v1: 'beset', v2: 'beset', v3: 'beset', meaning: 'kuşatmak, sarmak', level: 'C1', exampleSentences: [
            { en: 'The project is beset by problems.', tr: 'Proje sorunlarla kuşatılmış.' },
            { en: 'Doubts beset the committee.', tr: 'Şüpheler komiteyi sardı.' },
            { en: 'The town has been beset by floods.', tr: 'Kasaba sellerle kuşatıldı.' }
        ]
    },
    {
        v1: 'bereave', v2: 'bereft', v3: 'bereft', meaning: 'yoksun bırakmak', level: 'C1', exampleSentences: [
            { en: 'War bereaves families of their loved ones.', tr: 'Savaş aileleri sevdiklerinden yoksun bırakır.' },
            { en: 'She was bereft of hope.', tr: 'Umuttan yoksun kaldı.' },
            { en: 'He has been bereft of his rights.', tr: 'Haklarından yoksun bırakıldı.' }
        ]
    },
    {
        v1: 'behold', v2: 'beheld', v3: 'beheld', meaning: 'seyretmek, görmek', level: 'C1', exampleSentences: [
            { en: 'Behold the beauty of nature.', tr: 'Doğanın güzelliğine bak.' },
            { en: 'She beheld the magnificent sunset.', tr: 'Muhteşem gün batımını seyretti.' },
            { en: 'Such a sight has never been beheld.', tr: 'Böyle bir manzara hiç görülmemiş.' }
        ]
    },
    {
        v1: 'smelt', v2: 'smelted', v3: 'smelted', meaning: 'eritmek (maden)', level: 'C1', exampleSentences: [
            { en: 'They smelt iron in the factory.', tr: 'Fabrikada demir eritirler.' },
            { en: 'The gold was smelted and purified.', tr: 'Altın eritildi ve saflaştırıldı.' },
            { en: 'The ore has been smelted.', tr: 'Cevher eritildi.' }
        ]
    },
    {
        v1: 'rend', v2: 'rent', v3: 'rent', meaning: 'yırtmak, parçalamak', level: 'C1', exampleSentences: [
            { en: 'The thunder rends the silence.', tr: 'Gök gürültüsü sessizliği yarar.' },
            { en: 'A scream rent the air.', tr: 'Bir çığlık havayı yardı.' },
            { en: 'The curtain has been rent in two.', tr: 'Perde ikiye yırtıldı.' }
        ]
    },
    {
        v1: 'thrive', v2: 'throve', v3: 'thriven', meaning: 'gelişmek, serpilmek', level: 'C1', exampleSentences: [
            { en: 'Businesses thrive in stable economies.', tr: 'İşletmeler istikrarlı ekonomilerde gelişir.' },
            { en: 'The garden throve in the summer rain.', tr: 'Bahçe yaz yağmurunda serpildi.' },
            { en: 'The community has thriven remarkably.', tr: 'Topluluk olağanüstü gelişti.' }
        ]
    },
    {
        v1: 'wreak', v2: 'wreaked', v3: 'wreaked', meaning: 'yaratmak (hasar), salmak', level: 'C1', exampleSentences: [
            { en: 'The storm will wreak havoc.', tr: 'Fırtına büyük tahribat yaratacak.' },
            { en: 'The earthquake wreaked destruction.', tr: 'Deprem yıkım yarattı.' },
            { en: 'Chaos has been wreaked upon the city.', tr: 'Şehre kaos salındı.' }
        ]
    },
    {
        v1: 'smite', v2: 'smote', v3: 'smitten', meaning: 'vurmak, çarpmak', level: 'C1', exampleSentences: [
            { en: 'The plague smites the village.', tr: 'Veba köyü vuruyor.' },
            { en: 'He smote the table in anger.', tr: 'Öfkeyle masaya vurdu.' },
            { en: 'She was smitten with guilt.', tr: 'Suçlulukla doluydu.' }
        ]
    },
    {
        v1: 'betake', v2: 'betook', v3: 'betaken', meaning: 'yönelmek (kendini)', level: 'C1', exampleSentences: [
            { en: 'He betakes himself to prayer.', tr: 'Duaya yönelir.' },
            { en: 'She betook herself to the countryside.', tr: 'Kırsala yöneldi.' },
            { en: 'They have betaken themselves to safety.', tr: 'Güvenliğe sığındılar.' }
        ]
    },
    {
        v1: 'foretell', v2: 'foretold', v3: 'foretold', meaning: 'önceden haber vermek', level: 'C1', exampleSentences: [
            { en: 'The oracle foretells the future.', tr: 'Kahin geleceği haber verir.' },
            { en: 'He foretold the economic crash.', tr: 'Ekonomik çöküşü önceden haber verdi.' },
            { en: 'As it has been foretold.', tr: 'Önceden haber verildiği gibi.' }
        ]
    },
    {
        v1: 'outdo', v2: 'outdid', v3: 'outdone', meaning: 'geçmek, üstün gelmek', level: 'C1', exampleSentences: [
            { en: 'She always tries to outdo her rivals.', tr: 'Her zaman rakiplerini geçmeye çalışır.' },
            { en: 'He outdid himself this time.', tr: 'Bu sefer kendini aştı.' },
            { en: 'The result has outdone all expectations.', tr: 'Sonuç tüm beklentileri aştı.' }
        ]
    },
    {
        v1: 'uphold', v2: 'upheld', v3: 'upheld', meaning: 'desteklemek, onaylamak', level: 'C1', exampleSentences: [
            { en: 'The court upholds justice.', tr: 'Mahkeme adaleti sağlar.' },
            { en: 'The judge upheld the verdict.', tr: 'Hakim kararı onayladı.' },
            { en: 'The law has been upheld.', tr: 'Yasa uygulandı.' }
        ]
    },
];

async function seedExtraVerbs() {
    if (!db) {
        console.error('❌ Firebase yapılandırılmamış. .env dosyasını kontrol edin.');
        process.exit(1);
    }

    console.log('🌱 Ek fiil verileri yükleniyor...\n');

    // Firestore batch max 500 doc, divide
    const batchSize = 400;
    for (let i = 0; i < extraVerbs.length; i += batchSize) {
        const batch = db.batch();
        const chunk = extraVerbs.slice(i, i + batchSize);
        const vocabRef = db.collection('vocabulary');

        for (const verb of chunk) {
            const docRef = vocabRef.doc();
            batch.set(docRef, { ...verb, createdAt: new Date() });
        }

        await batch.commit();
        console.log(`  ✅ ${Math.min(i + batchSize, extraVerbs.length)}/${extraVerbs.length} yüklendi`);
    }

    console.log(`\n✅ Toplam ${extraVerbs.length} ek fiil yüklendi!`);
    console.log('\nSeviye dağılımı:');
    const levels = {};
    extraVerbs.forEach((v) => { levels[v.level] = (levels[v.level] || 0) + 1; });
    Object.entries(levels).forEach(([level, count]) => {
        console.log(`  ${level}: ${count} fiil`);
    });

    process.exit(0);
}

seedExtraVerbs().catch((err) => {
    console.error('Seed hatası:', err);
    process.exit(1);
});
