/**
 * mindWordLibrary.js
 *
 * 40 curated words across four categories, plus weapon suggestions
 * (verse / prayer / reset / question) for each word.
 *
 * Full suggestions for 10 primary words.
 * All others fall back to _default.
 * getWeaponSuggestions(word, category) always appends "Write your own →".
 */

// ── Master word list ──────────────────────────────────────────────────────────

export const WORD_LIBRARY = [
  // POSTURE — calm, grounded, present
  { word: 'Anchored',   category: 'Posture' },
  { word: 'Still',      category: 'Posture' },
  { word: 'Present',    category: 'Posture' },
  { word: 'Steady',     category: 'Posture' },
  { word: 'Grounded',   category: 'Posture' },
  { word: 'Settled',    category: 'Posture' },
  { word: 'Rooted',     category: 'Posture' },
  { word: 'Quiet',      category: 'Posture' },
  { word: 'Unhurried',  category: 'Posture' },
  { word: 'Peaceful',   category: 'Posture' },

  // STRENGTH — resolve, courage, focus
  { word: 'Focused',      category: 'Strength' },
  { word: 'Steadfast',    category: 'Strength' },
  { word: 'Resolved',     category: 'Strength' },
  { word: 'Disciplined',  category: 'Strength' },
  { word: 'Intentional',  category: 'Strength' },
  { word: 'Watchful',     category: 'Strength' },
  { word: 'Sharp',        category: 'Strength' },
  { word: 'Immovable',    category: 'Strength' },
  { word: 'Unyielding',   category: 'Strength' },
  { word: 'Locked',       category: 'Strength' },

  // FAITH — surrender, trust, humility
  { word: 'Surrendered', category: 'Faith' },
  { word: 'Trusting',    category: 'Faith' },
  { word: 'Grateful',    category: 'Faith' },
  { word: 'Humble',      category: 'Faith' },
  { word: 'Obedient',    category: 'Faith' },
  { word: 'Faithful',    category: 'Faith' },
  { word: 'Expectant',   category: 'Faith' },
  { word: 'Open',        category: 'Faith' },
  { word: 'Yielded',     category: 'Faith' },
  { word: 'Dependent',   category: 'Faith' },

  // WARFARE — battle-ready, alert
  { word: 'Alert',        category: 'Warfare' },
  { word: 'Sober',        category: 'Warfare' },
  { word: 'Guarded',      category: 'Warfare' },
  { word: 'Armed',        category: 'Warfare' },
  { word: 'Discerning',   category: 'Warfare' },
  { word: 'Vigilant',     category: 'Warfare' },
  { word: 'Clearheaded',  category: 'Warfare' },
  { word: 'Resistant',    category: 'Warfare' },
  { word: 'Unshaken',     category: 'Warfare' },
  { word: 'Fortified',    category: 'Warfare' },
]

export const ALL_WORDS = WORD_LIBRARY.map(w => w.word)

export function getWordCategory(word) {
  return WORD_LIBRARY.find(w => w.word === word)?.category ?? ''
}

// ── Weapon suggestions ────────────────────────────────────────────────────────
// Structure: weaponSuggestions[word][category] = string[]

const weaponSuggestions = {

  Anchored: {
    verse: [
      'Hebrews 6:19 — "We have this hope as an anchor for the soul, firm and secure."',
      'Psalm 62:6 — "He alone is my rock and my salvation; he is my fortress, I will not be shaken."',
      'Colossians 2:7 — "Rooted and built up in him, strengthened in the faith as you were taught."',
    ],
    prayer: [
      'Lord, I fix myself to You today. Hold me steady when everything around me tries to pull.',
      'When the current gets strong, remind me what I am anchored to.',
      'You are my anchor — not my plans, not my feelings, not how this day goes.',
    ],
    reset: [
      'Plant both feet flat on the floor. Breathe in for 4 counts, hold for 2, out for 4. Do it twice.',
      'Find one fixed point in the room. Hold your gaze on it for 30 seconds without moving.',
      'Sit or stand completely still for 60 seconds. Resist every impulse to adjust.',
    ],
    question: [
      'What am I allowing to move me that I should be unmoved by?',
      'If I were truly anchored, what would I stop reacting to today?',
      "What's threatening my footing right now that I haven't named yet?",
    ],
  },

  Still: {
    verse: [
      'Psalm 46:10 — "Be still and know that I am God."',
      'Exodus 14:14 — "The Lord will fight for you; you need only to be still."',
      'Isaiah 30:15 — "In quietness and trust is your strength."',
    ],
    prayer: [
      'Lord, quiet the noise in me. Let me be still enough to hear You before I react.',
      'I stop striving. I trust You to move what needs to move.',
      'Still my anxious mind today. You are God and I am not.',
    ],
    reset: [
      'Sit without your phone for 3 minutes. No input. No output. Just be.',
      'Close your eyes, slow your breathing, and refuse to speak for 60 seconds.',
      'Step outside. Stand still for 2 minutes. No agenda.',
    ],
    question: [
      'What am I rushing that God is asking me to wait on?',
      'What noise in my life is covering something I need to hear?',
      'When did I last experience actual stillness — and why has it been so long?',
    ],
  },

  Focused: {
    verse: [
      'Philippians 3:14 — "I press on toward the goal for the prize of the upward call of God."',
      'Proverbs 4:25 — "Let your eyes look straight ahead; fix your gaze directly before you."',
      'Matthew 6:22 — "If your eye is healthy, your whole body will be full of light."',
    ],
    prayer: [
      'Lord, narrow my attention to what matters today. Cut through the noise.',
      'Give me eyes for one thing at a time. I surrender the distraction.',
      'Set my mind like flint. Let nothing cheap steal what belongs to what matters.',
    ],
    reset: [
      'Write one sentence: what matters most today. Fold it and put it in your pocket.',
      'Close every tab. Set a 25-minute timer. Do one thing.',
      'Turn your phone face-down for the next 20 minutes. Start the work.',
    ],
    question: [
      "What am I spending attention on that doesn't deserve it?",
      'What would I accomplish today if nothing distracted me?',
      'Am I focused on what is urgent — or what is actually important?',
    ],
  },

  Steadfast: {
    verse: [
      '1 Corinthians 15:58 — "Be steadfast, immovable, always abounding in the work of the Lord."',
      'Psalm 112:7 — "He is not afraid of bad news; his heart is firm, trusting in the Lord."',
      'Isaiah 26:3 — "You keep him in perfect peace whose mind is stayed on you."',
    ],
    prayer: [
      'Lord, make me immovable today. Anchor my resolve in You, not in my feelings.',
      'When the pressure comes, let me not bend. Hold me upright.',
      'I choose steadfastness. Sustain that choice when I want to quit.',
    ],
    reset: [
      'Stand straight, feet shoulder-width, hands at sides. Hold that posture for 60 seconds.',
      "Say out loud: 'I will not be moved today.' Once. Mean it.",
      'Write your one commitment for today and read it twice before you put it down.',
    ],
    question: [
      'What have I been wavering on that actually needs a decision?',
      'What does giving up on this actually cost me?',
      'Who is watching how I hold up under this — and what are they seeing?',
    ],
  },

  Surrendered: {
    verse: [
      'Luke 22:42 — "Not my will, but yours, be done."',
      'Romans 12:1 — "Present your bodies as a living sacrifice, holy and acceptable to God."',
      'Proverbs 3:5-6 — "Trust in the Lord with all your heart and lean not on your own understanding."',
    ],
    prayer: [
      'Not my will but Yours. I release my grip on the outcome today.',
      'Lord, I stop trying to control what is Yours. I trust You with the result.',
      'I lay down my agenda. Take it. Do with this day what I cannot.',
    ],
    reset: [
      'Open both hands, palms up. Hold that position for 30 seconds.',
      "Write the thing you've been gripping. Put the paper down and walk away.",
      'Pray one sentence out loud with open hands. Mean it.',
    ],
    question: [
      "What am I still trying to control that I know I need to release?",
      'What would today look like if I actually trusted God with the outcome?',
      'Where is my grip too tight — and what am I afraid will happen if I open it?',
    ],
  },

  Intentional: {
    verse: [
      'Ephesians 5:15-16 — "Look carefully then how you walk, not as unwise but as wise, making the best use of the time."',
      'Proverbs 21:5 — "The plans of the diligent lead surely to abundance."',
      'Colossians 3:23 — "Whatever you do, work heartily, as for the Lord and not for men."',
    ],
    prayer: [
      "Lord, make every hour count today. Don't let me drift through this day asleep.",
      'Help me choose purpose over impulse at every decision point.',
      'I want today to mean something. Guide what I give my energy to.',
    ],
    reset: [
      'Before you pick up your phone, state your first intention for the day out loud.',
      'Block 30 minutes on your calendar right now for your most important task.',
      "Write tomorrow's one win before today ends.",
    ],
    question: [
      'Am I spending my time or investing it?',
      'What would a fully intentional version of today look like?',
      'What habit am I tolerating that is quietly costing me ground?',
    ],
  },

  Grateful: {
    verse: [
      '1 Thessalonians 5:18 — "Give thanks in all circumstances; for this is the will of God."',
      'Psalm 107:1 — "Give thanks to the Lord, for he is good; his love endures forever."',
      'Colossians 3:15 — "Let the peace of Christ rule in your hearts... and be thankful."',
    ],
    prayer: [
      'Lord, I choose gratitude before this day earns it. Thank You.',
      "Open my eyes to what You've already done. I have more than I am seeing.",
      'Shift my perspective from what is missing to what has already been given.',
    ],
    reset: [
      "Name 3 specific things — not generic — that you're grateful for right now. Say them out loud.",
      'Text one person today to thank them for something real.',
      "Write one sentence: 'I'm grateful for ___' and read it before each meal today.",
    ],
    question: [
      'What am I taking for granted right now?',
      'When did I last express genuine gratitude without needing something in return?',
      'What would change in me if I truly believed today was a gift?',
    ],
  },

  Alert: {
    verse: [
      '1 Peter 5:8 — "Be sober-minded; be watchful. Your adversary the devil prowls around like a roaring lion."',
      '1 Thessalonians 5:6 — "Let us not sleep, as others do, but let us keep awake and be sober."',
      "Nehemiah 4:9 — \"We prayed to our God and posted a guard day and night to meet this threat.\"",
    ],
    prayer: [
      'Lord, sharpen my discernment today. Show me what I keep missing.',
      'Keep my eyes open to what is actually happening beneath the surface.',
      "Don't let me sleepwalk through this day. Make me aware.",
    ],
    reset: [
      "Pause and name the top threat to your focus or peace today — out loud.",
      "Spend 2 minutes in silence asking: 'What am I missing right now?'",
      'Do 10 pushups. Raise your physical alertness, then re-engage.',
    ],
    question: [
      "What's sneaking up on me that I'm not taking seriously?",
      'Where have I let my guard down in the last week?',
      'What pattern keeps repeating that I keep refusing to address?',
    ],
  },

  Humble: {
    verse: [
      'Micah 6:8 — "What does the Lord require of you but to do justice, and to love kindness, and to walk humbly with your God?"',
      "Proverbs 11:2 — \"When pride comes, then comes disgrace, but with the humble is wisdom.\"",
      'James 4:10 — "Humble yourselves before the Lord, and he will exalt you."',
    ],
    prayer: [
      "Lord, keep me small enough to be useful today. Don't let pride blind me to what I need to see.",
      "I don't need to be right today. I need to be faithful.",
      'Remind me that every good thing in me came from You, not from me.',
    ],
    reset: [
      "Ask someone today: 'How can I help you?' and actually wait for the full answer.",
      "Before a hard conversation, pray: 'Make me a listener, not a debater.'",
      'Write one area where you have been operating in pride this week. Be honest.',
    ],
    question: [
      'Where is my pride getting in the way of my growth right now?',
      'Who do I need to apologize to — and why am I still waiting?',
      'Am I more concerned with being respected or being actually useful?',
    ],
  },

  Disciplined: {
    verse: [
      '1 Corinthians 9:27 — "I discipline my body and keep it under control."',
      'Hebrews 12:11 — "No discipline seems pleasant at the time, but painful. Later on, however, it produces a harvest of righteousness."',
      '2 Timothy 1:7 — "God gave us a spirit not of fear but of power and love and self-control."',
    ],
    prayer: [
      'Lord, give me power over my impulses today. Where I am weak, be my strength.',
      "Help me do what I said I would do, even when I don't feel like it.",
      'Make discipline feel like freedom — not punishment.',
    ],
    reset: [
      "Do the one thing on your list you've been avoiding. Start now. Just 5 minutes.",
      "Write 'I said I would ___' and do it in the next hour.",
      'Cold water on your face. Now go do the hard thing.',
    ],
    question: [
      'What have I been tolerating that a disciplined man would eliminate?',
      'What promise did I make to myself that I have been quietly breaking?',
      'What would change in 90 days if I did the hard thing every single day?',
    ],
  },

  // ── Default (applies to all other words) ─────────────────────────────────
  _default: {
    verse: [
      'Psalm 119:105 — "Your word is a lamp to my feet and a light to my path."',
      'Philippians 4:13 — "I can do all things through Christ who strengthens me."',
      'Isaiah 41:10 — "Fear not, for I am with you; be not dismayed, for I am your God."',
    ],
    prayer: [
      'Lord, let this word define how I move through today.',
      'Shape my responses, my thoughts, and my choices around this posture.',
      'When I drift from this word today, bring me back.',
    ],
    reset: [
      'Take 3 slow breaths. On each exhale, say your word quietly.',
      'Step outside for 60 seconds. Come back with fresh eyes.',
      'Write your word somewhere you will see it. Let it interrupt you.',
    ],
    question: [
      'Am I living this word right now, or just thinking about it?',
      'What would change today if this word became action?',
      'Who in my life needs to see this word lived out?',
    ],
  },
}

/**
 * Returns suggestion strings for a given word + weapon category.
 * Always appends "Write your own →" as the final option.
 *
 * @param {string} word
 * @param {'verse'|'prayer'|'reset'|'question'} category
 * @returns {string[]}
 */
export function getWeaponSuggestions(word, category) {
  const wordEntry = weaponSuggestions[word] ?? weaponSuggestions._default
  const suggestions = (wordEntry[category] ?? weaponSuggestions._default[category]) ?? []
  return [...suggestions, 'Write your own →']
}

export default WORD_LIBRARY
