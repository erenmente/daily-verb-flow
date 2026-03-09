/**
 * Firestore'a başlangıç fiil verisi yükler
 * Kullanım: node seeds/verbs.js
 */
require('dotenv').config();
const { db } = require('../config/firebase');

const verbs = [
    // =================== A1 ===================
    {
        v1: 'be', v2: 'was/were', v3: 'been', meaning: 'olmak', level: 'A1', exampleSentences: [
            { en: 'I am a student.', tr: 'Ben bir öğrenciyim.' },
            { en: 'She was at home yesterday.', tr: 'Dün evdeydi.' },
            { en: 'They have been friends for years.', tr: 'Yıllardır arkadaşlar.' }
        ]
    },
    {
        v1: 'have', v2: 'had', v3: 'had', meaning: 'sahip olmak', level: 'A1', exampleSentences: [
            { en: 'I have a cat.', tr: 'Bir kedim var.' },
            { en: 'She had breakfast at 8.', tr: 'Saat 8\'de kahvaltı yaptı.' },
            { en: 'We have had this car for 5 years.', tr: '5 yıldır bu arabaya sahibiz.' }
        ]
    },
    {
        v1: 'do', v2: 'did', v3: 'done', meaning: 'yapmak', level: 'A1', exampleSentences: [
            { en: 'I do my homework every day.', tr: 'Her gün ödevimi yaparım.' },
            { en: 'He did his best.', tr: 'Elinden gelenin en iyisini yaptı.' },
            { en: 'The work has been done.', tr: 'İş yapıldı.' }
        ]
    },
    {
        v1: 'go', v2: 'went', v3: 'gone', meaning: 'gitmek', level: 'A1', exampleSentences: [
            { en: 'I go to school by bus.', tr: 'Okula otobüsle giderim.' },
            { en: 'They went to the park.', tr: 'Parka gittiler.' },
            { en: 'She has gone to work.', tr: 'İşe gitti.' }
        ]
    },
    {
        v1: 'come', v2: 'came', v3: 'come', meaning: 'gelmek', level: 'A1', exampleSentences: [
            { en: 'Come here, please.', tr: 'Buraya gel, lütfen.' },
            { en: 'He came to visit us.', tr: 'Bizi ziyarete geldi.' },
            { en: 'Spring has come early this year.', tr: 'Bahar bu yıl erken geldi.' }
        ]
    },
    {
        v1: 'see', v2: 'saw', v3: 'seen', meaning: 'görmek', level: 'A1', exampleSentences: [
            { en: 'I can see the mountains.', tr: 'Dağları görebiliyorum.' },
            { en: 'We saw a movie last night.', tr: 'Dün gece bir film izledik.' },
            { en: 'Have you seen my keys?', tr: 'Anahtarlarımı gördün mü?' }
        ]
    },
    {
        v1: 'eat', v2: 'ate', v3: 'eaten', meaning: 'yemek', level: 'A1', exampleSentences: [
            { en: 'I eat breakfast at 7 AM.', tr: 'Sabah 7\'de kahvaltı yaparım.' },
            { en: 'She ate all the cake.', tr: 'Bütün pastayı yedi.' },
            { en: 'We have eaten here before.', tr: 'Daha önce burada yedik.' }
        ]
    },
    {
        v1: 'drink', v2: 'drank', v3: 'drunk', meaning: 'içmek', level: 'A1', exampleSentences: [
            { en: 'I drink water every morning.', tr: 'Her sabah su içerim.' },
            { en: 'She drank two cups of tea.', tr: 'İki fincan çay içti.' },
            { en: 'He has drunk all the juice.', tr: 'Bütün meyve suyunu içti.' }
        ]
    },
    {
        v1: 'make', v2: 'made', v3: 'made', meaning: 'yapmak, imal etmek', level: 'A1', exampleSentences: [
            { en: 'She makes delicious cakes.', tr: 'Lezzetli pastalar yapar.' },
            { en: 'I made a mistake.', tr: 'Bir hata yaptım.' },
            { en: 'The decision has been made.', tr: 'Karar verildi.' }
        ]
    },
    {
        v1: 'take', v2: 'took', v3: 'taken', meaning: 'almak', level: 'A1', exampleSentences: [
            { en: 'Take your umbrella.', tr: 'Şemsiyeni al.' },
            { en: 'He took the bus to work.', tr: 'İşe otobüsle gitti.' },
            { en: 'All seats have been taken.', tr: 'Tüm koltuklar alındı.' }
        ]
    },
    {
        v1: 'give', v2: 'gave', v3: 'given', meaning: 'vermek', level: 'A1', exampleSentences: [
            { en: 'Give me the book, please.', tr: 'Bana kitabı ver, lütfen.' },
            { en: 'She gave me a present.', tr: 'Bana bir hediye verdi.' },
            { en: 'He has given his answer.', tr: 'Cevabını verdi.' }
        ]
    },
    {
        v1: 'read', v2: 'read', v3: 'read', meaning: 'okumak', level: 'A1', exampleSentences: [
            { en: 'I read books before bed.', tr: 'Yatmadan önce kitap okurum.' },
            { en: 'She read the letter carefully.', tr: 'Mektubu dikkatlice okudu.' },
            { en: 'I have read this book twice.', tr: 'Bu kitabı iki kez okudum.' }
        ]
    },

    // =================== A2 ===================
    {
        v1: 'write', v2: 'wrote', v3: 'written', meaning: 'yazmak', level: 'A2', exampleSentences: [
            { en: 'She writes in her diary every night.', tr: 'Her gece günlüğüne yazar.' },
            { en: 'He wrote a long email.', tr: 'Uzun bir e-posta yazdı.' },
            { en: 'The report has been written.', tr: 'Rapor yazıldı.' }
        ]
    },
    {
        v1: 'speak', v2: 'spoke', v3: 'spoken', meaning: 'konuşmak', level: 'A2', exampleSentences: [
            { en: 'Do you speak English?', tr: 'İngilizce konuşuyor musunuz?' },
            { en: 'She spoke to the manager.', tr: 'Müdürle konuştu.' },
            { en: 'I have spoken to him already.', tr: 'Onunla zaten konuştum.' }
        ]
    },
    {
        v1: 'think', v2: 'thought', v3: 'thought', meaning: 'düşünmek', level: 'A2', exampleSentences: [
            { en: 'I think you are right.', tr: 'Haklı olduğunu düşünüyorum.' },
            { en: 'She thought about it all day.', tr: 'Bütün gün bunu düşündü.' },
            { en: 'I have thought of a solution.', tr: 'Bir çözüm düşündüm.' }
        ]
    },
    {
        v1: 'know', v2: 'knew', v3: 'known', meaning: 'bilmek', level: 'A2', exampleSentences: [
            { en: 'I know the answer.', tr: 'Cevabı biliyorum.' },
            { en: 'She knew the truth.', tr: 'Gerçeği biliyordu.' },
            { en: 'He has known her for years.', tr: 'Onu yıllardır tanıyor.' }
        ]
    },
    {
        v1: 'find', v2: 'found', v3: 'found', meaning: 'bulmak', level: 'A2', exampleSentences: [
            { en: 'I can\'t find my phone.', tr: 'Telefonumu bulamıyorum.' },
            { en: 'She found a new job.', tr: 'Yeni bir iş buldu.' },
            { en: 'The solution has been found.', tr: 'Çözüm bulundu.' }
        ]
    },
    {
        v1: 'tell', v2: 'told', v3: 'told', meaning: 'söylemek', level: 'A2', exampleSentences: [
            { en: 'Tell me the truth.', tr: 'Bana doğruyu söyle.' },
            { en: 'He told us a funny story.', tr: 'Bize komik bir hikaye anlattı.' },
            { en: 'I have told you many times.', tr: 'Sana birçok kez söyledim.' }
        ]
    },
    {
        v1: 'buy', v2: 'bought', v3: 'bought', meaning: 'satın almak', level: 'A2', exampleSentences: [
            { en: 'I want to buy a new phone.', tr: 'Yeni bir telefon almak istiyorum.' },
            { en: 'She bought a dress yesterday.', tr: 'Dün bir elbise aldı.' },
            { en: 'We have bought the tickets.', tr: 'Biletleri aldık.' }
        ]
    },
    {
        v1: 'teach', v2: 'taught', v3: 'taught', meaning: 'öğretmek', level: 'A2', exampleSentences: [
            { en: 'She teaches English at school.', tr: 'Okulda İngilizce öğretir.' },
            { en: 'He taught me how to swim.', tr: 'Bana yüzmeyi öğretti.' },
            { en: 'I have taught this class before.', tr: 'Bu sınıfa daha önce ders verdim.' }
        ]
    },
    {
        v1: 'learn', v2: 'learned', v3: 'learned', meaning: 'öğrenmek', level: 'A2', exampleSentences: [
            { en: 'I learn new words every day.', tr: 'Her gün yeni kelimeler öğrenirim.' },
            { en: 'She learned to play guitar.', tr: 'Gitar çalmayı öğrendi.' },
            { en: 'We have learned a lot today.', tr: 'Bugün çok şey öğrendik.' }
        ]
    },
    {
        v1: 'run', v2: 'ran', v3: 'run', meaning: 'koşmak', level: 'A2', exampleSentences: [
            { en: 'I run every morning.', tr: 'Her sabah koşarım.' },
            { en: 'He ran to catch the bus.', tr: 'Otobüsü yakalamak için koştu.' },
            { en: 'She has run a marathon before.', tr: 'Daha önce bir maraton koştu.' }
        ]
    },
    {
        v1: 'leave', v2: 'left', v3: 'left', meaning: 'ayrılmak, bırakmak', level: 'A2', exampleSentences: [
            { en: 'I leave home at 8 AM.', tr: 'Sabah 8\'de evden çıkarım.' },
            { en: 'She left the office early.', tr: 'Ofisten erken ayrıldı.' },
            { en: 'He has left the building.', tr: 'Binayı terk etti.' }
        ]
    },

    // =================== B1 ===================
    {
        v1: 'choose', v2: 'chose', v3: 'chosen', meaning: 'seçmek', level: 'B1', exampleSentences: [
            { en: 'You can choose any color you like.', tr: 'Beğendiğin herhangi bir rengi seçebilirsin.' },
            { en: 'She chose the red dress.', tr: 'Kırmızı elbiseyi seçti.' },
            { en: 'The winner has been chosen.', tr: 'Kazanan seçildi.' }
        ]
    },
    {
        v1: 'grow', v2: 'grew', v3: 'grown', meaning: 'büyümek, yetiştirmek', level: 'B1', exampleSentences: [
            { en: 'Trees grow slowly.', tr: 'Ağaçlar yavaş büyür.' },
            { en: 'The company grew rapidly.', tr: 'Şirket hızla büyüdü.' },
            { en: 'She has grown beautiful flowers.', tr: 'Güzel çiçekler yetiştirdi.' }
        ]
    },
    {
        v1: 'keep', v2: 'kept', v3: 'kept', meaning: 'tutmak, saklamak', level: 'B1', exampleSentences: [
            { en: 'Keep your room clean.', tr: 'Odanı temiz tut.' },
            { en: 'She kept the secret for years.', tr: 'Sırrı yıllarca sakladı.' },
            { en: 'He has kept his promise.', tr: 'Sözünü tuttu.' }
        ]
    },
    {
        v1: 'throw', v2: 'threw', v3: 'thrown', meaning: 'fırlatmak, atmak', level: 'B1', exampleSentences: [
            { en: 'Don\'t throw garbage on the street.', tr: 'Çöpü sokağa atma.' },
            { en: 'He threw the ball to his friend.', tr: 'Topu arkadaşına fırlattı.' },
            { en: 'The old clothes have been thrown away.', tr: 'Eski giysiler atıldı.' }
        ]
    },
    {
        v1: 'begin', v2: 'began', v3: 'begun', meaning: 'başlamak', level: 'B1', exampleSentences: [
            { en: 'The movie begins at 9 PM.', tr: 'Film akşam 9\'da başlıyor.' },
            { en: 'It began to rain heavily.', tr: 'Şiddetli yağmur yağmaya başladı.' },
            { en: 'Work has begun on the new bridge.', tr: 'Yeni köprü üzerinde çalışma başladı.' }
        ]
    },
    {
        v1: 'break', v2: 'broke', v3: 'broken', meaning: 'kırmak', level: 'B1', exampleSentences: [
            { en: 'Be careful, don\'t break the glass.', tr: 'Dikkatli ol, bardağı kırma.' },
            { en: 'He broke his leg last week.', tr: 'Geçen hafta bacağını kırdı.' },
            { en: 'The window has been broken.', tr: 'Cam kırıldı.' }
        ]
    },
    {
        v1: 'spend', v2: 'spent', v3: 'spent', meaning: 'harcamak, geçirmek', level: 'B1', exampleSentences: [
            { en: 'How much do you spend on food?', tr: 'Yemeğe ne kadar harcıyorsun?' },
            { en: 'We spent the weekend at the beach.', tr: 'Hafta sonunu sahilde geçirdik.' },
            { en: 'She has spent all her money.', tr: 'Tüm parasını harcadı.' }
        ]
    },
    {
        v1: 'fall', v2: 'fell', v3: 'fallen', meaning: 'düşmek', level: 'B1', exampleSentences: [
            { en: 'Leaves fall in autumn.', tr: 'Yapraklar sonbaharda düşer.' },
            { en: 'She fell off the chair.', tr: 'Sandalyeden düştü.' },
            { en: 'The temperature has fallen below zero.', tr: 'Sıcaklık sıfırın altına düştü.' }
        ]
    },
    {
        v1: 'forgive', v2: 'forgave', v3: 'forgiven', meaning: 'affetmek', level: 'B1', exampleSentences: [
            { en: 'Please forgive me for being late.', tr: 'Geç kaldığım için lütfen beni affet.' },
            { en: 'She forgave him immediately.', tr: 'Onu hemen affetti.' },
            { en: 'He has never been forgiven.', tr: 'Hiç affedilmedi.' }
        ]
    },
    {
        v1: 'wear', v2: 'wore', v3: 'worn', meaning: 'giymek', level: 'B1', exampleSentences: [
            { en: 'She always wears a hat.', tr: 'Her zaman şapka giyer.' },
            { en: 'He wore a suit to the meeting.', tr: 'Toplantıya takım elbise giydi.' },
            { en: 'These shoes have been worn out.', tr: 'Bu ayakkabılar eskidi.' }
        ]
    },
    {
        v1: 'rise', v2: 'rose', v3: 'risen', meaning: 'yükselmek', level: 'B1', exampleSentences: [
            { en: 'The sun rises in the east.', tr: 'Güneş doğudan doğar.' },
            { en: 'Prices rose sharply last month.', tr: 'Geçen ay fiyatlar keskin bir şekilde yükseldi.' },
            { en: 'The river has risen dangerously.', tr: 'Nehir tehlikeli bir şekilde yükseldi.' }
        ]
    },
    {
        v1: 'lead', v2: 'led', v3: 'led', meaning: 'yönetmek, liderlik etmek', level: 'B1', exampleSentences: [
            { en: 'She leads the marketing team.', tr: 'Pazarlama ekibine liderlik ediyor.' },
            { en: 'He led the project to success.', tr: 'Projeyi başarıya yönetti.' },
            { en: 'This path has led us to a dead end.', tr: 'Bu yol bizi çıkmaza götürdü.' }
        ]
    },

    // =================== B2 ===================
    {
        v1: 'withdraw', v2: 'withdrew', v3: 'withdrawn', meaning: 'çekmek, geri çekilmek', level: 'B2', exampleSentences: [
            { en: 'I need to withdraw money from the ATM.', tr: 'ATM\'den para çekmem gerekiyor.' },
            { en: 'He withdrew from the competition.', tr: 'Yarışmadan çekildi.' },
            { en: 'The troops have been withdrawn.', tr: 'Birlikler geri çekildi.' }
        ]
    },
    {
        v1: 'overcome', v2: 'overcame', v3: 'overcome', meaning: 'üstesinden gelmek', level: 'B2', exampleSentences: [
            { en: 'She will overcome this challenge.', tr: 'Bu zorluğun üstesinden gelecek.' },
            { en: 'He overcame his fear of heights.', tr: 'Yükseklik korkusunun üstesinden geldi.' },
            { en: 'Many obstacles have been overcome.', tr: 'Birçok engelin üstesinden gelindi.' }
        ]
    },
    {
        v1: 'forbid', v2: 'forbade', v3: 'forbidden', meaning: 'yasaklamak', level: 'B2', exampleSentences: [
            { en: 'The law forbids smoking indoors.', tr: 'Yasa kapalı alanda sigara içmeyi yasaklar.' },
            { en: 'Her parents forbade her from going.', tr: 'Ailesi gitmesini yasakladı.' },
            { en: 'Photography is forbidden here.', tr: 'Burada fotoğraf çekmek yasaktır.' }
        ]
    },
    {
        v1: 'undertake', v2: 'undertook', v3: 'undertaken', meaning: 'üstlenmek', level: 'B2', exampleSentences: [
            { en: 'We undertake difficult projects.', tr: 'Zor projeleri üstleniriz.' },
            { en: 'She undertook the responsibility.', tr: 'Sorumluluğu üstlendi.' },
            { en: 'A major study has been undertaken.', tr: 'Büyük bir çalışma üstlenildi.' }
        ]
    },
    {
        v1: 'arise', v2: 'arose', v3: 'arisen', meaning: 'ortaya çıkmak', level: 'B2', exampleSentences: [
            { en: 'Problems may arise at any time.', tr: 'Sorunlar her zaman ortaya çıkabilir.' },
            { en: 'A new issue arose during the meeting.', tr: 'Toplantı sırasında yeni bir sorun ortaya çıktı.' },
            { en: 'Several questions have arisen.', tr: 'Birkaç soru ortaya çıktı.' }
        ]
    },
    {
        v1: 'seek', v2: 'sought', v3: 'sought', meaning: 'aramak', level: 'B2', exampleSentences: [
            { en: 'She seeks new opportunities.', tr: 'Yeni fırsatlar arıyor.' },
            { en: 'They sought help from experts.', tr: 'Uzmanlardan yardım istediler.' },
            { en: 'A solution has been sought for months.', tr: 'Aylardır bir çözüm aranıyor.' }
        ]
    },
    {
        v1: 'strike', v2: 'struck', v3: 'struck', meaning: 'vurmak, grev yapmak', level: 'B2', exampleSentences: [
            { en: 'Lightning strikes the tall buildings.', tr: 'Yıldırım yüksek binalara çarpar.' },
            { en: 'The workers struck for better wages.', tr: 'İşçiler daha iyi ücretler için grev yaptı.' },
            { en: 'An idea has struck me.', tr: 'Aklıma bir fikir geldi.' }
        ]
    },
    {
        v1: 'broadcast', v2: 'broadcast', v3: 'broadcast', meaning: 'yayınlamak', level: 'B2', exampleSentences: [
            { en: 'The channel broadcasts news 24/7.', tr: 'Kanal 7/24 haber yayınlar.' },
            { en: 'The concert was broadcast live.', tr: 'Konser canlı yayınlandı.' },
            { en: 'The speech has been broadcast worldwide.', tr: 'Konuşma dünya çapında yayınlandı.' }
        ]
    },
    {
        v1: 'bind', v2: 'bound', v3: 'bound', meaning: 'bağlamak', level: 'B2', exampleSentences: [
            { en: 'The contract binds both parties.', tr: 'Sözleşme her iki tarafı da bağlar.' },
            { en: 'They bound the books together.', tr: 'Kitapları birbirine bağladılar.' },
            { en: 'We are bound by the agreement.', tr: 'Anlaşmayla bağlıyız.' }
        ]
    },
    {
        v1: 'undergo', v2: 'underwent', v3: 'undergone', meaning: 'geçirmek (tıbbi vs.)', level: 'B2', exampleSentences: [
            { en: 'The patient will undergo surgery.', tr: 'Hasta ameliyat olacak.' },
            { en: 'She underwent a major transformation.', tr: 'Büyük bir dönüşüm geçirdi.' },
            { en: 'The building has undergone renovation.', tr: 'Bina tadilattan geçti.' }
        ]
    },
    {
        v1: 'swear', v2: 'swore', v3: 'sworn', meaning: 'yemin etmek, küfretmek', level: 'B2', exampleSentences: [
            { en: 'I swear I\'m telling the truth.', tr: 'Yemin ederim doğruyu söylüyorum.' },
            { en: 'She swore to keep the secret.', tr: 'Sırrı saklamaya yemin etti.' },
            { en: 'He has sworn an oath of loyalty.', tr: 'Sadakat yemini etti.' }
        ]
    },
    {
        v1: 'bear', v2: 'bore', v3: 'borne', meaning: 'taşımak, dayanmak, doğurmak', level: 'B2', exampleSentences: [
            { en: 'I can\'t bear the pain anymore.', tr: 'Artık acıya dayanamıyorum.' },
            { en: 'She bore the burden alone.', tr: 'Yükü tek başına taşıdı.' },
            { en: 'The tree has borne fruit.', tr: 'Ağaç meyve verdi.' }
        ]
    },

    // =================== C1 ===================
    {
        v1: 'withhold', v2: 'withheld', v3: 'withheld', meaning: 'esirgemek, gizlemek', level: 'C1', exampleSentences: [
            { en: 'They withhold important information.', tr: 'Önemli bilgileri gizliyorlar.' },
            { en: 'The government withheld the documents.', tr: 'Hükümet belgeleri sakladı.' },
            { en: 'Evidence has been withheld from the jury.', tr: 'Kanıtlar jüriden gizlendi.' }
        ]
    },
    {
        v1: 'befall', v2: 'befell', v3: 'befallen', meaning: 'başına gelmek', level: 'C1', exampleSentences: [
            { en: 'No harm shall befall you here.', tr: 'Burada başına hiçbir kötülük gelmeyecek.' },
            { en: 'A great tragedy befell the village.', tr: 'Köyün başına büyük bir trajedi geldi.' },
            { en: 'Much misfortune has befallen them.', tr: 'Çok talihsizlik başlarına geldi.' }
        ]
    },
    {
        v1: 'forsake', v2: 'forsook', v3: 'forsaken', meaning: 'terk etmek, vazgeçmek', level: 'C1', exampleSentences: [
            { en: 'Do not forsake your principles.', tr: 'İlkelerinizden vazgeçmeyin.' },
            { en: 'He forsook his old way of life.', tr: 'Eski yaşam tarzını terk etti.' },
            { en: 'She felt forsaken and alone.', tr: 'Terk edilmiş ve yalnız hissetti.' }
        ]
    },
    {
        v1: 'partake', v2: 'partook', v3: 'partaken', meaning: 'katılmak, paylaşmak', level: 'C1', exampleSentences: [
            { en: 'Would you like to partake in this event?', tr: 'Bu etkinliğe katılmak ister misiniz?' },
            { en: 'She partook in the celebration.', tr: 'Kutlamaya katıldı.' },
            { en: 'All guests have partaken of the feast.', tr: 'Tüm misafirler şölene katıldı.' }
        ]
    },
    {
        v1: 'strive', v2: 'strove', v3: 'striven', meaning: 'çabalamak, mücadele etmek', level: 'C1', exampleSentences: [
            { en: 'We strive for excellence.', tr: 'Mükemmellik için çabalıyoruz.' },
            { en: 'She strove to improve her skills.', tr: 'Becerilerini geliştirmek için çabaladı.' },
            { en: 'He has striven to achieve his goals.', tr: 'Hedeflerine ulaşmak için mücadele etti.' }
        ]
    },
    {
        v1: 'wring', v2: 'wrung', v3: 'wrung', meaning: 'sıkmak, bükmek', level: 'C1', exampleSentences: [
            { en: 'She wrings the wet towel.', tr: 'Islak havluyu sıkar.' },
            { en: 'He wrung his hands nervously.', tr: 'Ellerini gergin bir şekilde ovuşturdu.' },
            { en: 'The cloth has been wrung dry.', tr: 'Bez sıkılarak kurutuldu.' }
        ]
    },
    {
        v1: 'smite', v2: 'smote', v3: 'smitten', meaning: 'çarpmak, vurmak', level: 'C1', exampleSentences: [
            { en: 'The disease smites without warning.', tr: 'Hastalık uyarı vermeden vurur.' },
            { en: 'The storm smote the coast.', tr: 'Fırtına kıyıyı vurdu.' },
            { en: 'He was smitten by her beauty.', tr: 'Güzelliğine vuruldu.' }
        ]
    },
    {
        v1: 'beget', v2: 'begot', v3: 'begotten', meaning: 'doğurmak, sebep olmak', level: 'C1', exampleSentences: [
            { en: 'Violence begets violence.', tr: 'Şiddet şiddeti doğurur.' },
            { en: 'The crisis begot many problems.', tr: 'Kriz birçok soruna yol açtı.' },
            { en: 'Change has always begotten resistance.', tr: 'Değişim daima direnişe yol açmıştır.' }
        ]
    },
    {
        v1: 'cleave', v2: 'clove', v3: 'cloven', meaning: 'yarmak, bölmek', level: 'C1', exampleSentences: [
            { en: 'The axe cleaves the wood easily.', tr: 'Balta odunu kolayca yarar.' },
            { en: 'Lightning clove the sky in two.', tr: 'Yıldırım gökyüzünü ikiye böldü.' },
            { en: 'The rock has been cloven in half.', tr: 'Kaya ikiye yarıldı.' }
        ]
    },
    {
        v1: 'beseech', v2: 'besought', v3: 'besought', meaning: 'yalvarmak', level: 'C1', exampleSentences: [
            { en: 'I beseech you to reconsider.', tr: 'Yeniden düşünmenizi yalvarırım.' },
            { en: 'She besought his forgiveness.', tr: 'Affını diledi.' },
            { en: 'They have besought the king for mercy.', tr: 'Kraldan merhamet dilediler.' }
        ]
    },
    {
        v1: 'abide', v2: 'abode', v3: 'abode', meaning: 'uymak, katlanmak', level: 'C1', exampleSentences: [
            { en: 'You must abide by the rules.', tr: 'Kurallara uymalısınız.' },
            { en: 'He abode in silence.', tr: 'Sessizlik içinde kaldı.' },
            { en: 'She has always abode by her word.', tr: 'Her zaman sözünde durdu.' }
        ]
    },
    {
        v1: 'slay', v2: 'slew', v3: 'slain', meaning: 'katletmek, öldürmek', level: 'C1', exampleSentences: [
            { en: 'The knight must slay the dragon.', tr: 'Şövalye ejderhayı öldürmelidir.' },
            { en: 'The warrior slew the enemy.', tr: 'Savaşçı düşmanı öldürdü.' },
            { en: 'The beast has been slain.', tr: 'Canavar öldürüldü.' }
        ]
    },
];

async function seedVerbs() {
    console.log('🌱 Fiil verileri yükleniyor...\n');

    const batch = db.batch();
    const vocabRef = db.collection('vocabulary');

    for (const verb of verbs) {
        const docRef = vocabRef.doc();
        batch.set(docRef, {
            ...verb,
            createdAt: new Date(),
        });
    }

    await batch.commit();
    console.log(`✅ ${verbs.length} fiil başarıyla Firestore'a yüklendi!`);
    console.log('\nSeviye dağılımı:');

    const levels = {};
    verbs.forEach((v) => {
        levels[v.level] = (levels[v.level] || 0) + 1;
    });
    Object.entries(levels).forEach(([level, count]) => {
        console.log(`  ${level}: ${count} fiil`);
    });

    process.exit(0);
}

seedVerbs().catch((err) => {
    console.error('Seed hatası:', err);
    process.exit(1);
});
