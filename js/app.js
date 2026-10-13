/* =============================================================
   New Tab Studio — main app
   ============================================================= */

/* ---------------- tiny helpers ---------------- */
const div = c => { const d = document.createElement('div'); if (c) d.className = c; return d; };
const elm = (t, c, txt) => { const n = document.createElement(t); if (c) n.className = c; if (txt != null) n.textContent = txt; return n; };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const fmtDur = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const hexToRgba = (hex, a) => {
  let h = (hex || '#000000').replace('#', '');
  if (h.length === 3) h = h.split('').map(x => x + x).join('');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

let toastTimer = null;
function toast(msg, ms = 3400) {
  let t = document.getElementById('toast');
  if (!t) { t = div(''); t.id = 'toast'; document.body.append(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

/* ---------------- constants ---------------- */
const MAX_TRACKS = 50;
const MAX_TRACK_SECONDS = 8 * 60;

const ENGINES = {
  google: 'https://www.google.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
  bing: 'https://www.bing.com/search?q=',
  youtube: 'https://www.youtube.com/results?search_query='
};

const QUOTES = [
  'The secret of getting ahead is getting started. — Mark Twain',
  'It always seems impossible until it\'s done. — Nelson Mandela',
  'Simplicity is the soul of efficiency. — Austin Freeman',
  'First, solve the problem. Then, write the code. — John Johnson',
  'Make it work, make it right, make it fast. — Kent Beck',
  'Code is like humor. When you have to explain it, it\'s bad. — Cory House',
  'Discipline is the bridge between goals and accomplishment. — Jim Rohn',
  'Well begun is half done. — Aristotle',
  'Focus is the art of knowing what to ignore. — James Clear',
  'Small deeds done are better than great deeds planned. — Peter Marshall',
  'The future depends on what you do today. — Mahatma Gandhi',
  'Done is better than perfect. — Sheryl Sandberg',
  'Whether you think you can or you think you can\'t, you\'re right. — Henry Ford',
  'A year from now you may wish you had started today. — Karen Lamb',
  'Everything you\'ve ever wanted is on the other side of fear. — George Addair',
  'Action is the foundational key to all success. — Pablo Picasso',
  'You don\'t have to be great to start, but you have to start to be great. — Zig Ziglar',
  'Stay hungry, stay foolish. — Steve Jobs',
  'What we fear doing most is usually what we most need to do. — Tim Ferriss',
  'Either you run the day or the day runs you. — Jim Rohn',
  'Ideas are easy. Implementation is hard. — Guy Kawasaki',
  'The best way out is always through. — Robert Frost',
  'Perseverance is not a long race; it is many short races one after the other. — Walter Elliot',
  'If you spend too much time thinking about a thing, you\'ll never get it done. — Bruce Lee',
  'Amateurs sit and wait for inspiration. The rest of us just get up and go to work. — Stephen King',
  'Your future is created by what you do today, not tomorrow. — Robert Kiyosaki',
  'Don\'t watch the clock; do what it does. Keep going. — Sam Levenson',
  'The harder the conflict, the greater the triumph. — George Washington',
  'One day or day one. You decide. — Paulo Coelho',
  'Dream big. Start small. Act now. — Robin Sharma',
  'The only true wisdom is in knowing you know nothing. — Socrates',
  'In three words I can sum up everything I\'ve learned about life: it goes on. — Robert Frost',
  'Life is what happens when you\'re busy making other plans. — John Lennon',
  'Turn your wounds into wisdom. — Oprah Winfrey',
  'An unexamined life is not worth living. — Socrates',
  'The purpose of our lives is to be happy. — Dalai Lama',
  'Get busy living or get busy dying. — Stephen King',
  'Life is short, and it is up to you to make it sweet. — Sarah Louise Delany',
  'You only live once, but if you do it right, once is enough. — Mae West',
  'In the end, it\'s not the years in your life that count. It\'s the life in your years. — Abraham Lincoln',
  'Never let the fear of striking out keep you from playing the game. — Babe Ruth',
  'Money and success don’t change people; they merely amplify what is already there. — Will Smith',
  'Not how long, but how well you have lived is the main thing. — Seneca',
  'Life is really simple, but we insist on making it complicated. — Confucius',
  'May you live all the days of your life. — Jonathan Swift',
  'Life itself is the most wonderful fairy tale. — Hans Christian Andersen',
  'Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment. — Buddha',
  'Life is a flower of which love is the honey. — Victor Hugo',
  'Keep smiling, because life is a beautiful thing and there\'s so much to smile about. — Marilyn Monroe',
  'Health is the greatest gift, contentment the greatest wealth, faithfulness the best relationship. — Buddha',
  'Good friends, good books, and a sleepy conscience: this is the ideal life. — Mark Twain',
  'Live in the sunshine, swim the sea, drink the wild air. — Ralph Waldo Emerson',
  'The greatest glory in living lies not in never falling, but in rising every time we fall. — Nelson Mandela',
  'Life is made of ever-so-many partings welded together. — Charles Dickens',
  'Your time is limited, so don\'t waste it living someone else\'s life. — Steve Jobs',
  'To live is the rarest thing in the world. Most people exist, that is all. — Oscar Wilde',
  'Life shrinks or expands in proportion to one\'s courage. — Anaïs Nin',
  'It is not length of life, but depth of life. — Ralph Waldo Emerson',
  'Dwell on the beauty of life. Watch the stars, and see yourself running with them. — Marcus Aurelius',
  'Life is 10% what happens to you and 90% how you react to it. — Charles R. Swindoll',
  'A life spent making mistakes is not only more honorable, but more useful than a life spent doing nothing. — George Bernard Shaw',
  'The unexamined life is not worth living. — Plato',
  'Everything has beauty, but not everyone sees it. — Confucius',
  'Life\'s tragedy is that we get old too soon and wise too late. — Benjamin Franklin',
  'Too many of us are not living our dreams because we are living our fears. — Les Brown',
  'Life isn\'t about finding yourself. Life is about creating yourself. — George Bernard Shaw',
  'To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment. — Ralph Waldo Emerson',
  'Life is either a daring adventure or nothing at all. — Helen Keller',
  'Wisdom begins in wonder. — Socrates',
  'Count your age by friends, not years. Count your life by smiles, not tears. — John Lennon',
  'Happiness is not something ready made. It comes from your own actions. — Dalai Lama',
  'What we think, we become. — Buddha',
  'Difficulties strengthen the mind, as labor does the body. — Seneca',
  'The only thing worse than being blind is having sight but no vision. — Helen Keller',
  'Change your thoughts and you change your world. — Norman Vincent Peale',
  'Live as if you were to die tomorrow. Learn as if you were to live forever. — Mahatma Gandhi',
  'It is during our darkest moments that we must focus to see the light. — Aristotle',
  'Do what you can, with what you have, where you are. — Theodore Roosevelt',
  'The power of finding beauty in the humblest things makes home happy and life lovely. — Louisa May Alcott',
  'Success is not final, failure is not fatal: it is the courage to continue that counts. — Winston Churchill',
  'The secret of success is to do the common thing uncommonly well. — John D. Rockefeller Jr.',
  'Success usually comes to those who are too busy to be looking for it. — Henry David Thoreau',
  'The road to success and the road to failure are almost exactly the same. — Colin R. Davis',
  'Opportunities don\'t happen. You create them. — Chris Grosser',
  'Don\'t be afraid to give up the good to go for the great. — John D. Rockefeller',
  'I find that the harder I work, the more luck I seem to have. — Thomas Jefferson',
  'There are no secrets to success. It is the result of preparation, hard work, and learning from failure. — Colin Powell',
  'Success is walking from failure to failure with no loss of enthusiasm. — Winston Churchill',
  'Try not to become a man of success. Rather become a man of value. — Albert Einstein',
  'Stop chasing the money and start chasing the passion. — Tony Hsieh',
  'I never dreamed about success. I worked for it. — Estée Lauder',
  'Formula for success: rise early, work hard, strike oil. — J. Paul Getty',
  'The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack of will. — Vince Lombardi',
  'Success seems to be connected with action. Successful people keep moving. — Conrad Hilton',
  'The way to get started is to quit talking and begin doing. — Walt Disney',
  'Do not wait to strike till the iron is hot; but make it hot by striking. — William Butler Yeats',
  'Great things are done by a series of small things brought together. — Vincent van Gogh',
  'Dream big and dare to fail. — Norman Vaughan',
  'Success is getting what you want; happiness is wanting what you get. — W. P. Kinsella',
  'Doubt kills more dreams than failure ever will. — Suzy Kassem',
  'Failure is simply the opportunity to begin again, this time more intelligently. — Henry Ford',
  'If you really look closely, most overnight successes took a long time. — Steve Jobs',
  'Believe you can and you\'re halfway there. — Theodore Roosevelt',
  'Setting goals is the first step in turning the invisible into the visible. — Tony Robbins',
  'Your talent determines what you can do. Your motivation determines how much you are willing to do. Your attitude determines how well you do it. — Lou Holtz',
  'Hard work beats talent when talent doesn\'t work hard. — Tim Notke',
  'Aim for the moon. If you miss, you may hit a star. — W. Clement Stone',
  'Success is the sum of small efforts, repeated day in and day out. — Robert Collier',
  'Perfection is not attainable, but if we chase perfection we can catch excellence. — Vince Lombardi',
  'Defeat is not the worst of failures. Not to have tried is the true failure. — George Edward Woodberry',
  'The only limit to our realization of tomorrow will be our doubts of today. — Franklin D. Roosevelt',
  'Energy and persistence conquer all things. — Benjamin Franklin',
  'You miss 100% of the shots you don\'t take. — Wayne Gretzky',
  'I attribute my success to this: I never gave or took any excuse. — Florence Nightingale',
  'If you want to achieve greatness stop asking for permission. — Anonymous',
  'The starting point of all achievement is desire. — Napoleon Hill',
  'Fall seven times and stand up eight. — Japanese Proverb',
  'The only place where success comes before work is in the dictionary. — Vidal Sassoon',
  'Don\'t count the days, make the days count. — Muhammad Ali',
  'Whatever the mind of man can conceive and believe, it can achieve. — Napoleon Hill',
  'Success is not how high you have climbed, but how you make a positive difference to the world. — Roy T. Bennett',
  'Press forward. Do not stop, do not linger in your journey, but strive for the mark set before you. — George Whitefield',
  'Build your own dreams, or someone else will hire you to build theirs. — Farrah Gray',
  'Start where you are. Use what you have. Do what you can. — Arthur Ashe',
  'The best thing to hold onto in life is each other. — Audrey Hepburn',
  'Love is composed of a single soul inhabiting two bodies. — Aristotle',
  'Where there is love there is life. — Mahatma Gandhi',
  'You know you\'re in love when you can\'t fall asleep because reality is finally better than your dreams. — Dr. Seuss',
  'The greatest happiness of life is the conviction that we are loved. — Victor Hugo',
  'Love all, trust a few, do wrong to none. — William Shakespeare',
  'We are most alive when we\'re in love. — John Updike',
  'There is only one happiness in this life, to love and be loved. — George Sand',
  'Love does not consist in gazing at each other, but in looking outward together in the same direction. — Antoine de Saint-Exupéry',
  'To love and be loved is to feel the sun from both sides. — David Viscott',
  'Being deeply loved by someone gives you strength, while loving someone deeply gives you courage. — Lao Tzu',
  'A loving heart is the truest wisdom. — Charles Dickens',
  'Love is the poetry of the senses. — Honoré de Balzac',
  'We love because it\'s the only true adventure. — Nikki Giovanni',
  'To love is to recognize yourself in another. — Eckhart Tolle',
  'True love is rare, and it\'s the only thing that gives life real meaning. — Nicholas Sparks',
  'If I know what love is, it is because of you. — Hermann Hesse',
  'Love cures people—both the ones who give it and the ones who receive it. — Karl A. Menninger',
  'Love is an untamed force. When we try to control it, it destroys us. — Paulo Coelho',
  'The giving of love is an education in itself. — Eleanor Roosevelt',
  'In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine. — Maya Angelou',
  'Love recognizes no barriers. It jumps hurdles, leaps fences, penetrates walls to arrive at its destination full of hope. — Maya Angelou',
  'Kindness in words creates confidence. Kindness in thinking creates profoundness. Kindness in giving creates love. — Lao Tzu',
  'Life without love is like a tree without blossoms or fruit. — Khalil Gibran',
  'Love is a friendship set to music. — Joseph Campbell',
  'There is no remedy for love but to love more. — Henry David Thoreau',
  'When we love, we always strive to become better than we are. — Paulo Coelho',
  'At the touch of love everyone becomes a poet. — Plato',
  'To love another person is to see the face of God. — Victor Hugo',
  'Love expands the heart. — Rumi',
  'The heart has its reasons of which reason knows nothing. — Blaise Pascal',
  'Shared joy is a double joy; shared sorrow is half a sorrow. — Swedish Proverb',
  'Love is the beauty of the soul. — Saint Augustine',
  'A friend is someone who knows all about you and still loves you. — Elbert Hubbard',
  'In friendship, as in love, we are often happier through the things we are ignorant of than through the things we know. — François de La Rochefoucauld',
  'Real love isn\'t meeting a perfect person, but learning to see an imperfect person perfectly. — Sam Keen',
  'To be brave is to love someone unconditionally, without expecting anything in return. — Madonna',
  'Darkness cannot drive out darkness; only light can do that. Hate cannot drive out hate; only love can do that. — Martin Luther King Jr.',
  'The best and most beautiful things in this world cannot be seen or even heard, but must be felt with the heart. — Helen Keller',
  'Love is like the wind, you can\'t see it but you can feel it. — Nicholas Sparks',
  'Let us always meet each other with smile, for the smile is the beginning of love. — Mother Teresa',
  'To love is to burn, to be on fire. — Jane Austen',
  'One word frees us of all the weight and pain of life: That word is love. — Sophocles',
  'Who, being loved, is poor? — Oscar Wilde',
  'Love is the expansion of two nature in such fashion that each include the other, each be enriched by the other. — Felix Adler',
  'Love will find a way through paths where wolves fear to prey. — Lord Byron',
  'You don\'t marry someone you can live with—you marry someone you cannot live without. — Unknown',
  'Love isn\'t something you find. Love is something that finds you. — Loretta Young',
  'Love is shown more in deeds than in words. — Saint Ignatius',
  'Courage is not the absence of fear, but the triumph over it. — Nelson Mandela',
  'It takes courage to grow up and become who you really are. — E.E. Cummings',
  'Courage is resistance to fear, mastery of fear—not absence of fear. — Mark Twain',
  'You get what you settle for. — Thelma & Louise',
  'He who is not courageous enough to take risks will accomplish nothing in life. — Muhammad Ali',
  'Courage is grace under pressure. — Ernest Hemingway',
  'Whatever you do, you need courage. — Ralph Waldo Emerson',
  'With courage you will dare to take risks, have the strength to be compassionate, and the wisdom to be humble. — Keshavan Nair',
  'It is not the mountain we conquer, but ourselves. — Sir Edmund Hillary',
  'Endurance is noble. — Euripides',
  'You cannot swim for new horizons until you have courage to lose sight of the shore. — William Faulkner',
  'Have the courage to follow your heart and intuition. — Steve Jobs',
  'Courage is the most important of all the virtues because without courage, you can\'t practice any other virtue consistently. — Maya Angelou',
  'The brave man is not he who does not feel afraid, but he who conquers that fear. — Nelson Mandela',
  'Don\'t wait for extraordinary opportunities. Seize common occasions and make them great. — Orison Swett Marden',
  'Scared is a habit. Hope is a habit. And courage is a habit. — Gillian Anderson',
  'Pain is temporary. Quitting lasts forever. — Lance Armstrong',
  'Courage doesn\'t always roar. Sometimes courage is the quiet voice at the end of the day saying, \'I will try again tomorrow.\' — Mary Anne Radmacher',
  'Never give up, for that is just the place and time that the tide will turn. — Harriet Beecher Stowe',
  'You have power over your mind - not outside events. Realize this, and you will find strength. — Marcus Aurelius',
  'All our dreams can come true, if we have the courage to pursue them. — Walt Disney',
  'Only those who dare to fail greatly can ever achieve greatly. — Robert F. Kennedy',
  'Fear is a reaction. Courage is a decision. — Winston Churchill',
  'Stand up for what is right, even if you are standing alone. — Anonymous',
  'Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle. — Christian D. Larson',
  'Courage is found in unlikely places. — J.R.R. Tolkien',
  'He who has a why to live can bear almost any how. — Friedrich Nietzsche',
  'Tough times never last, but tough people do. — Robert H. Schuller',
  'If you are going through hell, keep going. — Winston Churchill',
  'A ship in harbor is safe, but that is not what ships are built for. — John A. Shedd',
  'Clear your mind of can\'t. — Samuel Johnson',
  'Never lose hope. Storms make people stronger and never last forever. — Roy T. Bennett',
  'The oak fought the wind and was broken, the willow bent when it must and survived. — Robert Jordan',
  'Small shifts in mindset produce huge results in endurance. — Unknown',
  'Do the thing you fear and the death of fear is certain. — Ralph Waldo Emerson',
  'Mistakes are the portals of discovery. — James Joyce',
  'To be brave means to know that when you fail, you don\'t fail forever. — Lana Del Rey',
  'When everything seems to be going against you, remember that the airplane takes off against the wind, not with it. — Henry Ford',
  'The power to endure is often what separates success from failure. — Anonymous',
  'The ultimate measure of a man is not where he stands in moments of comfort, but where he stands at times of challenge. — Martin Luther King Jr.',
  'Fortune favors the bold. — Virgil',
  'Run when you can, walk if you have to, crawl if you must; just never give up. — Dean Karnazes',
  'Storms make trees take deeper roots. — Dolly Parton',
  'You never know how strong you are until being strong is the only choice you have. — Bob Marley',
  'Face your deficiencies and acknowledge them; but do not let them master you. — Helen Keller',
  'Courage call to courage everywhere. — Millicent Fawcett',
  'Perseverance is failing 19 times and succeeding the 20th. — Julie Andrews',
  'In the middle of difficulty lies opportunity. — Albert Einstein',
  'Creativity is intelligence having fun. — Albert Einstein',
  'Every child is an artist. The problem is how to remain an artist once we grow up. — Pablo Picasso',
  'Art enables us to find ourselves and lose ourselves at the same time. — Thomas Merton',
  'You can\'t use up creativity. The more you use, the more you have. — Maya Angelou',
  'Creativity takes courage. — Henri Matisse',
  'To create one\'s own world takes courage. — Georgia O\'Keeffe',
  'The chief enemy of creativity is \'good\' sense. — Pablo Picasso',
  'Design is not just what it looks like and feels like. Design is how it works. — Steve Jobs',
  'Inspiration exists, but it has to find you working. — Pablo Picasso',
  'The desire to create is one of the deepest yearnings of the human soul. — Dieter F. Uchtdorf',
  'Art is not what you see, but what you make others see. — Edgar Degas',
  'Creativity is seeing what everyone else has seen, and thinking what no one else has thought. — Albert Szent-Györgyi',
  'Everything you can imagine is real. — Pablo Picasso',
  'An idea that is developed and put into action is more important than an idea that exists only as an idea. — Edward de Bono',
  'Art washes away from the soul the dust of everyday life. — Pablo Picasso',
  'Creativity is a wild mind and a disciplined eye. — Dorothy Parker',
  'Learn the rules like a pro, so you can break them like an artist. — Pablo Picasso',
  'Logic will get you from A to B. Imagination will take you everywhere. — Albert Einstein',
  'The worst enemy to creativity is self-doubt. — Sylvia Plath',
  'Make visible what, without you, might perhaps never have been seen. — Robert Bresson',
  'Art is standing with one hand extended into the universe and one hand extended into the world, and letting the interaction happen. — Ken Danby',
  'Inspiration is for amateurs. The rest of us just show up and get to work. — Chuck Close',
  'The essential part of creativity is not being afraid to fail. — Edwin Land',
  'To live a creative life, we must lose our fear of being wrong. — Joseph Chilton Pearce',
  'Don\'t think. Thinking is the enemy of creativity... Just try to create things. — Ray Bradbury',
  'Where the spirit does not work with the hand, there is no art. — Leonardo da Vinci',
  'Imagination is the beginning of creation. — George Bernard Shaw',
  'Curiosity about life in all of its aspects, I think, is still the secret of great creative people. — Leo Burnett',
  'Creativity is contagious, pass it on. — Albert Einstein',
  'Art is the lie that enables us to realize truth. — Pablo Picasso',
  'A creative life is an amplified life. — Elizabeth Gilbert',
  'Art is a step from what\'s obvious and well-known toward what\'s mysterious and hidden. — Khalil Gibran',
  'Creativity involves breaking out of established patterns in order to look at things in a different way. — Edward de Bono',
  'Great art picks up where nature ends. — Marc Chagall',
  'Write what should not be forgotten. — Isabel Allende',
  'System is the enemy of artistry. — John Ruskin',
  'Ideas are like fish. If you want to catch little fish, you can stay in the shallow water. But if you want to catch the big fish, you’ve got to go deeper. — David Lynch',
  'Simplicity is the ultimate sophistication. — Leonardo da Vinci',
  'There is no innovation and creativity without failure. Period. — Brené Brown',
  'Painting is silent poetry, and poetry is painting that speaks. — Plutarch',
  'Play is the highest form of research. — Albert Einstein',
  'A work of art which did not begin in emotion is not art. — Paul Cézanne',
  'The purpose of art is washing the dust of daily life off our souls. — Pablo Picasso',
  'Have no fear of perfection - you\'ll never reach it. — Salvador Dalí',
  'True art is characterized by an irresistible urge in the creative artist. — Albert Einstein',
  'The position of the artist is humble. He is essentially a channel. — Piet Mondrian',
  'Creation begins with a vision. — Anonymous',
  'To be an artist is to believe in life. — Henry Moore',
  'Art speaks where words are unable to explain. — Unknown',
  'Originality is nothing but judicious imitation. — Voltaire',
  'Science is a way of thinking much more than it is a body of knowledge. — Carl Sagan',
  'The important thing is not to stop questioning. Curiosity has its own reason for existing. — Albert Einstein',
  'Somewhere, something incredible is waiting to be known. — Carl Sagan',
  'Nothing in life is to be feared, it is only to be understood. — Marie Curie',
  'If I have seen further it is by standing on the shoulders of Giants. — Isaac Newton',
  'Science and everyday life cannot and should not be separated. — Rosalind Franklin',
  'Research is formalized curiosity. It is poking and prying with a purpose. — Zora Neale Hurston',
  'Equipped with his five senses, man explores the universe around him and calls the adventure Science. — Edwin Powell Hubble',
  'The good thing about science is that it\'s true whether or not you believe in it. — Neil deGrasse Tyson',
  'What I love about science is that as you learn, it doesn\'t give you answers, it gives you questions. — Fred Adams',
  'We are a way for the cosmos to know itself. — Carl Sagan',
  'In science, there are no shortcuts to truth. — Karl Popper',
  'Science is organized knowledge. Wisdom is organized life. — Immanuel Kant',
  'Imagination is more important than knowledge. — Albert Einstein',
  'One, remember to look up at the stars and not down at your feet. — Stephen Hawking',
  'The reward of the young scientist is the emotional thrill of being the first person in history to see something or to understand something. — Francis Crick',
  'Touch a scientist and you touch a child. — Ray Bradbury',
  'Science is the poetry of reality. — Richard Dawkins',
  'Everything is theoretically impossible, until it is done. — Robert A. Heinlein',
  'What we know is a drop, what we don\'t know is an ocean. — Isaac Newton',
  'Science knows no country, because knowledge belongs to humanity. — Louis Pasteur',
  'The art and science of asking questions is the source of all knowledge. — Thomas Berger',
  'Curiosity is the wick in the candle of learning. — William Arthur Ward',
  'Doubt is the father of invention. — Galileo Galilei',
  'Nature is written in mathematical language. — Galileo Galilei',
  'To know that we know what we know, and that we do not know what we do not know, that is true knowledge. — Nicolaus Copernicus',
  'The greatest enemy of knowledge is not ignorance, it is the illusion of knowledge. — Stephen Hawking',
  'I have no special talent. I am only passionately curious. — Albert Einstein',
  'Science is the process that takes us from confusion to understanding. — Brian Greene',
  'Mystery creates wonder and wonder is the basis of man\'s desire to understand. — Neil Armstrong',
  'The scientist is not a person who gives the right answers, he\'s one who asks the right questions. — Claude Lévi-Strauss',
  'Fascinating things happen when you start looking closely. — Jane Goodall',
  'An investment in knowledge pays the best interest. — Benjamin Franklin',
  'The mind that opens to a new idea never returns to its original size. — Albert Einstein',
  'We are made of star-stuff. — Carl Sagan',
  'Wonder is the seed of knowledge. — Francis Bacon',
  'You cannot teach a man anything; you can only help him find it within himself. — Galileo Galilei',
  'To understand the universe, you must understand energy, frequency and vibration. — Nikola Tesla',
  'Every discovery is a step toward understanding. — Anonymous',
  'The progress of science is marked by the discovery of new problems. — Karl Popper',
  'The science of today is the technology of tomorrow. — Edward Teller',
  'All truths are easy to understand once they are discovered; the point is to discover them. — Galileo Galilei',
  'Curiosity is one of the permanent and certain characteristics of a vigorous intellect. — Samuel Johnson',
  'Observation is a passive science, experimentation an active science. — Claude Bernard',
  'Science is magic that works. — Kurt Vonnegut',
  'In darkness, science holds up the torch. — Anonymous',
  'It is the tension between creativity and skepticism that has produced the stunning discoveries of science. — Carl Sagan',
  'Knowledge is power. — Francis Bacon',
  'The universe is under no obligation to make sense to you. — Neil deGrasse Tyson',
  'Be curious, not judgmental. — Walt Whitman',
  'Peace comes from within. Do not seek it without. — Buddha',
  'Mindfulness is about being fully awake in our lives. — Jon Kabat-Zinn',
  'The present moment is filled with joy and happiness. If you are attentive, you will see it. — Thich Nhat Hanh',
  'Wherever you go, go with all your heart. — Confucius',
  'Calmness is the cradle of power. — Josiah Gilbert Holland',
  'Quiet the mind, and the soul will speak. — Ma Jaya Sati Bhagavati',
  'Surrender to what is. Let go of what was. Have faith in what will be. — Sonia Ricotti',
  'In stillness, the truth arises. — Lao Tzu',
  'The soul always knows what to do to heal itself. The challenge is to silence the mind. — Caroline Myss',
  'Smile, breathe, and go slowly. — Thich Nhat Hanh',
  'He who lives in harmony with himself lives in harmony with the universe. — Marcus Aurelius',
  'Mindfulness is a way of befriending ourselves and our experience. — Jon Kabat-Zinn',
  'Breathe in peace, breathe out tension. — Anonymous',
  'Nothing can bring you peace but yourself. — Ralph Waldo Emerson',
  'Tension is who you think you should be. Relaxation is who you are. — Chinese Proverb',
  'Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor. — Thich Nhat Hanh',
  'Silence is a source of great strength. — Lao Tzu',
  'Do not let the behavior of others destroy your inner peace. — Dalai Lama',
  'The best way to pay for a lovely moment is to enjoy it. — Richard Bach',
  'Walk as if you are kissing the Earth with your feet. — Thich Nhat Hanh',
  'Be present in all things and thankful for all things. — Maya Angelou',
  'Within you, there is a stillness and a sanctuary to which you can retreat at any time. — Hermann Hesse',
  'Peace is the result of retraining your mind to process life as it is, rather than as you think it should be. — Wayne Dyer',
  'Slow down and everything you are chasing will come around and catch you. — John De Paola',
  'Life is a series of natural and spontaneous changes. Don\'t resist them. — Lao Tzu',
  'The root of suffering is attachment. — Buddha',
  'Let go of certainty. The opposite isn\'t uncertainty. It\'s openness, curiosity and a willingness to embrace change. — Tony Schwartz',
  'To a mind that is still, the whole universe surrenders. — Lao Tzu',
  'Look deep into nature, and then you will understand everything better. — Albert Einstein',
  'Every moment is a fresh beginning. — T.S. Eliot',
  'Mindfulness isn\'t difficult, we just have to remember to do it. — Sharon Salzberg',
  'Wherever you are, be all there. — Jim Elliot',
  'You can\'t stop the waves, but you can learn to surf. — Jon Kabat-Zinn',
  'Radiate boundless love towards the entire world. — Buddha',
  'Inner peace begins the moment you choose not to allow another person or event to control your emotions. — Pema Chödrön',
  'Act without expectation. — Lao Tzu',
  'When you realize how perfect everything is, you will tilt your head back and laugh at the sky. — Buddha',
  'Simplicity, patience, compassion. These three are your greatest treasures. — Lao Tzu',
  'Do not overrate what you have received, nor envy others. — Buddha',
  'Peace is not the absence of conflict, but the ability to cope with it. — Unknown',
  'To understand everything is to forgive everything. — Buddha',
  'A calm mind brings inner strength and self-confidence. — Dalai Lama',
  'Wisdom comes with ability to be still. — Eckhart Tolle',
  'Let your mind be like water. Clear, reflective, and adaptable. — Bruce Lee',
  'Accepting the present moment brings freedom. — Unknown',
  'Pause, breathe, repair your universe, then proceed. — Anonymous',
  'The feeling that any task is a nuisance will soon disappear if it is done mindfully. — Thich Nhat Hanh',
  'Your calm mind is the ultimate weapon against your challenges. — Bryant McGill',
  'When we quiet the noise of the world, we can hear the music of our soul. — Anonymous',
  'There is a calm in the middle of every storm. — Anonymous',
  'I am so clever that sometimes I don\'t understand a single word of what I am saying. — Oscar Wilde',
  'Behind every great man is a woman rolling her eyes. — Jim Carrey',
  'Always remember that you are absolutely unique. Just like everyone else. — Margaret Mead',
  'I can resist everything except temptation. — Oscar Wilde',
  'Wine is constant proof that God loves us and loves to see us happy. — Benjamin Franklin',
  'I\'m not superstitious, but I am a little stitious. — Michael Scott (The Office)',
  'My opinions may have changed, but not the fact that I\'m right. — Ashleigh Brilliant',
  'A day without sunshine is like, you know, night. — Steve Martin',
  'If you think you are too small to make a difference, try sleeping with a mosquito. — Dalai Lama',
  'I always wanted to be somebody, but now I realize I should have been more specific. — Lily Tomlin',
  'I am free of all prejudice. I hate everyone equally. — W.C. Fields',
  'I used to think I was indecisive, but now I\'m not so sure. — Tommy Cooper',
  'Better to remain silent and be thought a fool than to speak out and remove all doubt. — Abraham Lincoln',
  'Knowledge is knowing a tomato is a fruit; wisdom is not putting it in a fruit salad. — Miles Kington',
  'I have a lot of growing up to do. I realized that the other day inside my fort. — Zach Galifianakis',
  'Two things are infinite: the universe and human stupidity; and I\'m not sure about the universe. — Albert Einstein',
  'If at first you don\'t succeed, then skydiving definitely isn\'t for you. — Steven Wright',
  'People say nothing is impossible, but I do nothing every day. — A.A. Milne',
  'Life is short. Smile while you still have teeth. — Anonymous',
  'I find television very educating. Every time somebody turns on the set, I go into the other room and read a book. — Groucho Marx',
  'Accept who you are. Unless you\'re a serial killer. — Ellen DeGeneres',
  'I love deadlines. I love the whooshing noise they make as they go by. — Douglas Adams',
  'Money cannot buy happiness, but it can buy ice cream, which is basically the same thing. — Anonymous',
  'Laughter is the shock absorber that eases the blows of life. — Anonymous',
  'I am an early bird and a night owl… so I am wise and I have worms. — Michael Scott',
  'To err is human, to blame it on somebody else shows management potential. — Anonymous',
  'Age is something that doesn\'t matter, unless you are a cheese. — Luis Buñuel',
  'I intend to live forever. So far, so good. — Steven Wright',
  'Never put off till tomorrow what may be done day after tomorrow just as well. — Mark Twain',
  'Everything is funny, as long as it\'s happening to somebody else. — Will Rogers',
  'If you can\'t convince them, confuse them. — Harry S Truman',
  'There\'s a fine line between fishing and just standing on the shore like an idiot. — Steven Wright',
  'Borrow money from a pessimist – they won\'t expect it back. — Oscar Wilde',
  'If you\'re going to tell people the truth, be funny or the\'ll kill you. — Oscar Wilde',
  'Light travels faster than sound. This is why some people appear bright until you hear them speak. — Alan Dundes',
  'Procrastination is the art of keeping up with yesterday. — Don Marquis',
  'Common sense is like deodorant. The people who need it most never use it. — Anonymous',
  'Honesty is the best policy, but insanity is a better defense. — Steve Landesberg',
  'My brain has too many tabs open. — Anonymous',
  'The elevator to success is out of order. You\'ll have to use the stairs... one step at a time. — Joe Girard',
  'I\'m on a seafood diet. I see food and I eat it. — Jackie Gleason',
  'Life happens. Coffee helps. — Anonymous',
  'Rule number one: Don\'t sweat the small stuff. Rule number two: It\'s all small stuff. — Robert Eliot',
  'My life feels like a test I didn\'t study for. — Anonymous',
  'I don\'t need a hair stylist, my pillow gives me a new hairstyle every morning. — Anonymous',
  'Work until your bank account looks like a phone number. — Anonymous',
  'Happiness is having a large, loving, caring, close-knit family in another city. — George Burns',
  'Try to be like the turtle - at ease in your own shell. — Bill Copeland',
  'I\'m not arguing, I\'m just explaining why I\'m right. — Anonymous',
  'Laughter is timeless, imagination has no age, and dreams are forever. — Walt Disney',
  'Be the change that you wish to see in the world. — Mahatma Gandhi',
  'Leadership is not about being in charge. It is about taking care of those in your charge. — Simon Sinek',
  'A leader is one who knows the way, goes the way, and shows the way. — John C. Maxwell',
  'The greatest leader is not necessarily the one who does the greatest things. He is the one that gets the people to do the greatest things. — Ronald Reagan',
  'Innovation distinguishes between a leader and a follower. — Steve Jobs',
  'Do not follow where the path may lead. Go instead where there is no path and leave a trail. — Ralph Waldo Emerson',
  'If your actions inspire others to dream more, learn more, do more and become more, you are a leader. — John Quincy Adams',
  'The only way to make sense out of change is to plunge into it, move with it, and join the dance. — Alan Watts',
  'Progress is impossible without change, and those who cannot change their minds cannot change anything. — George Bernard Shaw',
  'Before you are a leader, success is all about growing yourself. When you become a leader, success is all about growing others. — Jack Welch',
  'To lead people, walk behind them. — Lao Tzu',
  'Leadership is the capacity to translate vision into reality. — Warren Bennis',
  'Management is doing things right; leadership is doing the right things. — Peter Drucker',
  'Become the kind of leader that people would follow voluntarily; even if you had no title or position. — Brian Tracy',
  'Change is the law of life. And those who look only to the past or present are certain to miss the future. — John F. Kennedy',
  'The key to successful leadership today is influence, not authority. — Kenneth H. Blanchard',
  'A genuine leader is not a seeker with consensus, but a molder of consensus. — Martin Luther King Jr.',
  'None of us is as smart as all of us. — Ken Blanchard',
  'You cannot change what you are, only what you do. — Philip Pullman',
  'In times of change, learners inherit the earth, while the learned find themselves beautifully equipped to deal with a world that no longer exists. — Eric Hoffer',
  'The secret of change is to focus all of your energy not on fighting the old, but on building the new. — Socrates',
  'A good leader takes a little more than his share of the blame, a little less than his share of the credit. — Arnold H. Glasow',
  'Great leaders are almost always great simplifiers. — Colin Powell',
  'Lead me, follow me, or get out of my way. — General George S. Patton',
  'The function of leadership is to produce more leaders, not more followers. — Ralph Nader',
  'The measure of intelligence is the ability to change. — Albert Einstein',
  'You don\'t lead by pointing and telling people some place to go. You lead by going to that place and making a case. — Ken Kesey',
  'Change is hard at first, messy in the middle and gorgeous at the end. — Robin Sharma',
  'An inch of progress is better than a mile of intention. — Anonymous',
  'A goal without a plan is just a wish. — Antoine de Saint-Exupéry',
  'If you want to go fast, go alone. If you want to go far, go together. — African Proverb',
  'Whatever got you here won\'t get you there. — Marshall Goldsmith',
  'Daring leaders work from the assumption that people are trying the best they can. — Brené Brown',
  'Small changes make a big difference. — Anonymous',
  'Embrace the discomfort of change. — Anonymous',
  'He who has never learned to obey cannot be a good commander. — Aristotle',
  'To improve is to change; to be perfect is to change often. — Winston Churchill',
  'A leader leads by example, not by force. — Sun Tzu',
  'We cannot become what we need to be by remaining what we are. — John C. Maxwell',
  'True leadership lies in empowering others. — Anonymous',
  'When the wind of change blows, some build walls, while others build windmills. — Chinese Proverb',
  'A brave leader sparks bravery in others. — Anonymous',
  'Change the game, don\'t let the game change you. — Macklemore',
  'Direction is much more important than speed. — Anonymous',
  'Courageous leaders build resilient teams. — Anonymous',
  'True power comes from uplifting others. — Anonymous',
  'To lead is to serve. — Anonymous',
  'When we can no longer change a situation, we are challenged to change ourselves. — Viktor E. Frankl',
  'Every change brings an opportunity. — Anonymous',
  'The future belongs to those who believe in the beauty of their dreams. — Eleanor Roosevelt',
  'Not all those who wander are lost. — J.R.R. Tolkien',
  'Nature does not hurry, yet everything is accomplished. — Lao Tzu',
  'The world is a book and those who do not travel read only one page. — Saint Augustine',
  'In every walk with nature one receives far more than he seeks. — John Muir',
  'Hold fast to dreams, for if dreams die, life is a broken-winged bird that cannot fly. — Langston Hughes',
  'To dream is to unleash the soul. — Anonymous',
  'Study nature, love nature, stay close to nature. It will never fail you. — Frank Lloyd Wright',
  'The earth has music for those who listen. — William Shakespeare',
  'You are never too old to set another goal or to dream a new dream. — C.S. Lewis',
  'I go to nature to be calmed and healed, and to have my senses put in order. — John Burroughs',
  'All that we see or seem is but a dream within a dream. — Edgar Allan Poe',
  'Adventure is worthwhile in itself. — Amelia Earhart',
  'To travel is to live. — Hans Christian Andersen',
  'Adopt the pace of nature: her secret is patience. — Ralph Waldo Emerson',
  'Dream as if you\'ll live forever. Live as if you\'ll die today. — James Dean',
  'Like wildflowers; you must allow yourself to grow in all the places people thought you never would. — E.V.',
  'The mountains are calling and I must go. — John Muir',
  'A journey of a thousand miles begins with a single step. — Lao Tzu',
  'Never stop exploring. — Anonymous',
  'There are no foreign lands. It is the traveler only who is foreign. — Robert Louis Stevenson',
  'Nature is not a place to visit. It is home. — Gary Snyder',
  'Go confidently in the direction of your dreams! Live the life you\'ve imagined. — Henry David Thoreau',
  'Wilderness is not a luxury but a necessity of the human spirit. — Edward Abbey',
  'Keep your face always toward the sunshine—and shadows will fall behind you. — Walt Whitman',
  'Wherever you go becomes a part of you somehow. — Anita Desai',
  'If you can dream it, you can do it. — Walt Disney',
  'Rest is not idleness, and to lie sometimes on the grass under trees... is by no means a waste of time. — John Lubbock',
  'To star-gaze is to travel through time. — Anonymous',
  'The clearest way into the Universe is through a forest wilderness. — John Muir',
  'Throw off the bowlines. Sail away from the safe harbor. Catch the trade winds in your sails. Explore. Dream. Discover. — H. Jackson Brown Jr.',
  'Trees are poems that the earth writes upon the sky. — Khalil Gibran',
  'A dream you dream alone is only a dream. A dream you dream together is reality. — Yoko Ono',
  'Earth laughs in flowers. — Ralph Waldo Emerson',
  'The sea, once it casts its spell, holds one in its net of wonder forever. — Jacques Yves Cousteau',
  'Leave the beaten track behind and dive into the woods. — Alexander Graham Bell',
  'In the depth of winter, I finally learned that within me there lay an invincible summer. — Albert Camus',
  'Every flower is a soul blossoming in nature. — Stéphane Mallarmé',
  'Reach for the stars, and you might just land on the moon. — Anonymous',
  'The sun will rise and we will try again. — Twenty One Pilots',
  'Dreams don\'t work unless you do. — John C. Maxwell',
  'Colors are the smiles of nature. — Leigh Hunt',
  'Nature always wears the colors of the spirit. — Ralph Waldo Emerson',
  'Dare to live the life you have dreamed for yourself. — Ralph Waldo Emerson',
  'Deep in the forest I lose my mind and find my soul. — Anonymous',
  'To sleep, perchance to dream. — William Shakespeare',
  'The horizon changes, but the sun remains the same. — Anonymous',
  'Sky above, earth below, peace within. — Anonymous'
];

/* ---------------- state ---------------- */
const DEFAULT_STATE = {
  profile: { name: '' },
  background: { type: 'gradient', color: '#101820', g1: '#0f2027', g2: '#2c5364', angle: 135, blur: 0, darken: 30, media: null },
  sound: { autoplay: true, shuffle: false, volume: 0.8, tracks: [], lastIndex: 0 },
  widgets: [],
  quotesCustom: []
};
let state = null;

async function loadState() {
  let saved = null;
  try { const d = await chrome.storage.local.get('settings'); saved = d.settings; } catch (e) {}
  if (!saved) return JSON.parse(JSON.stringify(DEFAULT_STATE));
  return {
    ...JSON.parse(JSON.stringify(DEFAULT_STATE)),
    ...saved,
    profile: { ...DEFAULT_STATE.profile, ...(saved.profile || {}) },
    background: { ...DEFAULT_STATE.background, ...(saved.background || {}) },
    sound: { ...DEFAULT_STATE.sound, ...(saved.sound || {}), tracks: Array.isArray(saved.sound?.tracks) ? saved.sound.tracks : [] },
    widgets: Array.isArray(saved.widgets) ? saved.widgets : [],
    quotesCustom: Array.isArray(saved.quotesCustom) ? saved.quotesCustom : []
  };
}

let saveTimer = null;
function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(saveState, 250); }
function saveState() { try { chrome.storage.local.set({ settings: state }); } catch (e) {} }

/* ---------------- widget registry ---------------- */
const WIDGET_DEFS = {
  clock:     { name: 'Clock', icon: '🕒', w: 460, h: 150, hasStyle: true,  defaultSettings: { use24h: false, showSeconds: true, showAmPm: true, padHours: false }, styleOverrides: { fontSize: 64, bgOpacity: 0 }, build: buildClock },
  date:      { name: 'Date', icon: '📅', w: 380, h: 80,  hasStyle: true,  defaultSettings: { weekday: true, year: false }, styleOverrides: { fontSize: 26, bgOpacity: 0 }, build: buildDate },
  greeting:  { name: 'Greeting', icon: '👋', w: 460, h: 90, hasStyle: true, defaultSettings: { name: '' }, styleOverrides: { fontSize: 30, bgOpacity: 0 }, build: buildGreeting },
  search:    { name: 'Search bar', icon: '🔍', w: 520, h: 96, hasStyle: false, defaultSettings: { engine: 'google', placeholder: 'Search the web…' }, styleOverrides: { bgOpacity: .15, radius: 16 }, build: buildSearch },
  links:     { name: 'Quick links', icon: '🔗', w: 480, h: 150, hasStyle: false, defaultSettings: { links: [ { label: 'YouTube', url: 'https://youtube.com' }, { label: 'GitHub', url: 'https://github.com' }, { label: 'Reddit', url: 'https://reddit.com' }, { label: 'Gmail', url: 'https://mail.google.com' } ] }, styleOverrides: { bgOpacity: .15 }, build: buildLinks },
  launchpad: { name: 'Launchpad', icon: '🚀', w: 540, h: 250, hasStyle: false, defaultSettings: { showLabels: true, tiles: [ { label: 'YouTube', url: 'https://youtube.com' }, { label: 'GitHub', url: 'https://github.com' }, { label: 'Gmail', url: 'https://mail.google.com' }, { label: 'Reddit', url: 'https://reddit.com' }, { label: 'ChatGPT', url: 'https://chatgpt.com' } ] }, styleOverrides: { bgOpacity: .15, radius: 18 }, build: buildLaunchpad },
  notes:     { name: 'Notes', icon: '📝', w: 340, h: 260, hasStyle: true, defaultSettings: { text: '' }, styleOverrides: { fontSize: 15, bgOpacity: .35, radius: 14 }, build: buildNotes },
  todo:      { name: 'To-do list', icon: '✅', w: 340, h: 280, hasStyle: true, defaultSettings: { items: [] }, styleOverrides: { fontSize: 14, bgOpacity: .3, radius: 14 }, build: buildTodo },
  quote:     { name: 'Quote', icon: '💬', w: 480, h: 130, hasStyle: true, defaultSettings: { mode: 'load', rotateSec: 30 }, styleOverrides: { fontSize: 19, bgOpacity: .15 }, build: buildQuote },
  spotify:   { name: 'Spotify player', icon: '🎧', w: 380, h: 290, hasStyle: false, defaultSettings: { url: '', volume: 0.8 }, styleOverrides: { bgOpacity: 0, radius: 12 }, build: buildSpotify },
  music:     { name: 'Soundtrack player', icon: '🎼', w: 340, h: 176, hasStyle: false, defaultSettings: {}, styleOverrides: { bgOpacity: .35, radius: 16 }, build: buildMusic },
  weather:   { name: 'Weather', icon: '⛅', w: 330, h: 150, hasStyle: true, defaultSettings: { city: '', unit: 'c' }, styleOverrides: { fontSize: 15, bgOpacity: .25, radius: 16 }, build: buildWeather },
  countdown: { name: 'Countdown', icon: '⏳', w: 340, h: 140, hasStyle: true, defaultSettings: { title: 'My event', date: '', time: '00:00' }, styleOverrides: { fontSize: 16, bgOpacity: .2 }, build: buildCountdown }
};

function defaultSettingsFor(type) {
  const def = WIDGET_DEFS[type];
  const s = JSON.parse(JSON.stringify(def.defaultSettings));
  Object.assign(s, { textColor: '#ffffff', bgColor: '#000000', bgOpacity: .2, radius: 18, fontSize: 24 });
  Object.assign(s, def.styleOverrides || {});
  return s;
}

/* ---------------- background ---------------- */
let bgUrl = null;
async function renderBackground() {
  const b = state.background;
  const layer = document.getElementById('bg-layer');
  const img = document.getElementById('bg-image');
  const vid = document.getElementById('bg-video');
  const ov = document.getElementById('bg-overlay');

  if (b.type === 'solid') layer.style.background = b.color || '#101820';
  else if (b.type === 'gradient') layer.style.background = `linear-gradient(${b.angle || 135}deg, ${b.g1}, ${b.g2})`;
  else layer.style.background = '#0b0e14';

  let rec = null;
  if (b.type === 'image' || b.type === 'video') { try { rec = await dbGet('background'); } catch (e) {} }

  if (bgUrl) { URL.revokeObjectURL(bgUrl); bgUrl = null; }
  img.style.display = 'none';
  vid.style.display = 'none';
  vid.pause(); vid.removeAttribute('src');
  layer.style.display = rec ? 'none' : 'block';

  if (rec) {
    bgUrl = URL.createObjectURL(rec.blob);
    const filter = b.blur ? `blur(${b.blur}px)` : 'none';
    if (rec.mediaType === 'video' && b.type === 'video') {
      vid.src = bgUrl; vid.style.display = 'block'; vid.style.filter = filter;
      vid.play().catch(() => {});
    } else {
      img.src = bgUrl; img.style.display = 'block'; img.style.filter = filter;
    }
  }
  ov.style.opacity = (b.darken ?? 0) / 100;
}

async function setBackgroundFile(file) {
  const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
  await dbPut({ id: 'background', kind: 'background', mediaType, name: file.name, blob: file });
  state.background.type = mediaType;
  state.background.media = { mediaType, name: file.name };
  scheduleSave();
  await renderBackground();
  toast('Background updated.');
  refreshSettingsDynamic();
}

async function removeBackgroundMedia() {
  try { await dbDelete('background'); } catch (e) {}
  state.background.media = null;
  state.background.type = 'gradient';
  scheduleSave();
  await renderBackground();
  refreshSettingsDynamic();
}

/* ---------------- audio engine ---------------- */
const audioEl = new Audio();
let currentTrackId = null, currentUrl = null, playingIndex = -1, autoplayBlocked = false;
const musicCtrls = new Set();

const tracks = () => state.sound.tracks;
const findTrackIndex = id => tracks().findIndex(t => t.id === id);

async function playIndex(i) {
  const list = tracks();
  if (!list.length) return;
  i = ((i % list.length) + list.length) % list.length;
  const t = list[i];
  const rec = await dbGet(t.id);
  if (!rec) { toast(`"${t.title}" is missing its file — removing it.`); removeTrack(t.id, true); return; }
  if (currentUrl) URL.revokeObjectURL(currentUrl);
  currentUrl = URL.createObjectURL(rec.blob);
  audioEl.src = currentUrl;
  currentTrackId = t.id; playingIndex = i;
  state.sound.lastIndex = i; scheduleSave();
  await audioEl.play();
  autoplayBlocked = false;
  updateMusicCtrls();
}

function blockedHint() {
  if (!autoplayBlocked) {
    autoplayBlocked = true;
    toast('▶ Chrome blocked autoplay — press play on the soundtrack widget to start your music.');
  }
  updateMusicCtrls();
}

function togglePlay() {
  if (!tracks().length) { document.getElementById('file-audio').click(); return; }
  if (audioEl.paused) {
    if (currentTrackId) audioEl.play().catch(blockedHint);
    else playIndex(state.sound.lastIndex || 0).catch(blockedHint);
  } else audioEl.pause();
}

function nextTrack() {
  const n = tracks().length; if (!n) return;
  let i;
  if (state.sound.shuffle && n > 1) { do { i = Math.floor(Math.random() * n); } while (i === playingIndex); }
  else i = playingIndex + 1;
  playIndex(i).catch(blockedHint);
}

function prevTrack() {
  if (audioEl.currentTime > 3) { audioEl.currentTime = 0; return; }
  playIndex(playingIndex - 1).catch(blockedHint);
}

audioEl.addEventListener('play', updateMusicCtrls);
audioEl.addEventListener('pause', updateMusicCtrls);
audioEl.addEventListener('timeupdate', () => musicCtrls.forEach(c => c.progress()));
audioEl.addEventListener('ended', () => nextTrack());

function updateMusicCtrls() { musicCtrls.forEach(c => c.update()); }

async function removeTrack(id, silent) {
  const i = findTrackIndex(id); if (i < 0) return;
  tracks().splice(i, 1);
  try { await dbDelete(id); } catch (e) {}
  if (currentTrackId === id) {
    audioEl.pause(); audioEl.removeAttribute('src');
    currentTrackId = null; playingIndex = -1;
    if (currentUrl) { URL.revokeObjectURL(currentUrl); currentUrl = null; }
  }
  if (playingIndex >= tracks().length) playingIndex = tracks().length - 1;
  scheduleSave(); renderTrackLists(); updateMusicCtrls();
  if (!silent) toast('Track removed.');
}

function readDuration(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const a = new Audio(); a.preload = 'metadata';
    a.onloadedmetadata = () => { const d = a.duration; URL.revokeObjectURL(url); resolve(d); };
    a.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unreadable')); };
    a.src = url;
  });
}

async function importAudioFiles(fileList) {
  const files = [...fileList].filter(f => f.type.startsWith('audio/') || /\.(mp3|wav|ogg|oga|m4a|aac|flac|opus|weba|webm)$/i.test(f.name));
  if (!files.length) { toast('No audio files found in that selection.'); return; }
  const room = MAX_TRACKS - tracks().length;
  if (room <= 0) { toast(`Soundtrack library is full (${MAX_TRACKS} tracks max).`); return; }

  const rejected = []; let added = 0;
  for (const f of files) {
    if (added >= room) { rejected.push({ name: f.name, why: 'limit reached' }); continue; }
    let d;
    try { d = await readDuration(f); } catch { rejected.push({ name: f.name, why: 'unreadable' }); continue; }
    if (!isFinite(d) || d <= 0) { rejected.push({ name: f.name, why: 'unreadable' }); continue; }
    if (d > MAX_TRACK_SECONDS + 0.5) { rejected.push({ name: f.name, why: fmtDur(d) + ' > 8:00' }); continue; }
    const id = 't_' + uid();
    const title = f.name.replace(/\.[^.]+$/, '');
    await dbPut({ id, kind: 'audio', title, mime: f.type || 'audio/mpeg', duration: d, blob: f });
    tracks().push({ id, title, duration: d });
    added++;
  }
  scheduleSave(); renderTrackLists(); updateMusicCtrls();

  let msg = `Added ${added} track${added === 1 ? '' : 's'} (${tracks().length}/${MAX_TRACKS}).`;
  if (rejected.length) {
    msg += `\n\nRejected ${rejected.length}:\n` + rejected.map(r => `• ${r.name} — ${r.why}`).join('\n');
    alert(msg);
  } else toast(msg, 4000);
}

function renderTrackLists() {
  const box = document.getElementById('sp-tracks'); if (!box) return;
  const count = document.getElementById('sp-track-count');
  if (count) count.textContent = `${tracks().length} / ${MAX_TRACKS} tracks`;
  box.textContent = '';
  const list = tracks();
  if (!list.length) { box.append(elm('div', 'empty-hint', 'No tracks yet. Import up to 50 files (max 8 minutes each).')); return; }
  list.forEach(t => {
    const row = div('track-row');
    row.append(elm('span', 'track-title', t.title), elm('span', 'track-dur', fmtDur(t.duration)));
    const del = elm('button', 'track-del', '✕');
    del.addEventListener('click', () => removeTrack(t.id));
    row.append(del);
    box.append(row);
  });
}

/* ---------------- widget builders ---------------- */
function formatTime(d, s) {
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const sec = String(d.getSeconds()).padStart(2, '0');
  let suffix = '';
  if (!s.use24h) { suffix = h >= 12 ? ' PM' : ' AM'; h = h % 12 || 12; }
  let t = (s.padHours ? String(h).padStart(2, '0') : String(h)) + ':' + m;
  if (s.showSeconds) t += ':' + sec;
  if (!s.use24h && s.showAmPm) t += suffix;
  return t;
}

function buildClock(w) {
  const elx = elm('div', 'clock-face');
  const upd = () => { elx.textContent = formatTime(new Date(), w.settings); };
  upd();
  return { root: elx, tick: upd };
}

function buildDate(w) {
  const elx = elm('div', 'date-face');
  const upd = () => {
    const d = new Date(), o = {};
    if (w.settings.weekday !== false) o.weekday = 'long';
    o.month = 'long'; o.day = 'numeric';
    if (w.settings.year) o.year = 'numeric';
    elx.textContent = d.toLocaleDateString(undefined, o);
  };
  upd();
  return { root: elx, tick: upd };
}

function buildGreeting(w) {
  const elx = elm('div', 'greeting-face');
  const upd = () => {
    const h = new Date().getHours();
    const part = h < 5 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
    const icon = { morning: '🌤️', afternoon: '☀️', evening: '🌇', night: '🌙' }[part];
    const name = (w.settings.name || state.profile.name || '').trim();
    elx.textContent = `Good ${part}${name ? ', ' + name : ''} ${icon}`;
  };
  upd();
  return { root: elx, tick: upd };
}

function buildSearch(w) {
  const s = w.settings;
  const form = elm('form', 'search-form');
  const input = elm('input', 'search-input'); input.type = 'text';
  input.placeholder = s.placeholder || 'Search…';
  const btn = elm('button', 'search-btn', 'Search'); btn.type = 'submit';
  form.append(input, btn);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const q = input.value.trim(); if (!q) return;
    window.location.href = (ENGINES[s.engine] || ENGINES.google) + encodeURIComponent(q);
  });
  return { root: form };
}

function hashColor(str) { let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) >>> 0; return `hsl(${h % 360},60%,45%)`; }
function prettyUrl(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } }
function normalizeUrl(u) {
  u = (u || '').trim();
  if (!u) return '';
  if (!/^[a-z]+:\/\//i.test(u)) u = 'https://' + u;
  return u;
}

function spotifyUri(url) {
  if (!url) return null;
  const m = url.trim().match(/(?:open\.spotify\.com\/(?:intl-[a-z]{2}(?:-[a-z]{2})?\/)?(?:embed\/)?|spotify:)(track|playlist|album|artist|show|episode)[\/:]([A-Za-z0-9]+)/i);
  return m ? `spotify:${m[1].toLowerCase()}:${m[2]}` : null;
}

function buildLinks(w) {
  const grid = div('links-grid');
  for (const l of (w.settings.links || [])) {
    if (!l.url) continue;
    const a = elm('a', 'link-chip'); a.href = l.url;
    const av = elm('span', 'link-avatar', (l.label || l.url)[0].toUpperCase());
    av.style.background = hashColor(l.label || l.url);
    a.append(av, elm('span', '', l.label || prettyUrl(l.url)));
    grid.append(a);
  }
  if (!grid.children.length) grid.append(elm('div', 'empty-hint', 'No links yet — open this widget\'s ⚙ settings to add some.'));
  return { root: grid };
}

function buildNotes(w) {
  const ta = elm('textarea', 'notes-area');
  ta.placeholder = 'Type your notes here…';
  ta.value = w.settings.text || '';
  ta.addEventListener('input', () => { w.settings.text = ta.value; scheduleSave(); });
  return { root: ta };
}

function buildTodo(w) {
  const s = w.settings; s.items = s.items || [];
  const root = div('todo');
  const form = elm('form', 'todo-form');
  const input = elm('input', 'todo-input'); input.type = 'text'; input.placeholder = 'Add a task…';
  const add = elm('button', 'todo-add', '+'); add.type = 'submit';
  form.append(input, add);
  const list = div('todo-list');
  root.append(form, list);

  function render() {
    list.textContent = '';
    if (!s.items.length) list.append(elm('div', 'empty-hint', 'Nothing to do 🎉'));
    s.items.forEach((item, idx) => {
      const row = div('todo-item' + (item.done ? ' done' : ''));
      const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = item.done;
      cb.addEventListener('change', () => { item.done = cb.checked; scheduleSave(); render(); });
      const label = elm('span', '', item.text);
      const del = elm('button', 'todo-del', '✕');
      del.addEventListener('click', () => { s.items.splice(idx, 1); scheduleSave(); render(); });
      row.append(cb, label, del);
      list.append(row);
    });
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    const t = input.value.trim(); if (!t) return;
    s.items.push({ text: t, done: false });
    input.value = ''; scheduleSave(); render();
  });
  render();
  return { root };
}

function buildQuote(w) {
  const s = w.settings;
  const root = div('quote-wrap');
  const text = elm('p', 'quote-text');
  const btn = elm('button', 'quote-refresh', '↻ new quote');
  root.append(text, btn);
  let last = -1;
  const pick = () => {
    const pool = QUOTES.concat(state.quotesCustom);
    if (!pool.length) return;
    let i; do { i = Math.floor(Math.random() * pool.length); } while (pool.length > 1 && i === last);
    last = i;
    text.textContent = '“' + pool[i] + '”';
  };
  btn.addEventListener('click', pick);
  pick();
  let timer = null;
  if (s.mode === 'rotate') timer = setInterval(pick, Math.max(5, s.rotateSec || 30) * 1000);
  return { root, destroy() { if (timer) clearInterval(timer); } };
}

function spotifyEmbedUrl(url) {
  if (!url) return null;
  const m = url.trim().match(/(?:open\.spotify\.com\/(?:intl-[a-z]{2}(?:-[a-z]{2})?\/)?(?:embed\/)?|spotify:)(track|playlist|album|artist|show|episode)[\/:]([A-Za-z0-9]+)/i);
  return m ? `https://open.spotify.com/embed/${m[1].toLowerCase()}/${m[2]}` : null;
}

function buildSpotify(w) {
  const s = w.settings;
  if (typeof s.volume !== 'number') s.volume = 0.8;
  const embed = spotifyEmbedUrl(s.url || '');

  if (!embed) {
    const hint = div('spotify-empty');
    hint.textContent = "🎧 Open this widget's settings (editor mode → ⚙) and paste a Spotify track / playlist / album link. The player gets its own volume slider + mute.";
    return { root: hint };
  }

  const root = div('spotify-widget');
  const frameWrap = div('spotify-frame-wrap');
  const frame = document.createElement('iframe');
  frame.className = 'spotify-frame';
  frame.src = 'spotify-sandbox.html';
  frame.allow = 'autoplay; encrypted-media; picture-in-picture';
  frameWrap.append(frame);

  const bar = div('spotify-bar');
  const icon = document.createElement('button');
  icon.className = 'spotify-vol-icon'; icon.textContent = '🔊'; icon.title = 'Mute / unmute';
  const slider = document.createElement('input');
  slider.type = 'range'; slider.min = 0; slider.max = 1; slider.step = 0.01; slider.value = s.volume;
  const pct = elm('span', 'spotify-vol-pct', Math.round(s.volume * 100) + '%');
  bar.append(icon, slider, pct);
  root.append(frameWrap, bar);

  let fellBack = false, gotReady = false, watchdog = null;

  const post = (action, value) => {
    if (fellBack) return;
    try { frame.contentWindow.postMessage({ type: 'nts_spotify', action, value, uri: spotifyUri(s.url) }, '*'); } catch (e) {}
  };

  function startWatchdog() {
    clearTimeout(watchdog);
    watchdog = setTimeout(() => {
      if (!gotReady && !fellBack) fallback('controller timed out after 9s');
    }, 9000);
  }

  let lastVolBeforeMute = s.volume || 0.8;
  function paintVol() {
    pct.textContent = Math.round(s.volume * 100) + '%';
    icon.textContent = s.volume === 0 ? '🔇' : s.volume < 0.5 ? '🔉' : '🔊';
  }
  function setVol(v) {
    v = clamp(v, 0, 1);
    s.volume = v; slider.value = v;
    paintVol(); post('setVolume', v);
    scheduleSave();
  }

  slider.addEventListener('input', () => setVol(+slider.value));
  icon.addEventListener('click', () => {
    if (s.volume > 0) { lastVolBeforeMute = s.volume; setVol(0); }
    else setVol(lastVolBeforeMute || 0.8);
  });

  frame.addEventListener('load', () => { post('load'); startWatchdog(); });

  const onMsg = e => {
    if (fellBack) return;
    const m = e.data;
    if (!m || m.type !== 'nts_spotify_host') return;
    if (m.event === 'api_ready') post('load');
    if (m.event === 'api_ready' || m.event === 'ready') post('setVolume', s.volume);
    if (m.event === 'ready') { gotReady = true; clearTimeout(watchdog); }
    if ((m.event === 'api_error' || m.event === 'error') && !gotReady) {
      fallback(m.message || 'controller failed');
    }
  };
  window.addEventListener('message', onMsg);

  function fallback(reason) {
    if (fellBack) return;
    fellBack = true;
    clearTimeout(watchdog);
    console.warn('[NewTabStudio] Spotify volume unavailable:', reason);
    frameWrap.textContent = '';
    const f2 = document.createElement('iframe');
    f2.className = 'spotify-frame';
    f2.src = embed;
    f2.allow = 'autoplay; encrypted-media; picture-in-picture';
    frameWrap.append(f2);
    bar.textContent = '';
    bar.append(elm('span', 'spotify-fallback-note', '⚠ volume unavailable — ' + reason));
  }

  paintVol();
  return { root, destroy() { window.removeEventListener('message', onMsg); clearTimeout(watchdog); } };
}

function buildMusic() {
  const root = div('music');
  const titleRow = div('music-title');
  const note = elm('span', '', '♪');
  const title = elm('span', 'music-name', 'No tracks yet');
  titleRow.append(note, title);

  const bar = document.createElement('input');
  bar.type = 'range'; bar.className = 'music-bar'; bar.min = 0; bar.max = 100; bar.step = 0.1; bar.value = 0;

  const times = div('music-times');
  const tCur = elm('span', '', '0:00'), tDur = elm('span', '', '0:00');
  times.append(tCur, tDur);

  const row = div('music-row');
  const bPrev = elm('button', '', '⏮'), bPlay = elm('button', 'music-play', '▶'), bNext = elm('button', '', '⏭');
  const volWrap = div('music-vol');
  const vol = document.createElement('input');
  vol.type = 'range'; vol.min = 0; vol.max = 1; vol.step = 0.01; vol.value = audioEl.volume;
  volWrap.append(elm('span', '', '🔊'), vol);
  const bList = elm('button', '', '☰'), bAdd = elm('button', '', '＋');
  row.append(bPrev, bPlay, bNext, volWrap, bList, bAdd);

  root.append(titleRow, bar, times, row);
  const popup = div('music-list hidden');

  bPlay.addEventListener('click', togglePlay);
  bNext.addEventListener('click', nextTrack);
  bPrev.addEventListener('click', prevTrack);
  bAdd.addEventListener('click', () => document.getElementById('file-audio').click());
  bList.addEventListener('click', () => { popup.classList.toggle('hidden'); renderPopup(); });
  vol.addEventListener('input', () => { state.sound.volume = +vol.value; audioEl.volume = +vol.value; scheduleSave(); });
  bar.addEventListener('input', () => { if (audioEl.duration) audioEl.currentTime = (+bar.value / 100) * audioEl.duration; });

  function renderPopup() {
    popup.textContent = '';
    const list = tracks();
    if (!list.length) { popup.append(elm('div', 'empty-hint', 'No tracks — click ＋ to import (max 50 files, 8 min each).')); return; }
    list.forEach((t, i) => {
      const r = div('music-track' + (t.id === currentTrackId ? ' active' : ''));
      r.append(elm('span', 'mt-title', t.title), elm('span', 'mt-dur', fmtDur(t.duration)));
      const del = elm('button', 'mt-del', '✕');
      del.addEventListener('click', e => { e.stopPropagation(); removeTrack(t.id); renderPopup(); });
      r.append(del);
      r.addEventListener('click', () => playIndex(i).catch(blockedHint));
      popup.append(r);
    });
  }

  const ctrl = {
    update() {
      const t = tracks()[playingIndex];
      title.textContent = t ? t.title : (tracks().length ? 'Paused' : 'No tracks yet — click ＋');
      bPlay.textContent = (!audioEl.paused && !audioEl.ended) ? '⏸' : '▶';
      root.classList.toggle('blocked', autoplayBlocked && audioEl.paused);
      ctrl.progress();
      if (!popup.classList.contains('hidden')) renderPopup();
    },
    progress() {
      if (audioEl.duration) bar.value = (audioEl.currentTime / audioEl.duration) * 100;
      tCur.textContent = fmtDur(audioEl.currentTime || 0);
      tDur.textContent = fmtDur(audioEl.duration || (tracks()[playingIndex]?.duration || 0));
    }
  };
  musicCtrls.add(ctrl);
  ctrl.update();

  return {
    root,
    destroy() { musicCtrls.delete(ctrl); },
    afterMount(host) { host.append(popup); }
  };
}

/* --- Launchpad: up to 10 sites with live website icons --- */
function buildLaunchpad(w) {
  const s = w.settings;
  const grid = div('launchpad-grid');
  const tiles = (s.tiles || []).filter(t => t && t.url).slice(0, 10);
  if (!tiles.length) {
    grid.append(elm('div', 'empty-hint', 'No sites yet — open this widget\'s ⚙ settings to add up to 10.'));
    return { root: grid };
  }
  tiles.forEach(t => {
    const url = normalizeUrl(t.url);
    const host = prettyUrl(url);
    const a = elm('a', 'launchpad-tile');
    a.href = url; a.title = t.label || host;
    const imgWrap = div('launchpad-img');
    const img = document.createElement('img');
    img.loading = 'lazy'; img.alt = ''; img.referrerPolicy = 'no-referrer';
    img.src = 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(host) + '&sz=128';
    img.addEventListener('error', () => {
      const av = elm('div', 'launchpad-avatar', (t.label || host)[0].toUpperCase());
      av.style.background = hashColor(host);
      if (img.parentNode) img.parentNode.replaceChild(av, img);
    });
    imgWrap.append(img);
    a.append(imgWrap);
    if (s.showLabels !== false) a.append(elm('span', 'launchpad-label', t.label || host));
    grid.append(a);
  });
  return { root: grid };
}

/* --- Weather (Open-Meteo, no API key) --- */
function weatherCodeInfo(code) {
  if (code === 0) return { icon: '☀️', label: 'Clear' };
  if (code <= 2) return { icon: '🌤️', label: 'Partly cloudy' };
  if (code === 3) return { icon: '☁️', label: 'Overcast' };
  if (code <= 48) return { icon: '🌫️', label: 'Foggy' };
  if (code <= 57) return { icon: '🌦️', label: 'Drizzle' };
  if (code <= 67) return { icon: '🌧️', label: 'Rain' };
  if (code <= 77) return { icon: '🌨️', label: 'Snow' };
  if (code <= 82) return { icon: '🌧️', label: 'Showers' };
  if (code <= 86) return { icon: '🌨️', label: 'Snow showers' };
  return { icon: '⛈️', label: 'Thunderstorm' };
}

function buildWeather(w) {
  const s = w.settings;
  const root = div('weather');
  const box = div('weather-box');
  const status = elm('div', 'weather-status', 'Loading…');
  box.append(status);
  root.append(box);

  let cancelled = false;

  async function load() {
    const city = (s.city || '').trim();
    if (!city) { status.textContent = '⚙ Set a city in this widget\'s settings'; return; }
    status.textContent = 'Loading…';
    try {
      const geo = await fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(city) + '&count=1&language=en&format=json').then(r => r.json());
      if (cancelled) return;
      const place = geo?.results?.[0];
      if (!place) { status.textContent = `City "${city}" not found`; return; }
      const wx = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + place.latitude + '&longitude=' + place.longitude +
        '&current=temperature_2m,apparent_temperature,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1').then(r => r.json());
      if (cancelled) return;
      render(place, wx);
    } catch (e) {
      if (!cancelled) status.textContent = 'Weather failed — check your connection';
    }
  }

  function render(place, wx) {
    box.textContent = '';
    const cur = wx.current;
    const unitC = s.unit !== 'f';
    const conv = t => unitC ? Math.round(t) : Math.round(t * 9 / 5 + 32);
    const info = weatherCodeInfo(cur.weather_code);

    const main = div('weather-main');
    main.append(elm('div', 'weather-icon', info.icon));
    const tempCol = div('weather-tempcol');
    tempCol.append(elm('div', 'weather-temp', `${conv(cur.temperature_2m)}°${unitC ? 'C' : 'F'}`));
    tempCol.append(elm('div', 'weather-desc', info.label));
    main.append(tempCol);

    const side = div('weather-side');
    side.append(elm('div', 'weather-city', place.name));
    const hi = wx.daily?.temperature_2m_max?.[0], lo = wx.daily?.temperature_2m_min?.[0];
    if (hi != null && lo != null) side.append(elm('div', 'weather-hilo', `H ${conv(hi)}° · L ${conv(lo)}°`));
    side.append(elm('div', 'weather-feels', `Feels like ${conv(cur.apparent_temperature)}°`));

    box.append(main, side);
  }

  load();
  const timer = setInterval(load, 30 * 60 * 1000); // refresh every 30 minutes
  return { root, destroy() { cancelled = true; clearInterval(timer); } };
}

/* --- Countdown --- */
function buildCountdown(w) {
  const s = w.settings;
  const root = div('countdown');
  const title = elm('div', 'countdown-title', s.title || 'Countdown');
  const big = elm('div', 'countdown-big', '—');
  const sub = elm('div', 'countdown-sub', '');
  root.append(title, big, sub);

  function tick() {
    if (!s.date) { big.textContent = '⚙'; sub.textContent = 'Set a date in this widget\'s settings'; return; }
    const target = new Date(s.date + 'T' + (s.time || '00:00'));
    const diff = target - Date.now();
    if (isNaN(target.getTime())) { big.textContent = '⚠️'; sub.textContent = 'Invalid date'; return; }
    if (diff <= 0) { big.textContent = '🎉'; sub.textContent = 'It\'s time!'; return; }
    const d = Math.floor(diff / 86400000);
    const h = String(Math.floor(diff / 3600000) % 24).padStart(2, '0');
    const m = String(Math.floor(diff / 60000) % 60).padStart(2, '0');
    const sec = String(Math.floor(diff / 1000) % 60).padStart(2, '0');
    big.textContent = d > 0 ? `${d}d ${h}:${m}:${sec}` : `${h}:${m}:${sec}`;
    sub.textContent = d > 0 ? 'days · hrs : min : sec' : 'hrs : min : sec';
  }
  tick();
  const timer = setInterval(tick, 1000);
  return { root, destroy() { clearInterval(timer); } };
}

/* ---------------- widget rendering / drag / resize ---------------- */
const widgetsEl = document.getElementById('widgets');
const runtime = new Map();

function applyPos(host, w) {
  host.style.left = w.x + '%';
  host.style.top = w.y + '%';
  host.style.width = w.w + 'px';
  host.style.height = w.h + 'px';
}

function applyWidgetStyles(w, box) {
  const s = w.settings;
  box.style.borderRadius = (s.radius ?? 18) + 'px';
  box.style.background = hexToRgba(s.bgColor || '#000000', s.bgOpacity ?? 0.2);
  if (WIDGET_DEFS[w.type].hasStyle) {
    const c = box.querySelector('.widget-content');
    c.style.color = s.textColor || '#fff';
    c.style.fontSize = (s.fontSize ?? 24) + 'px';
  }
}

function renderWidgets() {
  runtime.forEach(rt => rt.destroy && rt.destroy());
  runtime.clear();
  widgetsEl.textContent = '';
  state.widgets.forEach((w, i) => widgetsEl.append(createWidgetNode(w, i)));
}

function createWidgetNode(w, zIndex) {
  const def = WIDGET_DEFS[w.type];
  const host = div('widget type-' + w.type);
  host.dataset.id = w.id;
  host.style.zIndex = 10 + zIndex;
  if (!w.visible) host.classList.add('is-hidden');

  const toolbar = div('widget-toolbar');
  const bSet = elm('button', '', '⚙'); bSet.title = 'Widget settings';
  const bHide = elm('button', '', w.visible ? '👁' : '🚫'); bHide.title = 'Show / hide on new tab';
  const bFront = elm('button', '', '⬆'); bFront.title = 'Bring to front';
  const bDel = elm('button', '', '🗑'); bDel.title = 'Delete widget';
  toolbar.append(bSet, bHide, bFront, bDel);

  const box = div('widget-box');
  const content = div('widget-content');
  const built = def.build(w);
  content.append(built.root);
  box.append(content);

  const handle = div('resize-handle'); handle.title = 'Drag to resize';

  host.append(toolbar, box, handle);
  if (built.afterMount) built.afterMount(host);
  runtime.set(w.id, built);
  applyPos(host, w);
  applyWidgetStyles(w, box);

  bSet.addEventListener('click', e => { e.stopPropagation(); openWidgetSettings(w); });
  bHide.addEventListener('click', e => {
    e.stopPropagation();
    w.visible = !w.visible;
    host.classList.toggle('is-hidden', !w.visible);
    bHide.textContent = w.visible ? '👁' : '🚫';
    scheduleSave();
  });
  bFront.addEventListener('click', e => {
    e.stopPropagation();
    const i = state.widgets.indexOf(w);
    if (i > -1) { state.widgets.splice(i, 1); state.widgets.push(w); }
    scheduleSave(); renderWidgets();
  });
  bDel.addEventListener('click', e => {
    e.stopPropagation();
    if (!confirm('Delete this ' + def.name + ' widget?')) return;
    const rt = runtime.get(w.id); if (rt && rt.destroy) rt.destroy();
    runtime.delete(w.id);
    state.widgets = state.widgets.filter(x => x.id !== w.id);
    scheduleSave(); renderWidgets();
  });

  attachDrag(host, w);
  attachResize(host, w, handle);
  return host;
}

function rebuildWidget(id) {
  const w = state.widgets.find(x => x.id === id);
  const host = widgetsEl.querySelector(`.widget[data-id="${id}"]`);
  if (!w || !host) { renderWidgets(); return; }
  const rt = runtime.get(id); if (rt && rt.destroy) rt.destroy();
  const box = host.querySelector('.widget-box');
  const old = box.querySelector('.widget-content');
  host.querySelectorAll('.music-list').forEach(n => n.remove());
  const content = div('widget-content');
  const built = WIDGET_DEFS[w.type].build(w);
  content.append(built.root);
  box.replaceChild(content, old);
  if (built.afterMount) built.afterMount(host);
  runtime.set(id, built);
  applyWidgetStyles(w, box);
}

function attachDrag(host, w) {
  host.addEventListener('pointerdown', e => {
    if (!document.body.classList.contains('editing')) return;
    if (e.button !== 0) return;
    if (e.target.closest('.widget-toolbar') || e.target.closest('.resize-handle')) return;
    e.preventDefault();
    host.setPointerCapture(e.pointerId);
    const sx = e.clientX, sy = e.clientY, ox = w.x, oy = w.y;
    const vw = innerWidth, vh = innerHeight;
    document.body.classList.add('dragging');
    const move = ev => {
      let nx = ox / 100 * vw + (ev.clientX - sx);
      let ny = oy / 100 * vh + (ev.clientY - sy);
      nx = clamp(nx, 0, Math.max(0, vw - w.w));
      ny = clamp(ny, 0, Math.max(0, vh - w.h));
      w.x = nx / vw * 100; w.y = ny / vh * 100;
      applyPos(host, w);
    };
    const up = () => {
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerup', up);
      host.removeEventListener('pointercancel', up);
      document.body.classList.remove('dragging');
      scheduleSave();
    };
    host.addEventListener('pointermove', move);
    host.addEventListener('pointerup', up);
    host.addEventListener('pointercancel', up);
  });
}

function attachResize(host, w, handle) {
  handle.addEventListener('pointerdown', e => {
    if (!document.body.classList.contains('editing')) return;
    e.preventDefault(); e.stopPropagation();
    handle.setPointerCapture(e.pointerId);
    const sx = e.clientX, sy = e.clientY, ow = w.w, oh = w.h;
    const maxW = innerWidth - (w.x / 100 * innerWidth);
    const maxH = innerHeight - (w.y / 100 * innerHeight);
    const move = ev => {
      w.w = clamp(ow + (ev.clientX - sx), 110, maxW);
      w.h = clamp(oh + (ev.clientY - sy), 54, maxH);
      applyPos(host, w);
    };
    const up = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
      scheduleSave();
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  });
}

function addWidget(type) {
  const def = WIDGET_DEFS[type];
  const w = {
    id: uid(), type, visible: true, w: def.w, h: def.h,
    x: clamp(50 - (def.w / innerWidth) * 50, 1, 80),
    y: clamp(38 - (def.h / innerHeight) * 50, 1, 80),
    settings: defaultSettingsFor(type)
  };
  state.widgets.push(w);
  scheduleSave(); renderWidgets();
  toast(def.name + ' added — press E (or ✏️) to move & resize it.');
}

/* ---------------- modals ---------------- */
function openModal(node) {
  closeAllModals();
  const bd = div('modal-backdrop');
  bd.append(node);
  bd.addEventListener('pointerdown', e => { if (e.target === bd) closeAllModals(); });
  document.body.append(bd);
}
function closeAllModals() {
  document.querySelectorAll('.modal-backdrop').forEach(n => n.remove());
  settingsOpen = false;
}

/* field helpers */
function fieldRow(label, control) { const r = div('field'); r.append(elm('label', '', label), control); return r; }
function mkToggle(draft, key) {
  const c = document.createElement('input'); c.type = 'checkbox'; c.checked = !!draft[key];
  c.addEventListener('change', () => draft[key] = c.checked);
  return c;
}
function toggleRow(label, draft, key) { return fieldRow(label, mkToggle(draft, key)); }
function mkText(draft, key, ph) {
  const c = document.createElement('input'); c.type = 'text'; c.value = draft[key] || '';
  if (ph) c.placeholder = ph;
  c.addEventListener('input', () => draft[key] = c.value);
  return c;
}
function mkSelect(draft, key, options) {
  const s = document.createElement('select');
  options.forEach(([v, l]) => s.append(new Option(l, v)));
  s.value = draft[key];
  s.addEventListener('change', () => draft[key] = s.value);
  return s;
}

function mkDate(draft, key) {
  const c = document.createElement('input'); c.type = 'date'; c.value = draft[key] || '';
  const set = () => { draft[key] = c.value; };
  c.addEventListener('change', set); c.addEventListener('input', set);
  return c;
}
function mkTime(draft, key) {
  const c = document.createElement('input'); c.type = 'time'; c.value = draft[key] || '00:00';
  const set = () => { draft[key] = c.value; };
  c.addEventListener('change', set); c.addEventListener('input', set);
  return c;
}
function mkRange(draft, key, min, max, step, fmt = v => v) {
  const wrap = div('range-wrap');
  const r = document.createElement('input');
  r.type = 'range'; r.min = min; r.max = max; r.step = step || 1; r.value = draft[key];
  const lab = elm('span', 'range-val', fmt(draft[key]));
  r.addEventListener('input', () => { draft[key] = +r.value; lab.textContent = fmt(+r.value); });
  wrap.append(r, lab);
  return wrap;
}
function colorRow(label, draft, key) {
  const c = document.createElement('input'); c.type = 'color'; c.value = draft[key] || '#ffffff';
  c.addEventListener('input', () => draft[key] = c.value);
  return fieldRow(label, c);
}
function stateToggleRow(label, get, set) {
  const c = document.createElement('input'); c.type = 'checkbox'; c.checked = get();
  c.addEventListener('change', () => { set(c.checked); scheduleSave(); });
  return fieldRow(label, c);
}
function stateRangeRow(label, val, min, max, step, onSet, fmt = v => v) {
  const wrap = div('range-wrap');
  const r = document.createElement('input');
  r.type = 'range'; r.min = min; r.max = max; r.step = step; r.value = val;
  const lab = elm('span', 'range-val', fmt(val));
  r.addEventListener('input', () => { onSet(+r.value); lab.textContent = fmt(+r.value); });
  wrap.append(r, lab);
  return fieldRow(label, wrap);
}

function typeFields(type, draft, getQuotes, setQuotes) {
  const F = [];
  if (type === 'clock') {
    F.push(toggleRow('24-hour format', draft, 'use24h'));
    F.push(toggleRow('Show seconds', draft, 'showSeconds'));
    F.push(toggleRow('Show AM / PM', draft, 'showAmPm'));
    F.push(toggleRow('Pad hours (09:05)', draft, 'padHours'));
  } else if (type === 'date') {
    F.push(toggleRow('Show weekday', draft, 'weekday'));
    F.push(toggleRow('Show year', draft, 'year'));
  } else if (type === 'greeting') {
    F.push(fieldRow('Name (blank = profile name)', mkText(draft, 'name', 'e.g. Alex')));
  } else if (type === 'search') {
    F.push(fieldRow('Search engine', mkSelect(draft, 'engine', [['google', 'Google'], ['duckduckgo', 'DuckDuckGo'], ['bing', 'Bing'], ['youtube', 'YouTube']])));
    F.push(fieldRow('Placeholder text', mkText(draft, 'placeholder', 'Search…')));
  } else if (type === 'links') {
    F.push(linksEditor(draft));
  } else if (type === 'launchpad') {
    F.push(toggleRow('Show labels', draft, 'showLabels'));
    F.push(launchpadEditor(draft));
  } else if (type === 'weather') {
    F.push(fieldRow('City', mkText(draft, 'city', 'e.g. Tokyo')));
    F.push(fieldRow('Units', mkSelect(draft, 'unit', [['c', 'Celsius (°C)'], ['f', 'Fahrenheit (°F)']])));
  } else if (type === 'countdown') {
    F.push(fieldRow('Title', mkText(draft, 'title', 'e.g. Vacation')));
    F.push(fieldRow('Date', mkDate(draft, 'date')));
    F.push(fieldRow('Time', mkTime(draft, 'time')));
  } else if (type === 'quote') {
    F.push(fieldRow('Mode', mkSelect(draft, 'mode', [['load', 'New quote every tab'], ['rotate', 'Rotate while open']])));
    F.push(fieldRow('Rotate every', mkRange(draft, 'rotateSec', 5, 120, 5, v => v + 's')));
    F.push(quotesEditor(getQuotes, setQuotes));
  } else if (type === 'spotify') {
    F.push(fieldRow('Spotify link', mkText(draft, 'url', 'https://open.spotify.com/playlist/…')));
    F.push(elm('p', 'hint', 'In Spotify: … menu → Share → Copy link. Tracks, playlists, albums & podcasts work. Be logged into Spotify in Chrome for full playback.'));
  }
  return F;
}

function linksEditor(draft) {
  const wrap = div('');
  wrap.append(elm('h3', '', 'Quick links'));
  const list = div('link-rows');
  function render() {
    list.textContent = '';
    draft.links.forEach((l, i) => {
      const row = div('link-row');
      const lab = document.createElement('input'); lab.type = 'text'; lab.placeholder = 'Label'; lab.value = l.label || '';
      lab.addEventListener('input', () => l.label = lab.value);
      const url = document.createElement('input'); url.type = 'text'; url.placeholder = 'https://…'; url.value = l.url || '';
      url.addEventListener('input', () => l.url = url.value);
      const del = elm('button', 'btn small', '✕');
      del.addEventListener('click', () => { draft.links.splice(i, 1); render(); });
      row.append(lab, url, del);
      list.append(row);
    });
  }
  const add = elm('button', 'btn', '＋ Add link');
  add.addEventListener('click', () => { draft.links.push({ label: '', url: '' }); render(); });
  wrap.append(list, add);
  return wrap;
}

function launchpadEditor(draft) {
  const wrap = div('');
  wrap.append(elm('h3', '', 'Sites (max 10)'));
  const counter = elm('p', 'hint', ''); counter.style.margin = '0 0 8px';
  const list = div('link-rows');
  const addBtn = elm('button', 'btn', '＋ Add site');
  function render() {
    list.textContent = '';
    draft.tiles.forEach((t, i) => {
      const row = div('link-row');
      const lab = document.createElement('input'); lab.type = 'text'; lab.placeholder = 'Label'; lab.value = t.label || '';
      lab.addEventListener('input', () => t.label = lab.value);
      const url = document.createElement('input'); url.type = 'text'; url.placeholder = 'https://…'; url.value = t.url || '';
      url.addEventListener('input', () => t.url = url.value);
      const del = elm('button', 'btn small', '✕');
      del.addEventListener('click', () => { draft.tiles.splice(i, 1); render(); });
      row.append(lab, url, del);
      list.append(row);
    });
    counter.textContent = `${draft.tiles.length} / 10 sites`;
    addBtn.disabled = draft.tiles.length >= 10;
  }
  addBtn.addEventListener('click', () => {
    if (draft.tiles.length >= 10) return;
    draft.tiles.push({ label: '', url: '' });
    render();
  });
  wrap.append(counter, list, addBtn);
  return wrap;
}

function quotesEditor(getQ, setQ) {
  const wrap = div('');
  wrap.append(elm('h3', '', 'Your own quotes'));
  const ta = document.createElement('textarea');
  ta.rows = 5; ta.placeholder = 'One quote per line…';
  ta.value = getQ().join('\n');
  ta.addEventListener('input', () => setQ(ta.value.split('\n').map(s => s.trim()).filter(Boolean)));
  wrap.append(ta);
  wrap.append(elm('p', 'hint', 'These are mixed in with the built-in quotes.'));
  return wrap;
}

function openWidgetSettings(w) {
  const def = WIDGET_DEFS[w.type];
  const draft = JSON.parse(JSON.stringify(w.settings));
  let quotesDraft = state.quotesCustom.slice();

  const m = div('modal');
  m.append(elm('h2', '', `${def.icon} ${def.name} — settings`));
  for (const f of typeFields(w.type, draft, () => quotesDraft, q => quotesDraft = q)) m.append(f);

  if (def.hasStyle) {
    m.append(elm('h3', '', 'Appearance'));
    m.append(colorRow('Text color', draft, 'textColor'));
    m.append(fieldRow('Font size', mkRange(draft, 'fontSize', 12, 120)));
    m.append(colorRow('Background color', draft, 'bgColor'));
    m.append(fieldRow('Background opacity', mkRange(draft, 'bgOpacity', 0, 1, 0.01, v => Math.round(v * 100) + '%')));
    m.append(fieldRow('Corner radius', mkRange(draft, 'radius', 0, 48)));
  }

  const actions = div('modal-actions');
  const del = elm('button', 'btn danger', 'Delete widget');
  del.addEventListener('click', () => {
    if (!confirm('Delete this widget?')) return;
    const rt = runtime.get(w.id); if (rt && rt.destroy) rt.destroy();
    runtime.delete(w.id);
    state.widgets = state.widgets.filter(x => x.id !== w.id);
    scheduleSave(); closeAllModals(); renderWidgets();
  });
  const cancel = elm('button', 'btn', 'Cancel');
  cancel.addEventListener('click', closeAllModals);
  const save = elm('button', 'btn primary', 'Save');
  save.addEventListener('click', () => {
    w.settings = draft;
    if (w.type === 'quote') state.quotesCustom = quotesDraft;
    scheduleSave(); closeAllModals();
    rebuildWidget(w.id);
  });
  actions.append(del, cancel, save);
  m.append(actions);
  openModal(m);
}

function openAddPanel() {
  const m = div('modal');
  m.append(elm('h2', '', '➕ Add a widget'));
  const grid = div('add-grid');
  Object.entries(WIDGET_DEFS).forEach(([type, def]) => {
    const b = elm('button', 'add-item', `${def.icon}  ${def.name}`);
    b.addEventListener('click', () => { closeAllModals(); addWidget(type); });
    grid.append(b);
  });
  m.append(grid);
  m.append(elm('p', 'hint', 'Tip: press E to enter editor mode — drag widgets to move them, grab the bottom-right corner to resize, ⚙ opens per-widget options.'));
  openModal(m);
}

/* ---------------- global settings panel ---------------- */
let settingsOpen = false;

function refreshSettingsDynamic() {
  if (!settingsOpen) return;
  const b = state.background;
  const show = (id, on) => { const n = document.getElementById(id); if (n) n.style.display = on ? '' : 'none'; };
  show('row-g1', b.type === 'gradient');
  show('row-g2', b.type === 'gradient');
  show('row-angle', b.type === 'gradient');
  show('row-color', b.type === 'solid');
  show('row-blur', b.type === 'image' || b.type === 'video');
  const info = document.getElementById('bg-media-info');
  if (info) info.textContent = b.media?.name ? `Current: ${b.media.name}` : 'No media uploaded yet.';
}

function openSettings() {
  settingsOpen = true;
  const b = state.background, snd = state.sound;
  const m = div('modal');
  m.append(elm('h2', '', '🛠 New Tab Studio settings'));

  /* profile */
  m.append(elm('h3', '', 'Profile'));
  const nameIn = document.createElement('input');
  nameIn.type = 'text'; nameIn.value = state.profile.name; nameIn.placeholder = 'Your name';
  nameIn.addEventListener('input', () => { state.profile.name = nameIn.value; scheduleSave(); });
  m.append(fieldRow('Name (used by the greeting widget)', nameIn));

  /* background */
  m.append(elm('h3', '', 'Background'));
  const typeSel = document.createElement('select');
  [['gradient', 'Gradient'], ['solid', 'Solid color'], ['image', 'Image / GIF'], ['video', 'Video']].forEach(([v, l]) => typeSel.append(new Option(l, v)));
  typeSel.value = b.type;
  typeSel.addEventListener('change', () => {
    b.type = typeSel.value; scheduleSave(); renderBackground(); refreshSettingsDynamic();
    if ((b.type === 'image' || b.type === 'video') && !b.media) document.getElementById('file-bg').click();
  });
  m.append(fieldRow('Type', typeSel));

  const g1 = document.createElement('input'); g1.type = 'color'; g1.value = b.g1;
  g1.addEventListener('input', () => { b.g1 = g1.value; scheduleSave(); renderBackground(); });
  const rowG1 = fieldRow('Gradient start', g1); rowG1.id = 'row-g1'; m.append(rowG1);

  const g2 = document.createElement('input'); g2.type = 'color'; g2.value = b.g2;
  g2.addEventListener('input', () => { b.g2 = g2.value; scheduleSave(); renderBackground(); });
  const rowG2 = fieldRow('Gradient end', g2); rowG2.id = 'row-g2'; m.append(rowG2);

  const rowAngle = stateRangeRow('Gradient angle', b.angle, 0, 360, 5, v => { b.angle = v; scheduleSave(); renderBackground(); }, v => v + '°');
  rowAngle.id = 'row-angle'; m.append(rowAngle);

  const col = document.createElement('input'); col.type = 'color'; col.value = b.color;
  col.addEventListener('input', () => { b.color = col.value; scheduleSave(); renderBackground(); });
  const rowColor = fieldRow('Solid color', col); rowColor.id = 'row-color'; m.append(rowColor);

  const mediaGroup = div('field-group');
  const upBtn = elm('button', 'btn', '📁 Upload image / GIF / video');
  upBtn.addEventListener('click', () => document.getElementById('file-bg').click());
  const rmBtn = elm('button', 'btn danger small', 'Remove');
  rmBtn.addEventListener('click', removeBackgroundMedia);
  const mediaInfo = elm('span', 'hint', ''); mediaInfo.id = 'bg-media-info'; mediaInfo.style.margin = '0';
  mediaGroup.append(upBtn, rmBtn, mediaInfo);
  const rowMedia = fieldRow('Media', mediaGroup); rowMedia.id = 'row-media'; m.append(rowMedia);

  const rowBlur = stateRangeRow('Blur (image/video)', b.blur, 0, 20, 1, v => { b.blur = v; scheduleSave(); renderBackground(); }, v => v + 'px');
  rowBlur.id = 'row-blur'; m.append(rowBlur);
  m.append(stateRangeRow('Darken', b.darken, 0, 80, 1, v => { b.darken = v; scheduleSave(); renderBackground(); }, v => v + '%'));

  /* soundtrack */
  m.append(elm('h3', '', 'Soundtrack'));
  m.append(stateToggleRow('Try to autoplay on new tab', () => snd.autoplay, v => snd.autoplay = v));
  m.append(stateToggleRow('Shuffle', () => snd.shuffle, v => snd.shuffle = v));
  m.append(stateRangeRow('Volume', snd.volume, 0, 1, 0.01, v => { snd.volume = v; audioEl.volume = v; }, v => Math.round(v * 100) + '%'));

  const impRow = div('field-group');
  const impBtn = elm('button', 'btn', '🎵 Import audio files');
  impBtn.addEventListener('click', () => document.getElementById('file-audio').click());
  const counter = elm('span', 'hint', ''); counter.id = 'sp-track-count'; counter.style.margin = '0';
  const clearBtn = elm('button', 'btn danger small', 'Clear all');
  clearBtn.addEventListener('click', async () => {
    if (!confirm('Remove all soundtrack tracks?')) return;
    for (const t of tracks()) { try { await dbDelete(t.id); } catch (e) {} }
    state.sound.tracks = [];
    audioEl.pause(); audioEl.removeAttribute('src');
    currentTrackId = null; playingIndex = -1;
    if (currentUrl) { URL.revokeObjectURL(currentUrl); currentUrl = null; }
    scheduleSave(); renderTrackLists(); updateMusicCtrls();
  });
  impRow.append(impBtn, counter, clearBtn);
  m.append(fieldRow('Library', impRow));

  const trackBox = div(''); trackBox.id = 'sp-tracks'; trackBox.style.maxHeight = '180px'; trackBox.style.overflow = 'auto';
  m.append(trackBox);
  m.append(elm('p', 'hint', 'Max 50 files • each must be ≤ 8 minutes • files are stored locally in your browser (IndexedDB), never uploaded anywhere.'));

  /* data */
  m.append(elm('h3', '', 'Data'));
  const dataRow = div('field-group');
  const expBtn = elm('button', 'btn', '⬇ Export backup');
  expBtn.addEventListener('click', exportBackup);
  const impBk = elm('button', 'btn', '⬆ Import backup');
  impBk.addEventListener('click', () => document.getElementById('file-backup').click());
  const resetBtn = elm('button', 'btn danger', 'Reset everything');
  resetBtn.addEventListener('click', resetAll);
  dataRow.append(expBtn, impBk, resetBtn);
  m.append(fieldRow('Backup', dataRow));
  m.append(elm('p', 'hint', 'Backups save your layout & settings. Media files (background + music) are not included in backups.'));

  const actions = div('modal-actions');
  const done = elm('button', 'btn primary', 'Done');
  done.addEventListener('click', closeAllModals);
  actions.append(done);
  m.append(actions);

  refreshSettingsDynamic();
  renderTrackLists();
  openModal(m);
}

function exportBackup() {
  const data = JSON.stringify({ app: 'newtab-studio', version: 1, exportedAt: new Date().toISOString(), state }, null, 2);
  const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  const a = elm('a'); a.href = url; a.download = 'newtab-studio-backup.json';
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

async function importBackup(file) {
  try {
    const data = JSON.parse(await file.text());
    if (!data.state || !Array.isArray(data.state.widgets)) throw new Error('bad file');
    await chrome.storage.local.set({ settings: data.state });
    location.reload();
  } catch {
    toast('That backup file doesn\'t look valid.');
  }
}

async function resetAll() {
  if (!confirm('Reset everything? This deletes your layout, settings and all imported media.')) return;
  try { indexedDB.deleteDatabase(DB_NAME); } catch (e) {}
  try { await chrome.storage.local.clear(); } catch (e) {}
  location.reload();
}

/* ---------------- edit mode & keyboard ---------------- */
function toggleEdit(force) {
  const on = force !== undefined ? force : !document.body.classList.contains('editing');
  document.body.classList.toggle('editing', on);
  const btn = document.getElementById('btn-edit');
  btn.textContent = on ? '✅ Done' : '✏️ Edit layout';
  btn.classList.toggle('active', on);
  if (on) toast('Editor mode: drag to move • bottom-right corner resizes • ⚙ per-widget options', 3800);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeAllModals(); return; }
  const t = e.target;
  if (t && (t.matches('input,textarea,select') || t.isContentEditable)) return;
  if (e.key.toLowerCase() === 'e') { e.preventDefault(); toggleEdit(); }
});

/* ---------------- first-run layout ---------------- */
function seedDefaults() {
  const put = (type, px, py) => {
    const def = WIDGET_DEFS[type];
    state.widgets.push({ id: uid(), type, visible: true, w: def.w, h: def.h, x: px, y: py, settings: defaultSettingsFor(type) });
  };
  const cx = w => clamp(50 - (w / innerWidth) * 50, 1, 85);
  put('clock', cx(460), 16);
  put('greeting', cx(460), 35);
  put('search', cx(520), 48);
  put('quote', cx(480), 63);
  put('music', clamp(100 - (340 / innerWidth) * 100 - 1.5, 1, 85), clamp(100 - (176 / innerHeight) * 100 - 3, 1, 85));
}

/* ---------------- init ---------------- */
(async function init() {
  state = await loadState();
  if (!state.widgets.length) seedDefaults();

  document.getElementById('btn-edit').addEventListener('click', () => toggleEdit());
  document.getElementById('btn-settings').addEventListener('click', openSettings);
  document.getElementById('btn-add').addEventListener('click', openAddPanel);
  document.getElementById('file-audio').addEventListener('change', e => { importAudioFiles(e.target.files); e.target.value = ''; });
  document.getElementById('file-bg').addEventListener('change', e => { const f = e.target.files[0]; if (f) setBackgroundFile(f); e.target.value = ''; });
  document.getElementById('file-backup').addEventListener('change', e => { const f = e.target.files[0]; if (f) importBackup(f); e.target.value = ''; });

  audioEl.volume = state.sound.volume;
  renderWidgets();
  await renderBackground();

  setInterval(() => runtime.forEach(rt => rt.tick && rt.tick()), 250);

  if (state.sound.autoplay && tracks().length) {
    setTimeout(() => playIndex(clamp(state.sound.lastIndex || 0, 0, tracks().length - 1)).catch(blockedHint), 300);
  }
})();