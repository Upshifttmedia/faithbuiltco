/**
 * Curated ESV passages for the Bible Study feature — John 1–21.
 * One entry per chapter; each has a focused passage + study question.
 * Questions rotate through 5 types so the user encounters each angle
 * across the 21 chapters.
 */

const QUESTIONS = [
  'What does this passage reveal about who Jesus is?',
  "What does this passage reveal about God's character?",
  'What does this teach about faith or obedience?',
  'How should this passage change the way you live today?',
  'What does this show about human nature and our need for grace?',
]

const biblePassages = [
  {
    book: 'John',
    chapter: 1,
    verse: 'John 1:1–5, 14',
    text:
      'In the beginning was the Word, and the Word was with God, and the Word was God. He was in the beginning with God. All things were made through him, and without him was not any thing made that was made. In him was life, and the life was the light of men. The light shines in the darkness, and the darkness has not overcome it.\n\n…And the Word became flesh and dwelt among us, and we have seen his glory, glory as of the only Son from the Father, full of grace and truth.',
    question: QUESTIONS[0],
  },
  {
    book: 'John',
    chapter: 2,
    verse: 'John 2:7–11',
    text:
      'Jesus said to the servants, "Fill the jars with water." And they filled them up to the brim. And he said to them, "Now draw some out and take it to the master of the feast." So they took it. When the master of the feast tasted the water now become wine, and did not know where it came from (though the servants who had drawn the water knew), the master of the feast called the bridegroom and said to him, "Everyone serves the good wine first, and when people have drunk freely, then the poor wine. But you have kept the good wine until now." This, the first of his signs, Jesus did at Cana in Galilee, and manifested his glory. And his disciples believed in him.',
    question: QUESTIONS[1],
  },
  {
    book: 'John',
    chapter: 3,
    verse: 'John 3:3, 16–17',
    text:
      'Jesus answered him, "Truly, truly, I say to you, unless one is born again he cannot see the kingdom of God."\n\n…For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life. For God did not send his Son into the world to condemn the world, but in order that the world might be saved through him.',
    question: QUESTIONS[2],
  },
  {
    book: 'John',
    chapter: 4,
    verse: 'John 4:13–14, 23–24',
    text:
      'Jesus said to her, "Everyone who drinks of this water will be thirsty again, but whoever drinks of the water that I will give him will never be thirsty again. The water that I will give him will become in him a spring of water welling up to eternal life."\n\n…"But the hour is coming, and is now here, when the true worshipers will worship the Father in spirit and truth, for the Father is seeking such people to worship him. God is spirit, and those who worship him must worship in spirit and truth."',
    question: QUESTIONS[3],
  },
  {
    book: 'John',
    chapter: 5,
    verse: 'John 5:24, 39–40',
    text:
      '"Truly, truly, I say to you, whoever hears my word and believes him who sent me has eternal life. He does not come into judgment, but has passed from death to life."\n\n…"You search the Scriptures because you think that in them you have eternal life; and it is they that bear witness about me, yet you refuse to come to me that you may have life."',
    question: QUESTIONS[4],
  },
  {
    book: 'John',
    chapter: 6,
    verse: 'John 6:35, 47–51',
    text:
      'Jesus said to them, "I am the bread of life; whoever comes to me shall not hunger, and whoever believes in me shall never thirst."\n\n…"Truly, truly, I say to you, whoever believes has eternal life. I am the bread of life. Your fathers ate the manna in the wilderness, and they died. This is the bread that comes down from heaven, so that one may eat of it and not die. I am the living bread that came down from heaven. If anyone eats of this bread, he will live forever. And the bread that I will give for the life of the world is my flesh."',
    question: QUESTIONS[0],
  },
  {
    book: 'John',
    chapter: 7,
    verse: 'John 7:37–39',
    text:
      'On the last day of the feast, the great day, Jesus stood up and cried out, "If anyone thirsts, let him come to me and drink. Whoever believes in me, as the Scripture has said, \'Out of his heart will flow rivers of living water.\'" Now this he said about the Spirit, whom those who believed in him were to receive, for as yet the Spirit had not been given, because Jesus was not yet glorified.',
    question: QUESTIONS[1],
  },
  {
    book: 'John',
    chapter: 8,
    verse: 'John 8:12, 31–32, 36',
    text:
      'Again Jesus spoke to them, saying, "I am the light of the world. Whoever follows me will not walk in darkness, but will have the light of life."\n\n…So Jesus said to the Jews who had believed him, "If you abide in my word, you are truly my disciples, and you will know the truth, and the truth will set you free."\n\n…"So if the Son sets you free, you will be free indeed."',
    question: QUESTIONS[2],
  },
  {
    book: 'John',
    chapter: 9,
    verse: 'John 9:1–3, 25',
    text:
      'As he passed by, he saw a man blind from birth. And his disciples asked him, "Rabbi, who sinned, this man or his parents, that he was born blind?" Jesus answered, "It was not that this man sinned, or his parents, but that the works of God might be displayed in him."\n\n…He answered, "Whether he is a sinner I do not know. One thing I do know, that though I was blind, now I see."',
    question: QUESTIONS[3],
  },
  {
    book: 'John',
    chapter: 10,
    verse: 'John 10:10–11, 27–28',
    text:
      '"The thief comes only to steal and kill and destroy. I came that they may have life and have it abundantly. I am the good shepherd. The good shepherd lays down his life for the sheep."\n\n…"My sheep hear my voice, and I know them, and they follow me. I give them eternal life, and they will never perish, and no one will snatch them out of my hand."',
    question: QUESTIONS[4],
  },
  {
    book: 'John',
    chapter: 11,
    verse: 'John 11:25–26, 35, 43–44',
    text:
      'Jesus said to her, "I am the resurrection and the life. Whoever believes in me, though he die, yet shall he live, and everyone who lives and believes in me shall never die. Do you believe this?"\n\nJesus wept.\n\n…When he had said these things, he cried out with a loud voice, "Lazarus, come out." The man who had died came out, his hands and feet bound with linen strips, and his face wrapped with a cloth. Jesus said to them, "Unbind him, and let him go."',
    question: QUESTIONS[0],
  },
  {
    book: 'John',
    chapter: 12,
    verse: 'John 12:24–26',
    text:
      '"Truly, truly, I say to you, unless a grain of wheat falls into the earth and dies, it remains alone; but if it dies, it bears much fruit. Whoever loves his life loses it, and whoever hates his life in this world will keep it for eternal life. If anyone serves me, he must follow me; and where I am, there will my servant be also. If anyone serves me, the Father will honor him."',
    question: QUESTIONS[1],
  },
  {
    book: 'John',
    chapter: 13,
    verse: 'John 13:14–15, 34–35',
    text:
      '"If I then, your Lord and Teacher, have washed your feet, you also ought to wash one another\'s feet. For I have given you an example, that you also should do just as I have done to you."\n\n…"A new commandment I give to you, that you love one another: just as I have loved you, you also are to love one another. By this all people will know that you are my disciples, if you have love for one another."',
    question: QUESTIONS[2],
  },
  {
    book: 'John',
    chapter: 14,
    verse: 'John 14:1–3, 6, 27',
    text:
      '"Let not your hearts be troubled. Believe in God; believe also in me. In my Father\'s house are many rooms. If it were not so, would I have told you that I go to prepare a place for you? And if I go and prepare a place for you, I will come again and will take you to myself, that where I am you may be also."\n\n…Jesus said to him, "I am the way, and the truth, and the life. No one comes to the Father except through me."\n\n…"Peace I leave with you; my peace I give to you. Not as the world gives do I give to you. Let not your hearts be troubled, neither let them be afraid."',
    question: QUESTIONS[3],
  },
  {
    book: 'John',
    chapter: 15,
    verse: 'John 15:1–5, 13',
    text:
      '"I am the true vine, and my Father is the vinedresser. Every branch in me that does not bear fruit he takes away, and every branch that does bear fruit he prunes, that it may bear more fruit. Already you are clean because of the word that I have spoken to you. Abide in me, and I in you. As the branch cannot bear fruit by itself, unless it abides in the vine, neither can you, unless you abide in me. I am the vine; you are the branches. Whoever abides in me and I in him, he it is that bears much fruit, for apart from me you can do nothing."\n\n…"Greater love has no one than this, that someone lay down his life for his friends."',
    question: QUESTIONS[4],
  },
  {
    book: 'John',
    chapter: 16,
    verse: 'John 16:13, 33',
    text:
      '"When the Spirit of truth comes, he will guide you into all the truth, for he will not speak on his own authority, but whatever he hears he will speak, and he will declare to you the things that are to come."\n\n…"I have said these things to you, that in me you may have peace. In the world you will have tribulation. But take heart; I have overcome the world."',
    question: QUESTIONS[0],
  },
  {
    book: 'John',
    chapter: 17,
    verse: 'John 17:3, 15–17',
    text:
      '"And this is eternal life, that they know you, the only true God, and Jesus Christ whom you have sent."\n\n…"I do not ask that you take them out of the world, but that you keep them from the evil one. They are not of the world, just as I am not of the world. Sanctify them in the truth; your word is truth."',
    question: QUESTIONS[1],
  },
  {
    book: 'John',
    chapter: 18,
    verse: 'John 18:36–37',
    text:
      'Jesus answered, "My kingdom is not of this world. If my kingdom were of this world, my servants would have been fighting, that I might not be delivered over to the Jews. But my kingdom is not from the world." Then Pilate said to him, "So you are a king?" Jesus answered, "You say that I am a king. For this purpose I was born and for this purpose I have come into the world — to bear witness to the truth. Everyone who is of the truth listens to my voice."',
    question: QUESTIONS[2],
  },
  {
    book: 'John',
    chapter: 19,
    verse: 'John 19:28–30',
    text:
      'After this, Jesus, knowing that all was now finished, said (to fulfill the Scripture), "I thirst." A jar full of sour wine stood there, so they put a sponge full of the sour wine on a hyssop branch and held it to his mouth. When Jesus had received the sour wine, he said, "It is finished," and he bowed his head and gave up his spirit.',
    question: QUESTIONS[3],
  },
  {
    book: 'John',
    chapter: 20,
    verse: 'John 20:19–21, 27–28',
    text:
      'On the evening of that day, the first day of the week, the doors being locked where the disciples were for fear of the Jews, Jesus came and stood among them and said to them, "Peace be with you." When he had said this, he showed them his hands and his side. Then the disciples were glad when they saw the Lord. Jesus said to them again, "Peace be with you. As the Father has sent me, even so I am sending you."\n\n…Then he said to Thomas, "Put your finger here, and see my hands; and put out your hand, and place it in my side. Do not disbelieve, but believe." Thomas answered him, "My Lord and my God!"',
    question: QUESTIONS[4],
  },
  {
    book: 'John',
    chapter: 21,
    verse: 'John 21:15–17, 22',
    text:
      'When they had finished breakfast, Jesus said to Simon Peter, "Simon, son of John, do you love me more than these?" He said to him, "Yes, Lord; you know that I love you." He said to him, "Feed my lambs." He said to him a second time, "Simon, son of John, do you love me?" He said to him, "Yes, Lord; you know that I love you." He said to him, "Tend my sheep." He said to him the third time, "Simon, son of John, do you love me?" Peter was grieved because he said to him the third time, "Do you love me?" and he said to him, "Lord, you know everything; you know that I love you." Jesus said to him, "Feed my sheep."\n\n…Jesus said to him, "If it is my will that he remain until I come, what is that to you? You follow me!"',
    question: QUESTIONS[0],
  },
]

export default biblePassages

/**
 * Chapter counts for all 66 books — used by advanceChapter() in useBibleStudy.js
 * to know when to roll over to the next book.
 */
export const BOOK_CHAPTERS = {
  Genesis: 50, Exodus: 40, Leviticus: 27, Numbers: 36, Deuteronomy: 34,
  Joshua: 24, Judges: 21, Ruth: 4, '1 Samuel': 31, '2 Samuel': 24,
  '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36,
  Ezra: 10, Nehemiah: 13, Esther: 10, Job: 42, Psalms: 150,
  Proverbs: 31, Ecclesiastes: 12, 'Song of Solomon': 8,
  Isaiah: 66, Jeremiah: 52, Lamentations: 5, Ezekiel: 48,
  Daniel: 12, Hosea: 14, Joel: 3, Amos: 9, Obadiah: 1,
  Jonah: 4, Micah: 7, Nahum: 3, Habakkuk: 3, Zephaniah: 3,
  Haggai: 2, Zechariah: 14, Malachi: 4,
  Matthew: 28, Mark: 16, Luke: 24, John: 21, Acts: 28,
  Romans: 16, '1 Corinthians': 16, '2 Corinthians': 13, Galatians: 6,
  Ephesians: 6, Philippians: 4, Colossians: 4, '1 Thessalonians': 5,
  '2 Thessalonians': 3, '1 Timothy': 6, '2 Timothy': 4, Titus: 3,
  Philemon: 1, Hebrews: 13, James: 5, '1 Peter': 5, '2 Peter': 3,
  '1 John': 5, '2 John': 1, '3 John': 1, Jude: 1, Revelation: 22,
}

export const ALL_BOOKS = Object.keys(BOOK_CHAPTERS)
